// Pearls Farm Labor's Photo & video card, made again from its source: Jordan's
// drone footage, the hero video on pearlsfarminc.com. It's the card on the
// Photo & video service page and in /work's Photo & video group
// (`serviceMedia` in lib/elorro.ts); the home page's card is pearls.mjs's.
//
//   npm run pearls-drone
//
// Source: home-two-angle-graded-v6-16x9.mp4 (2560×1440, 29.97 fps, 17.8 s),
// downloaded once into out/. It holds two shots: a push along the vine rows
// (0 to 4.9 s), then, after a dissolve, a crew at work in the rows (5.3 s to
// 17.0 s), which dissolves back to the start.
//
// Timings: the cut is the crew, 5.4 s to 14.4 s. Its last second (13.4 s to
// 14.4 s) dissolves into its first (5.4 s to 6.4 s), so the loop is 8 s and
// plays round without a jump; it opens on 6.4 s, which is also the poster.
//
// Both sizes are crops of the same wide frame. The site's 9:16 version is
// framed too tight for 4:5: it leaves most of the crew out.
//   16:10  2304×1440 from x 128
//   4:5    1152×1440 from x 960
//
// Remotion's ffmpeg has no filter that mixes two pictures, so the dissolve is
// mixed here: both stretches are decoded to raw frames, the last 30 of the
// loop are blended with the first 30 of the crew (the weights ffmpeg's xfade
// uses), and the frames are encoded straight into a lossless master.
//
// Into ../public/m/work/, encoded like every other loop (encode.mjs):
//   pearls-drone-d.mp4         1280×800, under 2 MB
//   pearls-drone-d-sd.mp4      864×540, under 900 KB
//   pearls-drone-m.mp4         720×900, under 2 MB
//   pearls-drone-m-sd.mp4      544×680, under 900 KB
//   pearls-drone-d-poster.jpg  1280×800, the loop's first frame
//   pearls-drone-m-poster.jpg  800×1000, the loop's first frame

import { spawn } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs";
import path from "node:path";
import { CAP, OUT, ROOT, WORK, describe, encode, ffmpeg } from "./encode.mjs";

const SOURCE = "https://www.pearlsfarminc.com/pearls-release/video/home-two-angle-graded-v6-16x9.mp4";
/** The source's frame rate. */
const FPS = 30000 / 1001;
/** Where the crew's stretch starts in the source, in seconds; the loop's length; the dissolve that closes it. */
const START = 5.4;
const LOOP = 8;
const FADE = 1;
/** Each size: its crop of the source frame (w, h, x, y), then the poster, the loop and its SD cut. */
const SIZES = {
  d: { crop: [2304, 1440, 128, 0], poster: [1280, 800], hd: [1280, 800], sd: [864, 540] },
  m: { crop: [1152, 1440, 960, 0], poster: [800, 1000], hd: [720, 900], sd: [544, 680] },
};

/** Remotion's ffmpeg with its frames on a pipe: out of it (decoding) or into it (encoding). */
const piped = (args, into = false) =>
  spawn("npx", ["remotion", "ffmpeg", "-hide_banner", "-v", "error", "-y", ...args], {
    cwd: ROOT,
    stdio: into ? ["pipe", "ignore", "inherit"] : ["ignore", "pipe", "inherit"],
  });
const done = (proc) => new Promise((resolve, reject) => proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)))));

/** A raw stream, one whole frame (`bytes` long) at a time. */
async function* framesOf(stream, bytes) {
  let frame = Buffer.allocUnsafe(bytes);
  let filled = 0;
  for await (const chunk of stream) {
    for (let at = 0; at < chunk.length; ) {
      const n = Math.min(bytes - filled, chunk.length - at);
      chunk.copy(frame, filled, at, at + n);
      filled += n;
      at += n;
      if (filled === bytes) {
        yield frame;
        frame = Buffer.allocUnsafe(bytes);
        filled = 0;
      }
    }
  }
}

/**
 * The start of an AVI holding `frames` raw yuv420p pictures of w×h at 30000/1001
 * fps, each to follow as a "00db" chunk: how raw frames go into Remotion's
 * ffmpeg, which can read them as AVI but not bare.
 */
