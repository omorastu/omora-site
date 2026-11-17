/**
 * "How we work", the film: Elora's lines and the film's timing, in one place.
 * Plain data, nothing imported.
 *
 * Each scene runs `duration` seconds and holds Elora's lines, each starting
 * `at` seconds into its scene. A line's caption shows from its start to the
 * next line's. The pictures in each scene (scenes.tsx) are timed as shares of
 * its scene, so a scene made longer or shorter keeps its choreography in step.
 *
 * The voice, two ways (`voice` below):
 * - One file for the whole film. Without `cues`, its lines are placed at the
 *   times above. With `cues`, each cue is where that scene's first line
 *   starts in the file, in seconds: from there her voice plays on in step
 *   with the scene, and where a scene runs longer than her lines in it, she
 *   waits, in the quiet before her next line, until the next scene starts.
 *   A scene is never shorter than her lines in it (timeline()).
 * - One file per scene: give each scene its `voice`, starting with its scene.
 */

export type SceneId = "elora" | "call" | "found" | "site" | "booking" | "calls" | "office" | "photo" | "plan" | "close";

export type Line = {
  text: string;
  at: number;
  /** When she has finished saying it, in seconds into its scene; her glow follows it (elora.tsx). */
  end?: number;
};

export type Scene = {
  id: SceneId;
  /** The small label at the top of the screen while the scene plays. Empty: none. */
  label: string;
  duration: number;
  lines: Line[];
  /** This scene's own voice file, if the voice comes one file per scene. */
  voice?: string;
};

/**
 * Elora on screen (elora.tsx): drawn for now. Give her a `video` (a talking
 * avatar, square, her face in the middle) and it takes her place, played in
 * step with the film; give it her voice too and point `voice.src` at it.
 */
export const elora: { video?: string; poster?: string } = {};

export const voice: { src?: string; cues?: number[] } = {
  // Her own voice: ElevenLabs, "Sia", one take of the whole script (video/README.md, "Elora's voice").
  src: "/m/film/elora-sia.m4a",
  cues: [0.07, 5.47, 12.1, 23.95, 32.36, 39.81, 48.12, 59.01, 61.73, 68.66],
};

export const scenes: Scene[] = [
  // Times from her take (video/README.md). Each scene starts on her first line in it, except this one, which opens on the logo.
  {
    id: "elora",
    label: "",
    duration: 8,
    lines: [
      { text: "Hi, I’m Elora, Ashan and Jordan’s assistant.", at: 1.6, end: 4.84 },
      { text: "Let me show you how they work.", at: 5.25, end: 6.49 },
    ],
  },
  {
    id: "call",
    label: "01 · The call",
    duration: 6.63,
    lines: [
      { text: "It starts with a call.", at: 0, end: 1.05 },
      { text: "You tell them about your business, and they listen. Mostly, they just listen.", at: 1.49, end: 6.13 },
    ],
  },
  // From here, outside in: what a customer meets first, then what happens behind the scenes. Each problem, then the fix.
  {
    id: "found",
    label: "02 · Getting found",
    duration: 11.85,
    lines: [
      { text: "Say you run a winery, and you’re on page two, where no one looks.", at: 0, end: 4.05 },
      { text: "They get you to the top when people search,", at: 4.59, end: 6.7 },
      { text: "and into the answer when people ask AI, which more and more of them do.", at: 6.84, end: 11.29 },
    ],
  },
  {
    id: "site",
    label: "03 · The website",
    duration: 8.41,
    lines: [
      { text: "If your website’s dated and cluttered, people leave.", at: 0, end: 3.14 },
      { text: "They build one that’s clear and easy to use, like this one for Prosperando.", at: 3.68, end: 7.95 },
    ],
  },
  {
    id: "booking",
    label: "04 · Booking",
    duration: 7.45,
    lines: [
      { text: "Booking by text and email means sorting it all by hand.", at: 0, end: 3.24 },
      { text: "Now guests book in a click, and it’s confirmed on its own.", at: 3.73, end: 7.04 },
    ],
  },
  {
    id: "calls",
    label: "05 · Calls",
    duration: 8.31,
    lines: [
      { text: "Or say you’re an orthodontist, and the front desk is too busy to pick up.", at: 0, end: 4.11 },
      { text: "Now every call is answered, booked in and followed up.", at: 4.6, end: 7.93 },
    ],
  },
  {
    id: "office",
    label: "06 · Behind the scenes",
    duration: 10.89,
    lines: [
      { text: "Behind the scenes, the same patient gets typed in three times.", at: 0, end: 3.67 },
      { text: "They make one entry fill in all three,", at: 4.12, end: 6.42 },
      { text: "and build tools around how you work, like one that writes up each consult.", at: 6.55, end: 10.53 },
    ],
  },
  {
    // Longer than her line: the drone footage plays on after it.
    id: "photo",
    label: "07 · Photo & video",
    duration: 4.5,
    lines: [{ text: "And photos and video that show what you do.", at: 0, end: 2.34 }],
  },
  {
    // A little longer than her lines: the page, all ticked, a moment to read.
    id: "plan",
    label: "08 · The plan",
    duration: 7.8,
    lines: [
      { text: "After the first call, you get it all on one page:", at: 0, end: 3.1 },
      { text: "what they’ll do, in what order, and how long it takes.", at: 3.42, end: 6.41 },
    ],
  },
  {
    id: "close",
    label: "",
    duration: 7.5,
    lines: [
      { text: "One plan, built by the two of them,", at: 0, end: 2.03 },
      { text: "and looked after once it’s live.", at: 2.12, end: 3.79 },
      { text: "If that sounds right, book a call.", at: 4.18, end: 5.88 },
    ],
  },
];

