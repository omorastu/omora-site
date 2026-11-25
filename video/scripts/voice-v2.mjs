// Cuts Elora's takes for the film (/film) into a file per line.
//
//   npm run voice-v2
//
// Reads the seven takes in voice/v2/ (take-shared.mp3, take-winery.mp3,
// take-dental.mp3, take-contractor.mp3, take-general.mp3, take-extra.mp3,
// take-r11.mp3: each the lines components/elorro/film/lines.ts lists for
// it, in order, a paragraph each). A line the film no longer says (lines.ts,
// RETIRED: the closer look's, in take-shared; the old photo line for a
// practice, in take-dental; the old send line, in take-extra; the new ones
// are in take-r11) is found like any other, so the lines either side of it
// are cut right, and then skipped.
// For each take:
//
// 1. whisper.cpp's whisper-cli hears it, a time for every word (a ggml
//    model: WHISPER_MODEL, by default ggml-small.en.bin in the folder given
//    by WHISPER_DIR or the current one);
// 2. the words heard are matched to the script's, so each line is found by
//    its words, not by counting pauses (some lines are two sentences);
// 3. each line's ends are put at the quiet around it (ffmpeg's
//    silencedetect), and it's cut at the middle of that quiet, keeping at
//    most 0.35 s of it either side;
// 4. it's encoded as the site's other voice files are, to
//    public/m/film/voice/v2/<line>.m4a.
//
// Then it writes components/elorro/film/voice-v2.ts: each line's file length,
// and where each of its caption chunks (the parts lines.ts splits it into)
// starts and ends in its file. The film lays her lines out from those.
//
// Any word whisper hears differently from the script is listed, line by line
// (names, like Ashan, it often spells its own way), so a misread can be
// re-recorded. --takes <dir>, --out <dir> and --table <file> point it
// elsewhere (to try it on other takes without touching the site).

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LINES as SAID, RETIRED, TAKES } from "../../components/elorro/film/lines.ts";

/** Every line in the takes: the film's, and those it no longer says (found, so the cuts around them are right, but not cut). */
const LINES = { ...SAID, ...RETIRED };

const HERE = path.dirname(fileURLToPath(import.meta.url));
const VIDEO = path.resolve(HERE, "..");
const SITE = path.resolve(VIDEO, "..");
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? path.resolve(process.argv[i + 1]) : fallback;
};
const TAKES_DIR = arg("takes", path.join(VIDEO, "voice", "v2"));
const OUT = arg("out", path.join(SITE, "public", "m", "film", "voice", "v2"));
const TABLE = arg("table", path.join(SITE, "components", "elorro", "film", "voice-v2.ts"));
const MODEL = process.env.WHISPER_MODEL ?? path.join(process.env.WHISPER_DIR ?? process.cwd(), "ggml-small.en.bin");
/** The most quiet kept either side of a line, and the quiet that counts as a pause. */
const KEEP = 0.35;
const NOISE = "-40dB";
const MIN_QUIET = 0.08;

const run = (cmd, args) => execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 << 20 });
/** What ffmpeg says as it goes (its stderr, where silencedetect reports). */
const ffmpegLog = (args) => String(spawnSync("ffmpeg", args, { encoding: "utf8", maxBuffer: 64 << 20 }).stderr ?? "");
const duration = (file) => Number(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).trim());
/** Every pause in a file: [start, end] in seconds. */
function quiets(file) {
  const log = ffmpegLog(["-hide_banner", "-nostats", "-i", file, "-af", `silencedetect=noise=${NOISE}:d=${MIN_QUIET}`, "-f", "null", "-"]);
  const out = [];
  let start = null;
  for (const line of log.split("\n")) {
    const s = line.match(/silence_start: ([\d.]+)/);
    const e = line.match(/silence_end: ([\d.]+)/);
    if (s) start = Number(s[1]);
    if (e && start !== null) {
      out.push([start, Number(e[1])]);
      start = null;
    }
  }
  if (start !== null) out.push([start, duration(file)]);
  return out;
}
/** Every word whisper hears in a file, with its time. */
function hear(file, tmp) {
  const wav = path.join(tmp, `${path.basename(file)}.wav`);
  run("ffmpeg", ["-v", "error", "-y", "-i", file, "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", wav]);
  const base = path.join(tmp, path.basename(file));
  run("whisper-cli", ["-m", MODEL, "-f", wav, "-ml", "1", "-sow", "-oj", "-of", base, "-np"]);
  const json = JSON.parse(fs.readFileSync(`${base}.json`, "utf8"));
  return json.transcription
    .map((s) => ({ text: s.text.trim(), from: s.offsets.from / 1000, to: s.offsets.to / 1000 }))
    .filter((w) => norm(w.text));
}
const norm = (w) =>
  w
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, "");

