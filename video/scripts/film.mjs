// Renders the film's loops (/film) into the site's public/m/film/.
//
//   npm run film                     every loop, both sizes
//   npm run film -- site             one loop (see LOOPS)
//   npm run film -- site phone       one size of it (desktop | phone)
//
// PearlsSite, PearlsCrew, PracticeSite and PhotoReel need `npm run film-capture` first (and the drone
// footage in public/film-captures/drone-src.mp4: see src/FilmLoops.tsx).
// Each is rendered once as a near-lossless master at its master size, then
// scaled down and encoded at the lowest CRF that keeps it under the same caps
// as the Work loops (scripts/encode.mjs): 2 MB, and 900 KB for the SD cut.
// The site's own public/m/work/ files are never touched.

import fs from "node:fs";
import path from "node:path";
import { CAP, OUT, ROOT, describe, encode, ffmpeg, probe, run } from "./encode.mjs";

const FILM = path.resolve(ROOT, "..", "public", "m", "film");

/**
 * Each loop: its compositions and file prefix per size, and the frame its
 * still is taken from. The still stands in for the loop until it plays, and
 * instead of it under reduced motion: a demo's is its finished state.
 */
const LOOPS = {
  site: { needs: ["src/film-captures.json"], id: "PearlsSite", prefix: "pearls-site", still: 0 },
  crew: { needs: ["src/film-captures.json"], id: "PearlsCrew", prefix: "pearls-crew", still: 0 },
  practice: { needs: ["src/film-captures.json", "public/film-captures/desktop-practice-00.png"], id: "PracticeSite", prefix: "practice-site", still: 0 },
  reel: { needs: ["src/film-captures.json", "public/film-captures/drone-src.mp4"], id: "PhotoReel", prefix: "photo-reel", still: 320 },
  clinical: { needs: [], id: "ClinicalFilm", prefix: "clinical-film", still: 460 },
};
const SIZES = {
  desktop: { tag: "Desktop", suffix: "d", hd: [1280, 800], sd: [864, 540], poster: [1280, 800] },
  phone: { tag: "Phone", suffix: "m", hd: [720, 900], sd: [544, 680], poster: [720, 900] },
};

const [onlyLoop, onlySize] = process.argv.slice(2);
if (onlyLoop && !LOOPS[onlyLoop]) throw new Error(`No loop "${onlyLoop}". Try: ${Object.keys(LOOPS).join(", ")}`);
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(FILM, { recursive: true });

const report = [];
for (const [name, loop] of Object.entries(LOOPS)) {
  if (onlyLoop && onlyLoop !== name) continue;
  for (const need of loop.needs) if (!fs.existsSync(path.join(ROOT, need))) throw new Error(`${name}: ${need} is missing. Run \`npm run film-capture\` first.`);
  for (const [size, s] of Object.entries(SIZES)) {
    if (onlySize && onlySize !== size) continue;
    const id = `${loop.id}${s.tag}`;
    const base = `${loop.prefix}-${s.suffix}`;
    console.log(`\n${name} ${size}: rendering the master`);
    const master = path.join(OUT, `${base}-master.mp4`);
    run(["remotion", "render", "src/index.ts", id, master, "--codec=h264", "--crf=4", "--image-format=png", "--muted", "--log=error"]);
    console.log(`${name} ${size}: encoding`);
    const hd = path.join(FILM, `${base}.mp4`);
    const sd = path.join(FILM, `${base}-sd.mp4`);
    // Fine grain (the drone footage's grass) can keep a cut over its cap at any CRF:
    // then it's made again a touch softer, through 80% of its size first (Remotion's
    // ffmpeg has no blur or denoise), which an SD frame hardly shows.
    const fit = ([w, h], dest, cap) => {
      try {
        return encode(master, [w, h], dest, cap);
      } catch {
        console.log(`${name} ${size}: ${path.basename(dest)} over its cap; again, a touch softer`);
        const soft = `scale=${Math.round((w * 0.8) / 2) * 2}:${Math.round((h * 0.8) / 2) * 2}:flags=area`;
        return { ...encode(master, [w, h], dest, cap, soft), softened: true };
      }
    };
    const a = fit(s.hd, hd, CAP.hd);
    const b = fit(s.sd, sd, CAP.sd);
    const poster = path.join(FILM, `${base}-poster.jpg`);
    const png = path.join(OUT, `${base}-poster.png`);
    run(["remotion", "still", "src/index.ts", id, png, `--frame=${loop.still}`, "--log=error"]);
    ffmpeg(["-i", png, "-vf", `scale=${s.poster[0]}:${s.poster[1]}:flags=lanczos`, "-q:v", "3", "-frames:v", "1", poster]);
    report.push(describe(hd, a), describe(sd, b));
    const v = probe(poster).streams[0];
    report.push(`${path.basename(poster).padEnd(26)} ${v.width}x${v.height} ${fs.statSync(poster).size} bytes`);
  }
}
console.log("\n" + report.join("\n"));
