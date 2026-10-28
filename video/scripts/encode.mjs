// What scripts/render.mjs and scripts/sd.mjs share: where things go, Remotion's
// own ffmpeg and ffprobe (`npx remotion ffmpeg`, so nothing needs installing),
// and the encode that lands a file under its size cap.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const WORK = path.resolve(ROOT, "..", "public", "m", "work");
export const OUT = path.join(ROOT, "out");

/** Size caps, in bytes. */
export const CAP = { hd: 2_000_000, sd: 900_000 };
/** Below this CRF the picture stops getting visibly better; the file just grows. */
const CRF_FLOOR = 14;
const CRF_CEILING = 40;

export function run(args, { quiet = false } = {}) {
  const r = spawnSync("npx", args, { cwd: ROOT, stdio: quiet ? "pipe" : "inherit", encoding: "utf8" });
  if (r.status !== 0) {
    if (quiet) process.stderr.write(r.stdout + r.stderr);
    throw new Error(`failed: npx ${args.join(" ")}`);
  }
  return r.stdout;
}
export const ffmpeg = (args) => run(["remotion", "ffmpeg", "-hide_banner", "-v", "error", "-y", ...args], { quiet: true });
export const probe = (file) =>
  JSON.parse(
    run(["remotion", "ffprobe", "-v", "error", "-show_entries", "format=duration,size:stream=codec_type,codec_name,profile,width,height,pix_fmt,avg_frame_rate", "-of", "json", file], { quiet: true })
  );

/**
 * H.264 (High, yuv420p, no audio, moov first) at the lowest CRF that keeps it
 * under `cap`, found by bisection to half a step, so the file spends its whole
 * budget on sharpness. The source is scaled once (lanczos) into a lossless
 * intermediate, so each trial encode only encodes.
 */
export function encode(source, [w, h], dest, cap) {
  fs.mkdirSync(OUT, { recursive: true });
  const scaled = path.join(OUT, `${path.basename(dest, ".mp4")}-scaled.mkv`);
  ffmpeg(["-i", source, "-an", "-vf", `scale=${w}:${h}:flags=lanczos`, "-c:v", "libx264", "-preset", "ultrafast", "-qp", "0", "-pix_fmt", "yuv444p", scaled]);
  const at = (crf) => {
    ffmpeg([
      "-i", scaled, "-an",
      // veryslow and one keyframe per loop (it always plays from the start):
      // about a CRF step lower than slow's defaults for the same size.
      "-c:v", "libx264", "-preset", "veryslow", "-g", "600", "-profile:v", "high", "-pix_fmt", "yuv420p",
      "-crf", String(crf), "-movflags", "+faststart", dest,
    ]);
    return fs.statSync(dest).size;
  };
  let best;
  const size = at(CRF_FLOOR);
  if (size <= cap) best = { crf: CRF_FLOOR, size };
  else {
    // lo never fits, hi always does.
    let lo = CRF_FLOOR;
    let hi = CRF_CEILING;
    if (at(hi) > cap) throw new Error(`${dest} won't fit under ${cap} bytes even at CRF ${hi}`);
    while (hi - lo > 0.5) {
      const mid = Math.round(((lo + hi) / 2) * 2) / 2;
      if (at(mid) <= cap) hi = mid;
      else lo = mid;
    }
    best = { crf: hi, size: at(hi) };
  }
  fs.rmSync(scaled);
  return best;
}

/** One line on a finished video, for the report. */
export function describe(file, enc) {
  const p = probe(file);
  const v = p.streams.find((s) => s.codec_type === "video");
  const buf = fs.readFileSync(file);
  return (
    `${path.basename(file).padEnd(22)} ${v.width}x${v.height} ${v.codec_name} ${v.profile} ${v.pix_fmt} ${v.avg_frame_rate}fps ` +
    `${(+p.format.duration).toFixed(2)}s ${p.format.size} bytes (CRF ${enc.crf}) ` +
    `audio:${p.streams.some((s) => s.codec_type === "audio") ? "yes" : "none"} moov-first:${buf.indexOf("moov") < buf.indexOf("mdat")}`
  );
}