/** The script's words matched to the words heard (edit distance, word by word): for each script word, the heard word's index, or -1. */
function align(script, heard) {
  const n = script.length;
  const m = heard.length;
  const cost = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = 0; i <= n; i++) cost[i][0] = i;
  for (let j = 0; j <= m; j++) cost[0][j] = j;
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      cost[i][j] = Math.min(cost[i - 1][j - 1] + (script[i - 1] === heard[j - 1] ? 0 : 1), cost[i - 1][j] + 1, cost[i][j - 1] + 1);
  const match = new Array(n).fill(-1);
  const extra = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && cost[i][j] === cost[i - 1][j - 1] + (script[i - 1] === heard[j - 1] ? 0 : 1)) {
      match[i - 1] = j - 1;
      i--;
      j--;
    } else if (i > 0 && cost[i][j] === cost[i - 1][j] + 1) i--;
    else {
      extra.push(j - 1);
      j--;
    }
  }
  return { match, extra: new Set(extra) };
}

/** The longest pause between two times, or null. */
const pauseIn = (q, from, to) => q.filter(([s, e]) => e > from && s < to).sort((a, b) => b[1] - b[0] - (a[1] - a[0]))[0] ?? null;

if (!fs.existsSync(MODEL)) throw new Error(`No whisper model at ${MODEL}. Set WHISPER_MODEL to a ggml model (ggml-small.en.bin).`);
const missing = Object.keys(TAKES).filter((t) => !fs.existsSync(path.join(TAKES_DIR, `${t}.mp3`)));
if (missing.length) throw new Error(`Missing in ${TAKES_DIR}: ${missing.map((t) => `${t}.mp3`).join(", ")}`);
fs.mkdirSync(OUT, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "voice-v2-"));

