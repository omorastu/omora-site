/**
 * "How we work", the film: Elora's lines and the film's timing, in one place.
 * Plain data, nothing imported.
 *
 * The film runs in parts (SEGMENTS). The first minute plays on its own, from
 * Elora to the one-entry moment behind the scenes. Then it stops on a choice:
 * three short demos, any or all of them in any order, each coming back to the
 * choice when it's done. "Next" goes on to the plan and the close.
 *
 * Each scene runs `duration` seconds and holds Elora's lines, each starting
 * `at` seconds into its scene. A line's caption shows from its start to the
 * next line's, within its part of the film. The pictures in each scene
 * (scenes.tsx) are timed as shares of it, so a scene made longer or shorter
 * keeps its choreography in step.
 *
 * Her voice is one file (`voice.src`). Each scene she speaks in has a `cue`:
 * where its first line starts in the file, in seconds. From there her voice
 * plays on in step with the scene; where a scene runs longer than her lines in
 * it, she waits, in the quiet before her next line, until the film reaches it.
 * A scene is never shorter than her lines in it (timeline()). A line marked
 * `silent` has no voice yet: it's captioned only.
 *
 * All the parts sit on one timeline, a few seconds apart, and the film jumps
 * between them (film.tsx): times here are seconds into that timeline.
 */

export type SceneId =
  | "elora"
  | "call"
  | "found"
  | "site"
  | "booking"
  | "calls"
  | "office"
  | "choice"
  | "tools"
  | "photo"
  | "frontdesk"
  | "plan"
  | "close";

/** The three demos on the choice, each a scene of its own. */
export type DemoId = "tools" | "photo" | "frontdesk";
export const DEMO_IDS: DemoId[] = ["tools", "photo", "frontdesk"];

export type Line = {
  text: string;
  at: number;
  /** When she has finished saying it, in seconds into its scene; her glow follows it (elora.tsx). */
  end?: number;
  /** No voice for it yet: a caption only, and her glow stays down. */
  silent?: boolean;
};

export type Scene = {
  id: SceneId;
  /** The small label at the top of the screen while the scene plays. Empty: none. */
  label: string;
  duration: number;
  lines: Line[];
  /** Where her first line in this scene starts in her file, in seconds. */
  cue?: number;
};

/**
 * Elora on screen (elora.tsx): drawn for now. Give her a `video` (a talking
 * avatar, square, her face in the middle) and it takes her place, played in
 * step with the film; give it her voice too and point `voice.src` at it.
 */
export const elora: { video?: string; poster?: string } = {};

// Her own voice: ElevenLabs, "Sia", one take of the whole script, with one
// phrase cut out of it (video/README.md, "Elora's voice").
export const voice: { src?: string } = { src: "/m/film/elora-sia.m4a" };

/** The choice, after the one-entry moment: its line, and a card for each demo. */
export const choice = {
  line: "Pick one to see it in action.",
  next: "Next",
  cards: [
    { demo: "tools" as DemoId, title: "Custom tools", line: "A consult, written up for you" },
    { demo: "photo" as DemoId, title: "Photo & video", line: "Your place, on camera" },
    { demo: "frontdesk" as DemoId, title: "Front desk, behind the scenes", line: "Watch a call get handled" },
  ],
};