/**
 * Where each scene starts and how long it lasts, in seconds, and the whole
 * film's length. With cues, a scene lasts at least from her first line in it
 * to her first in the next, as her file has them, so her voice is never cut.
 */
export function timeline() {
  const cues = voice.cues;
  let t = 0;
  const parts = scenes.map((scene, i) => {
    const start = t;
    const next = scenes[i + 1];
    const need = cues && next ? (scene.lines[0]?.at ?? 0) + cues[i + 1] - cues[i] - (next.lines[0]?.at ?? 0) : 0;
    const duration = Math.max(scene.duration, need);
    t = start + duration;
    return { scene, start, duration };
  });
  return { parts, total: t };
}

/**
 * Her voice against the film, with one file: stretches of it, each played
 * from `file` (seconds into it) at `film` (seconds into the film) for `len`
 * seconds; between two, she waits. Without cues, one stretch: the file is the
 * film's time. With them, a stretch from each scene's first line, starting a
 * little before it, in the quiet after her line before (half way through it,
 * by her lines' `end`), where she also waits if the scene runs longer.
 */
export function voiceStretches() {
  const cues = voice.cues;
  if (!cues) return [{ film: 0, file: 0, len: Infinity }];
  const { parts } = timeline();
  const starts = parts.map((p, i) => {
    const first = p.scene.lines[0]?.at ?? 0;
    const before = parts[i - 1];
    const last = before?.scene.lines[before.scene.lines.length - 1];
    // Where she finished her line before, in the file; half way from there to this cue.
    const done = before && last?.end !== undefined ? cues[i - 1] + last.end - (before.scene.lines[0]?.at ?? 0) : cues[i] - 0.3;
    const file = i === 0 ? 0 : Math.max(done, (done + cues[i]) / 2);
    return { film: p.start + first - (cues[i] - file), file };
  });
  return starts.map((s, i) => ({ ...s, len: starts[i + 1] ? starts[i + 1].file - s.file : Infinity }));
}

/**
 * Every caption, with when it shows and goes, in seconds into the film. A
 * caption stays up until her next line, even across a change of scene, so
 * none fades while the pictures move on, and the last stays to the end (`to`);
 * `said` is when she has finished saying it (its `end`, or else when it would
 * end within its own scene), which is what her glow follows (elora.tsx).
 */
export function captions() {
  const { parts, total } = timeline();
  const all = parts.flatMap(({ scene, start, duration }) =>
    scene.lines.map((line, i) => {
      const next = scene.lines[i + 1];
      const from = start + line.at;
      const said = start + (line.end ?? (next ? next.at - 0.15 : duration - 0.25));
      return { text: line.text, from, to: said, said, scene: scene.id };
    })
  );
  all.forEach((c, i) => {
    const next = all[i + 1];
    // The last stays on the final frame (film.css, .film-cap--last).
    c.to = next ? next.from - 0.15 : total;
  });
  return all;
}
