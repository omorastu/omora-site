// Renders the Numen Ventures live-card loops, posters and stills into the
// site's public/m/work/, next to the Pearls files.
//
//   npm run render            both sizes
//   npm run render -- phone   one size (desktop | phone)
//
// Needs the captures from `npm run capture`. Each size is rendered once as a
// near-lossless master per resolution, then encoded in two passes to H.264
// (High, yuv420p, no audio, moov first) at the bitrate that lands under its
// size cap; if a file still comes out over, it's re-encoded a little lower.
// Uses Remotion's own ffmpeg (`npx remotion ffmpeg`), so nothing needs
// installing on the machine.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WORK = path.resolve(ROOT, "..", "public", "m", "work");
const OUT = path.join(ROOT, "out");
const SECONDS = 18;

/** Size caps, in bytes. */
const CAP = { hd: 1_500_000, sd: 700_000 };

const JOBS = {
  desktop: {
    id: "NumenDesktop",
    prefix: "numen-d",
    frame: [1280, 800],
    sd: [864, 540],
    poster: [960, 600],
    still: [1920, 1200],
  },
  phone: {
    id: "NumenPhone",
    prefix: "numen-m",
    frame: [720, 900],
    sd: [544, 680],
    poster: [544, 680],
    still: [1080, 1350],
  },
};

/** The frame the reduced-motion still comes from (src/NumenLoop.tsx STILL_FRAME). */
const STILL_FRAME = 27;

function run(args, { quiet = false } = {}) {
  const r = spawnSync("npx", args, { cwd: ROOT, stdio: quiet ? "pipe" : "inherit", encoding: "utf8" });
  if (r.status !== 0) {
    if (quiet) process.stderr.write(r.stdout + r.stderr);
    throw new Error(`failed: npx ${args.join(" ")}`);
  }
  return r.stdout;
}
const ffmpeg = (args) => run(["remotion", "ffmpeg", "-hide_banner", "-v", "error", "-y", ...args], { quiet: true });
const probe = (file) =>
  JSON.parse(
    run(["remotion", "ffprobe", "-v", "error", "-show_entries", "format=duration,size:stream=codec_type,codec_name,profile,width,height,pix_fmt,avg_frame_rate", "-of", "json", file], { quiet: true })
  );

/** Renders a still of the composition at an exact size. */
function still(job, frame, [w, h], dest, quality) {
  const tmp = path.join(OUT, `${path.basename(dest, ".jpg")}.png`);
  run(["remotion", "still", "src/index.ts", job.id, tmp, `--frame=${frame}`, `--scale=${w / job.frame[0]}`, "--log=error"]);
  // Exact size and JPEG quality in one step (the scale is a no-op when it already fits).
  ffmpeg(["-i", tmp, "-vf", `scale=${w}:${h}:flags=lanczos`, "-q:v", String(quality), "-frames:v", "1", dest]);
}

/** Two-pass H.264 from a master, at the bitrate that keeps it under `cap`. */
function encode(master, [w, h], dest, cap, name) {
  let kbps = Math.floor(((cap * 8) / SECONDS / 1000) * 0.92);
  for (let attempt = 1; attempt <= 4; attempt++) {
    const log = path.join(OUT, `x264-${name}`);
    const common = [
      "-i", master, "-an", "-vf", `scale=${w}:${h}:flags=lanczos`,
      "-c:v", "libx264", "-preset", "slow", "-profile:v", "high", "-pix_fmt", "yuv420p",
      "-b:v", `${kbps}k`, "-maxrate", `${Math.round(kbps * 1.6)}k`, "-bufsize", `${kbps * 3}k`,
      "-passlogfile", log,
    ];
    ffmpeg([...common, "-pass", "1", "-f", "null", "-"]);
    ffmpeg([...common, "-pass", "2", "-movflags", "+faststart", dest]);
    for (const f of fs.readdirSync(OUT)) if (f.startsWith(`x264-${name}`)) fs.rmSync(path.join(OUT, f));
    const size = fs.statSync(dest).size;
    if (size <= cap) return { kbps, size };
    kbps = Math.floor(kbps * (cap / size) * 0.96);
    console.log(`  ${path.basename(dest)} came out at ${size} bytes; again at ${kbps}k`);
  }
  throw new Error(`${dest} would not fit under ${cap} bytes`);
}

if (!fs.existsSync(path.join(ROOT, "src", "captures.json")) || !fs.existsSync(path.join(ROOT, "public", "captures"))) {
  throw new Error("No captures yet: run `npm run capture` first.");
}
fs.mkdirSync(OUT, { recursive: true });

const only = process.argv[2];
const report = [];
for (const [size, job] of Object.entries(JOBS)) {
  if (only && only !== size) continue;
  console.log(`\n${size}: rendering masters`);
  const hdMaster = path.join(OUT, `${job.prefix}-master.mp4`);
  const sdMaster = path.join(OUT, `${job.prefix}-sd-master.mp4`);
  const master = ["remotion", "render", "src/index.ts", job.id, "--codec=h264", "--crf=8", "--image-format=png", "--muted", "--log=error"];
  run([...master, hdMaster]);
  run([...master, sdMaster, `--scale=${job.sd[0] / job.frame[0]}`]);

  console.log(`${size}: encoding`);
  const hd = path.join(WORK, `${job.prefix}.mp4`);
  const sd = path.join(WORK, `${job.prefix}-sd.mp4`);
  const a = encode(hdMaster, job.frame, hd, CAP.hd, `${job.prefix}`);
  const b = encode(sdMaster, job.sd, sd, CAP.sd, `${job.prefix}-sd`);

  console.log(`${size}: poster and still`);
  still(job, 0, job.poster, path.join(WORK, `${job.prefix}-poster.jpg`), 3);
  still(job, STILL_FRAME, job.still, path.join(WORK, `${job.prefix}-still.jpg`), 2);

  for (const [file, enc] of [[hd, a], [sd, b]]) {
    const p = probe(file);
    const v = p.streams.find((s) => s.codec_type === "video");
    const buf = fs.readFileSync(file);
    report.push(
      `${path.basename(file).padEnd(18)} ${v.width}x${v.height} ${v.codec_name} ${v.profile} ${v.pix_fmt} ${v.avg_frame_rate}fps ` +
        `${(+p.format.duration).toFixed(2)}s ${p.format.size} bytes (${enc.kbps}k) ` +
        `audio:${p.streams.some((s) => s.codec_type === "audio") ? "yes" : "none"} moov-first:${buf.indexOf("moov") < buf.indexOf("mdat")}`
    );
  }
  for (const f of [`${job.prefix}-poster.jpg`, `${job.prefix}-still.jpg`]) {
    const v = probe(path.join(WORK, f)).streams[0];
    report.push(`${f.padEnd(18)} ${v.width}x${v.height} ${fs.statSync(path.join(WORK, f)).size} bytes`);
  }
}
console.log("\n" + report.join("\n"));