const table = {};
const report = [];
for (const [take, ids] of Object.entries(TAKES)) {
  const file = path.join(TAKES_DIR, `${take}.mp3`);
  const total = duration(file);
  const q = quiets(file);
  const heard = hear(file, tmp);
  // The script's words, each knowing its line and chunk.
  const words = ids.flatMap((id) => LINES[id].flatMap((chunk, c) => chunk.split(/\s+/).map((w) => ({ id, c, text: w, n: norm(w) }))));
  const { match, extra } = align(
    words.map((w) => w.n),
    heard.map((h) => norm(h.text))
  );
  /** Where a script word was heard: its own match, or failing that the nearest matched word's time. */
  const at = (k, side) => {
    if (match[k] >= 0) return heard[match[k]];
    for (let d = 1; d < words.length; d++) {
      const kk = side === "from" ? k + d : k - d;
      if (kk >= 0 && kk < words.length && match[kk] >= 0) return heard[match[kk]];
    }
    throw new Error(`${take}: no word of it was heard`);
  };
  // Each chunk's words, and their times as heard.
  const chunks = [];
  for (const id of ids)
    LINES[id].forEach((_, c) => {
      const ks = words.map((w, k) => (w.id === id && w.c === c ? k : -1)).filter((k) => k >= 0);
      chunks.push({ id, c, first: ks[0], last: ks[ks.length - 1], from: at(ks[0], "from").from, to: at(ks[ks.length - 1], "to").to });
    });
  // The quiet between each chunk and the next: the longest pause around where whisper puts the change (it folds a pause into the words either side).
  chunks.forEach((ch, i) => {
    const next = chunks[i + 1];
    if (!next) {
      const tail = q.find(([s, e]) => e >= total - 0.02 && s > ch.from);
      ch.said = tail ? tail[0] : Math.min(total, ch.to);
      return;
    }
    const lastWord = at(ch.last, "to");
    const firstWord = at(next.first, "from");
    const p = pauseIn(q, lastWord.from + 0.05, firstWord.to - 0.02);
    if (p) {
      ch.said = p[0];
      next.start = p[1];
    } else {
      // No pause (two chunks said in one breath): the change as whisper heard it.
      ch.said = next.start = (lastWord.to + firstWord.from) / 2;
    }
  });
  const head = q.find(([s]) => s < 0.02);
  chunks[0].start = head && head[1] < chunks[0].to ? head[1] : chunks[0].from;
  // Cut each line at the middle of the quiet around it, keeping a little of it either side.
  for (const id of ids) {
    if (id in RETIRED) continue;
    const mine = chunks.filter((c) => c.id === id);
    const first = mine[0];
    const last = mine[mine.length - 1];
    const before = chunks[chunks.indexOf(first) - 1];
    const after = chunks[chunks.indexOf(last) + 1];
    const from = Math.max(before ? (before.said + first.start) / 2 : 0, first.start - KEEP);
    const to = Math.min(after ? (last.said + after.start) / 2 : total, last.said + KEEP);
    const out = path.join(OUT, `${id}.m4a`);
    run("ffmpeg", ["-v", "error", "-y", "-i", file, "-ss", from.toFixed(3), "-to", to.toFixed(3), "-map_metadata", "-1", "-ac", "1", "-c:a", "aac_at", "-b:a", "64k", "-movflags", "+faststart", out]);
    const len = duration(out);
    table[id] = { file: +len.toFixed(3), chunks: mine.map((c) => [+(c.start - from).toFixed(3), +(c.said - from).toFixed(3)]) };
    // What whisper heard differently.
    const ks = words.map((w, k) => (w.id === id ? k : -1)).filter((k) => k >= 0);
    const js = ks.map((k) => match[k]).filter((j) => j >= 0);
    const differs = ks.filter((k) => match[k] < 0 || norm(heard[match[k]].text) !== words[k].n).map((k) => `"${words[k].text}" heard as ${match[k] < 0 ? "nothing" : `"${heard[match[k]].text}"`}`);
    const added = js.length ? [...extra].filter((j) => j > Math.min(...js) && j < Math.max(...js)).map((j) => `"${heard[j].text}" heard, not in the script`) : [];
    report.push({ id, take, from: +from.toFixed(2), to: +to.toFixed(2), file: table[id].file, said: +(last.said - first.start).toFixed(2), differs: [...differs, ...added] });
  }
}

const lines = Object.keys(SAID).map((id) => {
  if (!table[id]) throw new Error(`No cut for ${id}`);
  const t = table[id];
  return `  "${id}": { file: ${t.file}, chunks: [${t.chunks.map(([a, b]) => `[${a}, ${b}]`).join(", ")}] },`;
});
const head = fs.readFileSync(TABLE, "utf8").split("export const V2")[0];
fs.writeFileSync(TABLE, `${head}export const V2: Record<string, { file: number; chunks: [start: number, end: number][] }> = {\n${lines.join("\n")}\n};\n`);
fs.writeFileSync(path.join(tmp, "report.json"), JSON.stringify(report, null, 1));
for (const r of report) {
  console.log(`${r.id.padEnd(20)} ${r.take.padEnd(16)} ${String(r.from).padStart(7)}–${String(r.to).padEnd(7)} file ${r.file.toFixed(2)} s, said ${r.said.toFixed(2)} s${r.differs.length ? `\n    ${r.differs.join("\n    ")}` : ""}`);
}
console.log(`\nWrote ${Object.keys(table).length} files to ${OUT} and their times to ${TABLE}. (Report: ${path.join(tmp, "report.json")})`);
