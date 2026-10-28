// SD cuts for the loops made before this package (Pearls, Cubic Ship), made
// from the loop itself: scaled to the SD size and encoded to at most the SD
// cap and at most 60% of the loop, so it's always meaningfully lighter.
//
//   npm run sd                       every loop in LOOPS
//   npm run sd -- pearls-d cubic-d   just these
//
// The loops made here (Numen, Clinical Scribe) get theirs from
// scripts/render.mjs instead, from the master.

import fs from "node:fs";
import path from "node:path";
import { CAP, WORK, describe, encode } from "./encode.mjs";

/** Each loop in public/m/work/ and its SD size. */
const LOOPS = {
  "pearls-d": [864, 540],
  "pearls-m": [544, 680],
  "cubic-d": [864, 540],
};

const only = process.argv.slice(2);
const report = [];
for (const [prefix, dims] of Object.entries(LOOPS)) {
  if (only.length && !only.includes(prefix)) continue;
  const hd = path.join(WORK, `${prefix}.mp4`);
  const sd = path.join(WORK, `${prefix}-sd.mp4`);
  const cap = Math.min(CAP.sd, Math.floor(fs.statSync(hd).size * 0.6));
  console.log(`${prefix}: encoding the SD cut (under ${cap} bytes)`);
  report.push(describe(sd, encode(hd, dims, sd, cap)));
}
console.log("\n" + report.join("\n"));