export const scenes: Scene[] = [
  // Times from her take (video/README.md). Each scene starts on her first line in it, except this one, which opens on the logo.
  {
    id: "elora",
    label: "",
    duration: 8,
    cue: 0.07,
    lines: [
      { text: "Hi, I’m Elora, Ashan and Jordan’s assistant.", at: 1.6, end: 4.84 },
      { text: "Let me show you how they work.", at: 5.25, end: 6.49 },
    ],
  },
  {
    id: "call",
    label: "01 · The call",
    duration: 6.63,
    cue: 5.47,
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
    cue: 12.1,
    lines: [
      { text: "Say you run a winery, and you’re on page two, where no one looks.", at: 0, end: 4.05 },
      { text: "They get you to the top when people search,", at: 4.59, end: 6.7 },
      { text: "and into the answer when people ask AI, which more and more of them do.", at: 6.84, end: 11.29 },
    ],
  },
  {
    // Longer than her lines (by the phrase cut from them): Pearls' site plays on after her line.
    id: "site",
    label: "03 · The website",
    duration: 8.41,
    cue: 23.95,
    lines: [
      { text: "If your website’s dated and cluttered, people leave.", at: 0, end: 3.14 },
      { text: "They build one that’s clear and easy to use.", at: 3.68, end: 6.29 },
    ],
  },
  {
    id: "booking",
    label: "04 · Booking",
    duration: 7.45,
    cue: 30.68,
    lines: [
      { text: "Booking by text and email means sorting it all by hand.", at: 0, end: 3.24 },
      { text: "Now guests book in a click, and it’s confirmed on its own.", at: 3.73, end: 7.04 },
    ],
  },
  {
    id: "calls",
    label: "05 · Calls",
    duration: 8.31,
    cue: 38.13,
    lines: [
      { text: "Or say you’re an orthodontist, and the front desk is too busy to pick up.", at: 0, end: 4.11 },
      { text: "Now every call is answered, booked in and followed up.", at: 4.6, end: 7.93 },
    ],
  },
  {
    // To the one entry filling in all three, held a moment; then the choice.
    id: "office",
    label: "06 · Behind the scenes",
    duration: 7.3,
    cue: 46.44,
    lines: [
      { text: "Behind the scenes, the same patient gets typed in three times.", at: 0, end: 3.67 },
      { text: "They make one entry fill in all three.", at: 4.12, end: 6.42 },
    ],
  },
  {
    // The film stops here (film.tsx, HOLD) until the visitor picks a demo or goes on.
    id: "choice",
    label: "",
    duration: 2,
    lines: [{ text: choice.line, at: 0.3, silent: true }],
  },
  {
    // Her line from behind the scenes, then Clinical Scribe writing up the consult.
    id: "tools",
    label: "Demo · Custom tools",
    duration: 8.5,
    cue: 52.99,
    lines: [{ text: "And build tools around how you work, like one that writes up each consult.", at: 0.5, end: 4.48 }],
  },
  {
    // Her line, then the drone footage plays on.
    id: "photo",
    label: "Demo · Photo & video",
    duration: 7,
    cue: 57.33,
    lines: [{ text: "And photos and video that show what you do.", at: 0.5, end: 2.84 }],
  },
  {
    // A call handled behind the scenes, step by step. No voice for it yet.
    id: "frontdesk",
    label: "Demo · Front desk",
    duration: 13,
    lines: [
      { text: "A call comes in while the desk is busy, and it’s answered for them.", at: 0.5, silent: true },
      { text: "As she talks, what she wants is picked out.", at: 3.6, silent: true },
      { text: "A slot is found and booked, and her record fills in.", at: 6.7, silent: true },
      { text: "The confirmation goes out by text. Nobody had to stop.", at: 9.7, silent: true },
    ],
  },
  {
    // A little longer than her lines: the page, all ticked, a moment to read.
    id: "plan",
    label: "07 · The plan",
    duration: 7.8,
    cue: 60.05,
    lines: [
      { text: "After the first call, you get it all on one page:", at: 0, end: 3.1 },
      { text: "what they’ll do, in what order, and how long it takes.", at: 3.42, end: 6.41 },
    ],
  },
  {
    id: "close",
    label: "",
    duration: 7.5,
    cue: 66.98,
    lines: [
      { text: "One plan, built by the two of them,", at: 0, end: 2.03 },
      { text: "and looked after once it’s live.", at: 2.12, end: 3.79 },
      { text: "If that sounds right, book a call.", at: 4.18, end: 5.88 },
    ],
  },
];

/** The film's parts, in order: the first minute, the choice, each demo, then the plan and the close. */
export type SegmentId = "main" | "choice" | DemoId | "finale";
export const SEGMENTS: { id: SegmentId; scenes: SceneId[] }[] = [
  { id: "main", scenes: ["elora", "call", "found", "site", "booking", "calls", "office"] },
  { id: "choice", scenes: ["choice"] },
  { id: "tools", scenes: ["tools"] },
  { id: "photo", scenes: ["photo"] },
  { id: "frontdesk", scenes: ["frontdesk"] },
  { id: "finale", scenes: ["plan", "close"] },
];
/** The quiet between two parts on the timeline, in seconds: none of one is ever drawn over the other. */
export const GAP = 4;