function aviHead(w, h, frames, bytes) {
  const u32 = (n) => { const b = Buffer.alloc(4); b.writeUInt32LE(n); return b; };
  const chunk = (id, data) => Buffer.concat([Buffer.from(id), u32(data.length), data]);
  const list = (type, ...parts) => chunk("LIST", Buffer.concat([Buffer.from(type), ...parts]));
  const avih = Buffer.alloc(56);
  avih.writeUInt32LE(Math.round(1e6 / FPS), 0); // µs per frame
  avih.writeUInt32LE(frames, 16);
  avih.writeUInt32LE(1, 24); // streams
  avih.writeUInt32LE(bytes, 28);
  avih.writeUInt32LE(w, 32);
  avih.writeUInt32LE(h, 36);
  const strh = Buffer.alloc(56);
  strh.write("vids", 0);
  strh.write("I420", 4);
  strh.writeUInt32LE(1001, 20); // scale
  strh.writeUInt32LE(30000, 24); // rate
  strh.writeUInt32LE(frames, 32);
  strh.writeUInt32LE(bytes, 36);
  strh.writeInt32LE(-1, 40); // quality
  strh.writeInt16LE(w, 52);
  strh.writeInt16LE(h, 54);
  const strf = Buffer.alloc(40); // BITMAPINFOHEADER
  strf.writeUInt32LE(40, 0);
  strf.writeInt32LE(w, 4);
  strf.writeInt32LE(h, 8);
  strf.writeUInt16LE(1, 12);
  strf.writeUInt16LE(12, 14);
  strf.write("I420", 16);
  strf.writeUInt32LE(bytes, 20);
  const hdrl = list("hdrl", chunk("avih", avih), list("strl", chunk("strh", strh), chunk("strf", strf)));
  const movi = 4 + frames * (8 + bytes);
  return Buffer.concat([Buffer.from("RIFF"), u32(4 + hdrl.length + 8 + movi), Buffer.from("AVI "), hdrl, Buffer.from("LIST"), u32(movi), Buffer.from("movi")]);
}

/**
 * The loop's lossless master for one crop: the crew from START + FADE for
 * LOOP seconds, its last FADE seconds dissolving into the crew from START, so
 * its last frame leads straight back into its first.
 */
async function makeMaster([w, h, x, y], master) {
  const total = Math.round(LOOP * FPS);
  const fade = Math.round(FADE * FPS);
  const bytes = (w * h * 3) / 2; // yuv420p, an even number for every size here
  const decode = (from, count) =>
    piped(["-ss", String(from), "-i", file, "-frames:v", String(count), "-vf", `crop=${w}:${h}:${x}:${y}`,
      "-pix_fmt", "yuv420p", "-f", "image2pipe", "-c:v", "rawvideo", "-"]);
  const loop = decode(START + FADE, total);
  const head = decode(START, fade);
  const out = piped(
    ["-f", "avi", "-i", "-", "-an", "-c:v", "libx264", "-preset", "ultrafast", "-qp", "0", "-pix_fmt", "yuv420p",
      // Raw frames carry no colour tags: the source's.
      "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", master],
    true
  );
  const ends = [done(loop), done(head), done(out)];
  const write = async (buf) => { if (!out.stdin.write(buf)) await once(out.stdin, "drain"); };
  await write(aviHead(w, h, total, bytes));
  const frameHead = Buffer.concat([Buffer.from("00db"), Buffer.alloc(4)]);
  frameHead.writeUInt32LE(bytes, 4);
  const heads = framesOf(head.stdout, bytes);
  let i = 0;
  for await (const frame of framesOf(loop.stdout, bytes)) {
    let picture = frame;
    if (i >= total - fade) {
      const { value: start } = await heads.next();
      // ffmpeg's xfade fade: the second picture's share grows with the time into the dissolve.
      const mix = (i - (total - fade)) / (FADE * FPS);
      picture = Buffer.allocUnsafe(bytes);
      for (let p = 0; p < bytes; p++) picture[p] = Math.round(frame[p] * (1 - mix) + start[p] * mix);
    }
    await write(frameHead);
    await write(picture);
    i++;
  }
  out.stdin.end();
  await Promise.all(ends);
  if (i !== total) throw new Error(`expected ${total} frames, got ${i}`);
}

fs.mkdirSync(OUT, { recursive: true });
const file = path.join(OUT, `pearls-${path.basename(new URL(SOURCE).pathname)}`);
if (!fs.existsSync(file)) {
  console.log(`pearls-drone: downloading ${path.basename(file)}`);
  const res = await fetch(SOURCE);
  if (!res.ok) throw new Error(`${SOURCE}: ${res.status} (has the site's hero video moved?)`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

const report = [];
for (const [kind, size] of Object.entries(SIZES)) {
  console.log(`pearls-drone-${kind}: master`);
  const master = path.join(OUT, `pearls-drone-${kind}-master.mkv`);
  await makeMaster(size.crop, master);
  const poster = path.join(WORK, `pearls-drone-${kind}-poster.jpg`);
  ffmpeg(["-i", master, "-vf", `scale=${size.poster[0]}:${size.poster[1]}:flags=lanczos`, "-q:v", "3", "-frames:v", "1", poster]);
  console.log(`pearls-drone-${kind}: encoding`);
  const hd = path.join(WORK, `pearls-drone-${kind}.mp4`);
  const sd = path.join(WORK, `pearls-drone-${kind}-sd.mp4`);
  report.push(describe(hd, encode(master, size.hd, hd, CAP.hd)));
  report.push(describe(sd, encode(master, size.sd, sd, CAP.sd)));
  fs.rmSync(master);
}
console.log("\n" + report.join("\n"));
