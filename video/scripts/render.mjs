// Renders the Work section's live-card loops, posters and stills into the
// site's public/m/work/.
//
//   npm run render                    every project, both sizes
//   npm run render -- numen           one project (see PROJECTS)
//   npm run render -- numen phone     one size of it (desktop | phone)
//
// Each composition is drawn at its master size, larger than any file made
// from it (see FRAME_SIZE in src/), and rendered once as a near-lossless
// master. Every file is then scaled down from that master and encoded at the
// lowest CRF that keeps it under its size cap (scripts/encode.mjs).

import fs from "node:fs";
import path from "node:path";
import { CAP, OUT, ROOT, WORK, describe, encode, ffmpeg, probe, run } from "./encode.mjs";

/**
 * Every project's compositions. Per size: the composition, the file prefix,
 * and the pixel size of each file made from it. `still` is the reduced-motion
 * frame; `extras` are further frames saved as JPEGs (for a case study).
 */
const PROJECTS = {
  numen: {
    // From `npm run capture`.
    needs: ["src/captures.json", "public/captures"],
    stillFrame: 27, // src/NumenLoop.tsx STILL_FRAME
    sizes: {
      desktop: { id: "NumenDesktop", prefix: "numen-d", hd: [1280, 800], sd: [864, 540], poster: [960, 600], still: [1920, 1200] },
      phone: { id: "NumenPhone", prefix: "numen-m", hd: [720, 900], sd: [544, 680], poster: [544, 680], still: [1080, 1350] },
    },
  },
  clinical: {
    // A replica with invented data, so nothing to capture first.
    stillFrame: 436, // src/ClinicalLoop.tsx STILL_FRAME: the family letter, so the case study's figures aren't repeated
    sizes: {
      desktop: {
        id: "ClinicalDesktop",
        prefix: "clinical-d",
        hd: [1280, 800],
        sd: [864, 540],
        poster: [960, 600],
        still: [1920, 1200],
        // For the case study, each step complete and at rest (ClinicalLoop.tsx EXTRA_FRAMES).
        extras: [
          { file: "clinical-summary.jpg", frame: 230, size: [1920, 1200] },
          { file: "clinical-doctor-letter.jpg", frame: 337, size: [1920, 1200] },
          { file: "clinical-follow-ups.jpg", frame: 580, size: [1920, 1200] },
        ],
      },
      phone: { id: "ClinicalPhone", prefix: "clinical-m", hd: [720, 900], sd: [544, 680], poster: [544, 680], still: [1080, 1350] },
    },
  },
};

/** Renders one frame of the composition at its master size and saves it as a JPEG at an exact size. */
function still(job, frame, [w, h], dest, quality) {
  const tmp = path.join(OUT, `${path.basename(dest, ".jpg")}.png`);
  run(["remotion", "still", "src/index.ts", job.id, tmp, `--frame=${frame}`, "--log=error"]);
  ffmpeg(["-i", tmp, "-vf", `scale=${w}:${h}:flags=lanczos`, "-q:v", String(quality), "-frames:v", "1", dest]);
}

const [onlyProject, onlySize] = process.argv.slice(2);
if (onlyProject && !PROJECTS[onlyProject]) throw new Error(`No project "${onlyProject}". Try: ${Object.keys(PROJECTS).join(", ")}`);
fs.mkdirSync(OUT, { recursive: true });

const report = [];
for (const [name, project] of Object.entries(PROJECTS)) {
  if (onlyProject && onlyProject !== name) continue;
  for (const need of project.needs ?? []) {
    if (!fs.existsSync(path.join(ROOT, need))) throw new Error(`${name}: ${need} is missing. Run \`npm run capture\` first.`);
  }
  for (const [size, job] of Object.entries(project.sizes)) {
    if (onlySize && onlySize !== size) continue;
    console.log(`\n${name} ${size}: rendering the master`);
    const master = path.join(OUT, `${job.prefix}-master.mp4`);
    run(["remotion", "render", "src/index.ts", job.id, master, "--codec=h264", "--crf=4", "--image-format=png", "--muted", "--log=error"]);

    console.log(`${name} ${size}: encoding`);
    const hd = path.join(WORK, `${job.prefix}.mp4`);
    const sd = path.join(WORK, `${job.prefix}-sd.mp4`);
    const a = encode(master, job.hd, hd, project.cap?.hd ?? CAP.hd);
    const b = encode(master, job.sd, sd, project.cap?.sd ?? CAP.sd);

    console.log(`${name} ${size}: poster and stills`);
    const jpegs = [
      [`${job.prefix}-poster.jpg`, 0, job.poster, 3],
      [`${job.prefix}-still.jpg`, project.stillFrame, job.still, 2],
      ...(job.extras ?? []).map((x) => [x.file, x.frame, x.size ?? job.still, 2]),
    ];
    for (const [file, frame, dims, q] of jpegs) still(job, frame, dims, path.join(WORK, file), q);

    report.push(describe(hd, a), describe(sd, b));
    for (const [file] of jpegs) {
      const v = probe(path.join(WORK, file)).streams[0];
      report.push(`${file.padEnd(22)} ${v.width}x${v.height} ${fs.statSync(path.join(WORK, file)).size} bytes`);
    }
  }
}
console.log("\n" + report.join("\n"));
