// The film's demo loops (/film): the app screens under /demos (booking, the
// front desk, one entry, a tool of their own, reviews), captured a frame at a time
// into ../public/m/film/demo-*.
//
//   npm run demos                          every demo, every business, both sizes
//   npm run demos -- booking               one demo (booking | desk | entry | tool | reviews)
//   npm run demos -- booking winery        one business of it
//   npm run demos -- booking winery phone  one size of that (desktop | phone)
//   BASE=http://localhost:3102 npm run demos   from another server (default: this repo's dev server, on [::1]:3001,
//                                          reached as localhost:3001: see the browser's launch below)
//   JOBS=3 npm run demos                   how many to capture at once (default 2)
//
// Each demo page draws its flow as a pure function of one time (nothing on it
// keeps a clock of its own: components/elorro/demos/kit.tsx), and with
// ?capture it waits for window.__demo.seek(t). So, as for Pearls' site
// (scripts/pearls.mjs), every frame is drawn and captured in turn, with
// nothing dropped or doubled: desktop at 1440×900 and 1.5× (2160×1350, the
// masters' size), the phone at 390×488 and 3× (1170×1464, a 4:5 frame), 30
// frames a second from t = 0 to the flow's end. The captures go straight into
// a near-lossless master, encoded like the film's other loops
// (scripts/film.mjs): 1280×800 and 720×900 under 2 MB, SD cuts at 864×540 and
// 544×680 under 900 KB. The poster is the last frame, the flow's finished
// state (the film shows it under reduced motion); frame 0 is its "before".

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { CAP, OUT, ROOT, describe, encode, ffmpeg, probe } from "./encode.mjs";

const FILM = path.resolve(ROOT, "..", "public", "m", "film");
const BASE = process.env.BASE ?? "http://localhost:3001";
const JOBS = Math.max(1, Number(process.env.JOBS ?? 2));
const FPS = 30;

const ALL = ["winery", "dental", "contractor", "general"];
/** Each demo: its page, its files' prefix, and the businesses it's made for (a practice's tool is Clinical Scribe). */
const DEMOS = {
  booking: { route: "booking", prefix: "demo-booking", inds: ALL },
  desk: { route: "front-desk", prefix: "demo-desk", inds: ALL },
  entry: { route: "one-entry", prefix: "demo-entry", inds: ALL },
  tool: { route: "tool", prefix: "demo-tool", inds: ["winery", "contractor", "general"] },
  reviews: { route: "reviews", prefix: "demo-reviews", inds: ALL },
};
const SIZES = {
  desktop: { view: [1440, 900], dpr: 1.5, suffix: "d", hd: [1280, 800], sd: [864, 540], poster: [1280, 800] },
  phone: { view: [390, 488], dpr: 3, suffix: "m", hd: [720, 900], sd: [544, 680], poster: [720, 900] },
};

const [onlyDemo, onlyInd, onlySize] = process.argv.slice(2);
if (onlyDemo && !DEMOS[onlyDemo]) throw new Error(`No demo "${onlyDemo}". Try: ${Object.keys(DEMOS).join(", ")}`);
if (onlySize && !SIZES[onlySize]) throw new Error(`No size "${onlySize}". Try: desktop, phone`);
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(FILM, { recursive: true });

const jobs = [];
for (const [name, demo] of Object.entries(DEMOS)) {
  if (onlyDemo && onlyDemo !== name) continue;
  for (const ind of demo.inds) {
    if (onlyInd && onlyInd !== ind) continue;
    for (const [size, s] of Object.entries(SIZES)) {
      if (onlySize && onlySize !== size) continue;
      jobs.push({ name, demo, ind, size, s });
    }
  }
}
if (!jobs.length) throw new Error("Nothing to make: check the demo, business and size.");

// "localhost" is sent to [::1]: this repo's dev server listens there (plain localhost:3001 over IPv4 is
// another project's), and a page opened at http://[::1]:3001 is never hydrated (Next's dev-origin check),
// so window.__demo would never appear.
const browser = await chromium.launch({ args: ["--mute-audio", "--host-resolver-rules=MAP localhost [::1]"] });

