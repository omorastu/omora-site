/**
 * "How we work", the film: Elora's lines and the film's timing, in one place.
 * Plain data, nothing imported, so video/scripts/film-voice.mjs can read it too.
 *
 * Each scene runs `duration` seconds and holds Elora's lines, each starting
 * `at` seconds into its scene. A line's caption shows from its start to the
 * next line's (or to its scene's end). The pictures in each scene
 * (scenes.tsx) are timed as shares of its scene, so a scene made longer or
 * shorter keeps its choreography in step.
 *
 * The voice, two ways (`voice` below):
 * - One file for the whole film, its lines placed at the times above, as the
 *   placeholder is: `voice = { src }`. With `cues`, the scenes start at those
 *   times instead (in seconds into the file), and each scene lasts until the
 *   next cue: a real recording can set the pace without touching the scenes.
 * - One file per scene: give each scene its `voice`, starting with its scene.
 */

export type SceneId = "elora" | "call" | "found" | "site" | "booking" | "calls" | "office" | "photo" | "plan" | "close";

export type Line = { text: string; at: number };

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
  // A stand-in, read by macOS's Samantha (video/scripts/film-voice.mjs).
  src: "/m/film/elora-placeholder.m4a",
};

export const scenes: Scene[] = [
  {
    id: "elora",
    label: "",
    duration: 9,
    lines: [
      { text: "Hi, I’m Elora, Ashan and Jordan’s assistant.", at: 1.8 },
      { text: "Let me show you how they work.", at: 5.6 },
    ],
  },
  {
    id: "call",
    label: "01 · The call",
    duration: 8.5,
    lines: [
      { text: "It starts with a call.", at: 0.8 },
      { text: "You tell them about your business, and they listen. Mostly, they just listen.", at: 2.6 },
    ],
  },
  // From here, outside in: what a customer meets first, then what happens behind the scenes. Each problem, then the fix.
  {
    id: "found",
    label: "02 · Getting found",
    duration: 12.5,
    lines: [
      { text: "Say you run a winery, and you’re on page two, where no one looks.", at: 0.6 },
      { text: "They get you to the top when people search,", at: 5.1 },
      { text: "and into the answer when people ask AI, which more and more of them do.", at: 7.7 },
    ],
  },
  {
    id: "site",
    label: "03 · The website",
    duration: 9.5,
    lines: [
      { text: "If your website’s dated and cluttered, people leave.", at: 0.5 },
      { text: "They build one that’s clear and easy to use, like this one for Prosperando.", at: 3.9 },
    ],
  },
  {
    id: "booking",
    label: "04 · Booking",
    duration: 8.5,
    lines: [
      { text: "Booking by text and email means sorting it all by hand.", at: 0.5 },
      { text: "Now guests book in a click, and it’s confirmed on its own.", at: 4.0 },
    ],
  },
  {
    id: "calls",
    label: "05 · Calls",
    duration: 9.5,
    lines: [
      { text: "Or say you’re an orthodontist, and the front desk is too busy to pick up.", at: 0.5 },
      { text: "Now every call is answered, booked in and followed up.", at: 5.0 },
    ],
  },
  {
    id: "office",
    label: "06 · Behind the scenes",
    duration: 12,
    lines: [
      { text: "Behind the scenes, the same patient gets typed in three times.", at: 0.5 },
      { text: "They make one entry fill in all three,", at: 4.7 },
      { text: "and build tools around how you work, like one that writes up each consult.", at: 7.0 },
    ],
  },
  {
    id: "photo",
    label: "07 · Photo & video",
    duration: 5.5,
    lines: [{ text: "And photos and video that show what you do.", at: 0.6 }],
  },
  {
    id: "plan",
    label: "08 · The plan",
    duration: 9,
    lines: [
      { text: "After the first call, you get it all on one page:", at: 0.5 },
      { text: "what they’ll do, in what order, and how long it takes.", at: 3.9 },
    ],
  },
  {
    id: "close",
    label: "",
    duration: 10.5,
    lines: [
      { text: "One plan, built by the two of them,", at: 1 },
      { text: "and looked after once it’s live.", at: 3.6 },
      { text: "If that sounds right, book a call.", at: 6.2 },
    ],
  },
];

/** Where each scene starts and how long it lasts, in seconds, and the whole film's length. */
export function timeline() {
  const cues = voice.cues;
  let t = 0;
  const parts = scenes.map((scene, i) => {
    const start = cues?.[i] ?? t;
    const next = cues?.[i + 1];
    const duration = next !== undefined ? next - start : scene.duration;
    t = start + duration;
    return { scene, start, duration };
  });
  return { parts, total: t };
}

/**
 * Every caption, with when it shows and goes, in seconds into the film. A
 * caption stays up until her next line, even across a change of scene, so
 * none fades while the pictures move on, and the last stays to the end (`to`);
 * `said` is when it would end within its own scene, which is what her glow
 * follows (elora.tsx).
 */
export function captions() {
  const { parts, total } = timeline();
  const all = parts.flatMap(({ scene, start, duration }) =>
    scene.lines.map((line, i) => {
      const next = scene.lines[i + 1];
      const from = start + line.at;
      const said = next ? start + next.at - 0.15 : start + duration - 0.25;
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
