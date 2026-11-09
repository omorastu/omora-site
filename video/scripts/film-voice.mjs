// The film's placeholder voice: Elora's lines (components/elorro/film/script.ts)
// read by one of macOS's own voices, each placed at its time in the film, into
// one file, public/m/film/elora-placeholder.m4a. macOS only: it uses `say` and
// `afconvert`, nothing to install.
//
//   npm run film-voice                       (in video/)
//   FILM_VOICE="Karen" npm run film-voice    another installed voice (`say -v '?'`)
//
// It stops if a line, read aloud, runs into the next one or past its scene's
// end: then move the next line's `at` (or lengthen the scene) in script.ts.
// When the real voice arrives, this isn't needed: see script.ts's `voice`.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const { timeline, voice } = await import(path.join(ROOT, "components/elorro/film/script.ts"));

const VOICE = process.env.FILM_VOICE ?? "Samantha";
/** Words a minute: a touch slower than `say`'s own, unhurried. */
const PACE = "168";
const RATE = 24000;
/** The least quiet between one line and the next, in seconds. */
const BREATH = 0.15;

if (!voice.src || voice.cues) throw new Error("film-voice makes one file on the script's own timing: voice.src set, no cues");
const dest = path.join(ROOT, "public", voice.src);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "film-voice-"));

/** A line read aloud, as 16-bit mono samples at RATE. */
function speak(text, i) {
  const file = path.join(tmp, `${i}.wav`);
  execFileSync("say", ["-v", VOICE, "-r", PACE, "--file-format=WAVE", `--data-format=LEI16@${RATE}`, "-o", file, text]);
  const b = fs.readFileSync(file);
  for (let o = 12; o + 8 <= b.length; ) {
    const id = b.toString("ascii", o, o + 4);
    const size = b.readUInt32LE(o + 4);
    if (id === "data") return new Int16Array(b.buffer.slice(b.byteOffset + o + 8, b.byteOffset + o + 8 + size));
    o += 8 + size + (size % 2);
  }
  throw new Error(`no audio from say for: ${text}`);
}

const { parts, total } = timeline();
const track = new Int16Array(Math.ceil(total * RATE));
const rows = [];
let n = 0;
for (const { scene, start, duration } of parts) {
  scene.lines.forEach((line, i) => {
    const samples = speak(line.text, n++);
    const from = start + line.at;
    const to = from + samples.length / RATE;
    const next = scene.lines[i + 1];
    const limit = next ? start + next.at - BREATH : start + duration - BREATH;
    if (to > limit) {
      throw new Error(`"${line.text}" (${scene.id}) runs to ${to.toFixed(2)}s, past ${limit.toFixed(2)}s: move the next line or lengthen the scene`);
    }
    track.set(samples, Math.round(from * RATE));
    rows.push(`${scene.id.padEnd(8)} ${from.toFixed(2).padStart(6)}–${to.toFixed(2).padStart(6)}s  (room to ${limit.toFixed(2)}s)  ${line.text}`);
  });
}

// A plain WAV of the whole track, then AAC in an .m4a: small, and it plays everywhere, iPhones included.
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + track.byteLength, 4);
header.write("WAVEfmt ", 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20); // PCM
header.writeUInt16LE(1, 22); // mono
header.writeUInt32LE(RATE, 24);
header.writeUInt32LE(RATE * 2, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(track.byteLength, 40);
const wav = path.join(tmp, "track.wav");
fs.writeFileSync(wav, Buffer.concat([header, Buffer.from(track.buffer)]));
fs.mkdirSync(path.dirname(dest), { recursive: true });
execFileSync("afconvert", ["-f", "m4af", "-d", "aac", "-b", "48000", wav, dest]);
fs.rmSync(tmp, { recursive: true, force: true });

console.log(rows.join("\n"));
console.log(`\n${path.relative(ROOT, dest)}: ${VOICE}, ${total.toFixed(2)}s, ${fs.statSync(dest).size} bytes`);