/**
 * Where each scene starts and how long it lasts, in seconds, where each part
 * starts and ends, and the whole timeline's length. A scene lasts at least
 * from her first line in it to her first in the next scene of its part, as
 * her file has them, so her voice is never cut; the last of a part, at least
 * until she has finished her last line in it.
 */
export function timeline() {
  let t = 0;
  const parts: { scene: Scene; start: number; duration: number; segment: SegmentId }[] = [];
  const segments = SEGMENTS.map((seg, k) => {
    if (k > 0) t += GAP;
    const segStart = t;
    seg.scenes.forEach((id, j) => {
      const scene = scenes.find((s) => s.id === id)!;
      const next = scenes.find((s) => s.id === seg.scenes[j + 1]);
      const first = scene.lines[0]?.at ?? 0;
      const last = scene.lines[scene.lines.length - 1];
      let need = 0;
      if (scene.cue !== undefined && next?.cue !== undefined) need = first + next.cue - scene.cue - (next.lines[0]?.at ?? 0);
      else if (scene.cue !== undefined && last?.end !== undefined) need = last.end + 0.3;
      const duration = Math.max(scene.duration, need);
      parts.push({ scene, start: t, duration, segment: seg.id });
      t += duration;
    });
    return { id: seg.id, start: segStart, end: t };
  });
  return { parts, segments, total: t };
}

/**
 * Her voice against the film: stretches of her file, each played from `file`
 * (seconds into it) at `film` (seconds into the timeline) for `len` seconds;
 * between two, she waits. A stretch for each scene she speaks in, from its
 * first line, starting a little before it, in the quiet after her line before
 * (half way through it, by her lines' `end`), where she also waits if the
 * scene before runs longer. Without cues, one stretch: the file is the film's time.
 */
export function voiceStretches() {
  const { parts } = timeline();
  const voiced = parts.filter((p) => p.scene.cue !== undefined);
  if (!voiced.length) return [{ film: 0, file: 0, len: Infinity }];
  const starts = voiced.map((p, i) => {
    const cue = p.scene.cue!;
    const first = p.scene.lines[0]?.at ?? 0;
    const before = voiced[i - 1]?.scene;
    const last = before?.lines[before.lines.length - 1];
    // Where she finished her line before, in the file; half way from there to this cue.
    const done = before && last?.end !== undefined ? before.cue! + last.end - (before.lines[0]?.at ?? 0) : cue - 0.3;
    const file = i === 0 ? 0 : Math.max(done, (done + cue) / 2);
    return { film: p.start + first - (cue - file), file };
  });
  return starts.map((s, i) => ({ ...s, len: starts[i + 1] ? starts[i + 1].file - s.file : Infinity }));
}

/**
 * Every caption, with when it shows and goes, in seconds into the timeline.
 * A caption stays up until her next line, even across a change of scene, so
 * none fades while the pictures move on, but never past the end of its part;
 * the last stays to the end. `said` is when she has finished saying it (its
 * `end`, or else when it would end within its own scene), which is what her
 * glow follows (elora.tsx); a silent line has none.
 */
export function captions() {
  const { parts, segments, total } = timeline();
  const all = parts.flatMap(({ scene, start, duration, segment }) =>
    scene.lines.map((line, i) => {
      const next = scene.lines[i + 1];
      const from = start + line.at;
      const said = line.silent ? from : start + (line.end ?? (next ? next.at - 0.15 : duration - 0.25));
      return { text: line.text, from, to: said, said, scene: scene.id, segment, silent: !!line.silent };
    })
  );
  all.forEach((c, i) => {
    const next = all[i + 1];
    const end = segments.find((s) => s.id === c.segment)!.end;
    // The last stays on the final frame (film.css, .film-cap--last).
    c.to = next && next.segment === c.segment ? next.from - 0.15 : next ? end : total;
  });
  return all;
}