/** One flow at one size: captured into its master, then encoded. */
async function make({ name, demo, ind, size, s }) {
  const base = `${demo.prefix}-${ind}-${s.suffix}`;
  const tag = `${name} ${ind} ${size}`;
  const context = await browser.newContext({ viewport: { width: s.view[0], height: s.view[1] }, deviceScaleFactor: s.dpr, reducedMotion: "no-preference" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  // Opened, and ready (a dev server compiles a page the first time it's asked for: one more try then).
  for (let attempt = 1; ; attempt++) {
    await page.goto(`${BASE}/demos/${demo.route}?for=${ind}&capture`, { waitUntil: "networkidle" });
    const ready = await page.waitForFunction(() => !!window.__demo, null, { timeout: 45000 }).then(() => true, () => false);
    if (ready) break;
    if (attempt === 3) throw new Error(`${tag}: the page never got ready (${errors.join("; ") || "no error"})`);
  }
  // (The dev server's own badge, should this be a dev server.)
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await page.evaluate(() => document.fonts.ready);
  const duration = await page.evaluate(() => window.__demo.duration);
  const frames = Math.round(duration * FPS) + 1;
  const master = path.join(OUT, `${base}-master.mp4`);
  const encoder = spawn(
    "npx",
    ["remotion", "ffmpeg", "-hide_banner", "-v", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "png", "-i", "-",
      "-c:v", "libx264", "-preset", "medium", "-crf", "4", "-pix_fmt", "yuv444p", master],
    { cwd: ROOT, stdio: ["pipe", "inherit", "inherit"] }
  );
  const finished = new Promise((resolve, reject) => encoder.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${tag}: ffmpeg exited ${code}`)))));
  let last;
  for (let i = 0; i < frames; i++) {
    // Draw the moment, then wait for it to be painted.
    await page.evaluate(async (t) => {
      window.__demo.seek(t);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }, Math.min(duration, i / FPS));
    last = await page.screenshot({ type: "png" });
    if (!encoder.stdin.write(last)) await new Promise((r) => encoder.stdin.once("drain", r));
    if (i % 60 === 0) console.log(`  ${tag}: frame ${i}/${frames}`);
  }
  encoder.stdin.end();
  await finished;
  await context.close();
  if (errors.length) console.log(`  ${tag}: page errors: ${errors.join("; ")}`);

  console.log(`  ${tag}: encoding`);
  const hd = path.join(FILM, `${base}.mp4`);
  const sd = path.join(FILM, `${base}-sd.mp4`);
  const a = encode(master, s.hd, hd, CAP.hd);
  const b = encode(master, s.sd, sd, CAP.sd);
  // The poster: the finished state, the last frame.
  const png = path.join(OUT, `${base}-poster.png`);
  fs.writeFileSync(png, last);
  const poster = path.join(FILM, `${base}-poster.jpg`);
  ffmpeg(["-i", png, "-vf", `scale=${s.poster[0]}:${s.poster[1]}:flags=lanczos`, "-q:v", "3", "-frames:v", "1", poster]);
  const v = probe(poster).streams[0];
  return [
    `${tag}: ${duration} s, ${frames} frames`,
    describe(hd, a),
    describe(sd, b),
    `${path.basename(poster).padEnd(22)} ${v.width}x${v.height} ${fs.statSync(poster).size} bytes (last frame, t = ${duration})`,
  ];
}

const report = [];
const queue = [...jobs];
await Promise.all(
  Array.from({ length: Math.min(JOBS, jobs.length) }, async () => {
    while (queue.length) {
      const job = queue.shift();
      console.log(`${job.name} ${job.ind} ${job.size}: capturing`);
      report.push(...(await make(job)));
    }
  })
);
await browser.close();
console.log("\n" + report.join("\n"));
