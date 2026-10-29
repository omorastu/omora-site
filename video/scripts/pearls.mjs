// The Pearls Farm Labor card's desktop loop, made again from its source: the
// live pearlsfarminc.com homepage, whose hero video is the motion in it.
//
//   npm run pearls
//
// The page is opened at 1440×900 and 1.5× (2160×1350, the same master size as
// the Remotion loops). Its hero video's own file is cut into its 534 frames,
// and each frame in turn is shown in the page in the video's place (an image
// with the video's box, fit and position; the video itself hidden) and the
// page captured, so the page draws every frame exactly as it draws the video,
// with nothing dropped or doubled. (A paused video sought frame by frame
// doesn't repaint in headless Chrome, so it can't be stepped through itself.)
// The captures go straight into a near-lossless master, encoded like every
// other loop: pearls-d.mp4 at 1280×800 under 2 MB and pearls-d-sd.mp4 at
// 864×540 under 900 KB, plus a new poster.
//
// The phone loop (pearls-m.mp4) is left as it is.

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { CAP, OUT, ROOT, WORK, describe, encode, ffmpeg } from "./encode.mjs";

const SITE = "https://www.pearlsfarminc.com";
const VIEW = { width: 1440, height: 900, dpr: 1.5 };
/** Where the page's frames are served from while it's captured. */
const FRAMES_URL = "https://pearls-frames.invalid/";

fs.mkdirSync(OUT, { recursive: true });
const master = path.join(OUT, "pearls-d-master.mp4");
const frameDir = path.join(OUT, "pearls-frames");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: VIEW.width, height: VIEW.height }, deviceScaleFactor: VIEW.dpr });
await page.goto(SITE, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

// The hero's video, the first on the page, and the file it's playing.
const source = await page.evaluate(() => {
  const v = document.querySelector("video");
  if (!v?.currentSrc) throw new Error("no hero video");
  v.pause();
  return v.currentSrc;
});

// Its frames, as near-lossless JPEGs at the file's own size.
const file = path.join(OUT, `pearls-${path.basename(new URL(source).pathname)}`);
if (!fs.existsSync(file)) fs.writeFileSync(file, Buffer.from(await (await fetch(source)).arrayBuffer()));
fs.rmSync(frameDir, { recursive: true, force: true });
fs.mkdirSync(frameDir);
ffmpeg(["-i", file, "-q:v", "1", "-qmin", "1", path.join(frameDir, "%04d.jpg")]);
const frames = fs.readdirSync(frameDir).filter((f) => f.endsWith(".jpg")).sort();
console.log(`pearls: ${frames.length} frames from ${path.basename(file)}`);

await page.route(`${FRAMES_URL}*`, (route) =>
  route.fulfill({ contentType: "image/jpeg", body: fs.readFileSync(path.join(frameDir, path.basename(new URL(route.request().url()).pathname))) })
);

// An image standing in for the video: in its box, with its fit and position,
// and fully opaque (paused, the site fades the video out over its poster).
await page.evaluate(() => {
  const v = document.querySelector("video");
  const cs = getComputedStyle(v);
  const img = document.createElement("img");
  img.id = "pearls-frame";
  img.alt = "";
  for (const prop of ["position", "top", "right", "bottom", "left", "width", "height", "object-fit", "object-position", "z-index", "border-radius", "transform", "display", "max-width", "max-height", "min-width", "min-height", "margin"]) {
    img.style.setProperty(prop, cs.getPropertyValue(prop));
  }
  img.style.opacity = "1";
  v.after(img);
  v.style.visibility = "hidden";
});

// Shows frame `name` and waits until it's decoded and painted.
const show = (name) =>
  page.evaluate(
    async (url) => {
      const img = document.getElementById("pearls-frame");
      img.src = url;
      await img.decode();
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    },
    FRAMES_URL + name
  );

const encoder = spawn(
  "npx",
  ["remotion", "ffmpeg", "-hide_banner", "-v", "error", "-y", "-f", "image2pipe", "-framerate", "30", "-c:v", "png", "-i", "-",
    "-c:v", "libx264", "-preset", "medium", "-crf", "4", "-pix_fmt", "yuv444p", master],
  { cwd: ROOT, stdio: ["pipe", "inherit", "inherit"] }
);
const finished = new Promise((resolve, reject) => encoder.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)))));

for (const [i, name] of frames.entries()) {
  await show(name);
  const png = await page.screenshot({ type: "png" });
  if (!encoder.stdin.write(png)) await new Promise((r) => encoder.stdin.once("drain", r));
  if (i % 60 === 0) console.log(`  frame ${i}/${frames.length}`);
}
encoder.stdin.end();
await finished;
await browser.close();
fs.rmSync(frameDir, { recursive: true, force: true });

console.log("pearls: encoding");
const hd = path.join(WORK, "pearls-d.mp4");
const sd = path.join(WORK, "pearls-d-sd.mp4");
const a = encode(master, [1280, 800], hd, CAP.hd);
const b = encode(master, [864, 540], sd, CAP.sd);
// The poster is the first frame, as the loop's is.
ffmpeg(["-i", master, "-vf", "scale=960:600:flags=lanczos", "-q:v", "3", "-frames:v", "1", path.join(WORK, "pearls-d-poster.jpg")]);
console.log("\n" + [describe(hd, a), describe(sd, b)].join("\n"));
