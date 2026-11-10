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

export type SceneId = "elora" | "call" | "problem" | "plan" | "web" | "more" | "close";

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
    duration: 9.5,
    lines: [
      { text: "It starts with a call.", at: 0.8 },
      { text: "You tell them about your business, and they listen. Mostly, they just listen.", at: 2.9 },
    ],
  },
  {
    id: "problem",
    label: "02 · What’s really going on",
    duration: 16,
    lines: [
      { text: "Then they find what’s really going on.", at: 0.6 },
      { text: "A tasting and a consult, each booked twice for the same hour.", at: 3.2 },
      { text: "Calls the front desk was too busy to answer.", at: 7.2 },
      { text: "A good winery, or a good orthodontist, that’s hard to find online.", at: 10.4 },
    ],
  },
  {
    id: "plan",
    label: "03 · Sorting it out",
    duration: 9.5,
    lines: [
      { text: "They untangle it, one thread at a time,", at: 1 },
      { text: "until it’s a plan that fits on one page.", at: 4 },
    ],
  },
  {
    id: "web",
    label: "04 · Websites & getting found",
    duration: 14.5,
    lines: [
      { text: "Often it starts with your website.", at: 0.8 },
      { text: "One that shows up when people search for what you do,", at: 3.4 },
      { text: "and one that’s clear and easy to use, so the people who find you get in touch.", at: 7 },
    ],
  },
  {
    id: "more",
    label: "05 · And the rest",
    duration: 15.5,
    lines: [
      { text: "Sometimes it’s a tool built around the way you work.", at: 1 },
      { text: "Photos and video that show what you do.", at: 5.2 },
      { text: "Or phones that get answered, and bookings and follow-ups that happen without you chasing them.", at: 8.8 },
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

/** Every caption, with when it shows and goes, in seconds into the film. */
export function captions() {
  const { parts } = timeline();
  return parts.flatMap(({ scene, start, duration }) =>
    scene.lines.map((line, i) => {
      const next = scene.lines[i + 1];
      const from = start + line.at;
      const to = next ? start + next.at - 0.15 : start + duration - 0.25;
      return { text: line.text, from, to, scene: scene.id };
    })
  );
}
