/**
 * "How we work", the film: Elora's lines and the film's timing, in one place.
 * Plain data, nothing imported.
 *
 * The short opening leads to the choice of business and service examples.
 * The full walkthrough continues from the opening through the one-entry
 * scene. Examples return to the choice, which also leads to the plan.
 *
 * Each scene runs `duration` seconds and holds Elora's lines, each starting
 * `at` seconds into its scene. A line's caption shows from its start to the
 * next line's, within its part of the film. The pictures in each scene
 * (scenes.tsx) are timed as shares of it, so a scene made longer or shorter
 * keeps its choreography in step.
 *
 * Her voice. Each scene she speaks in has a `cue`: where its first line
 * starts in its file, in seconds. From there her voice plays on in step with
 * the scene; where a scene runs longer than her lines in it, she waits, in
 * the quiet before her next line, until the film reaches it. A scene is never
 * shorter than her lines in it (timeline()). A line marked `silent` has no
 * voice yet: it's captioned only.
 *
 * Her file. One take of the whole script (`voice.src`) serves every scene;
 * a part of the film (SEGMENTS) can have a file of its own (its `voice`), and
 * so can a scene; a single line can too (its `voice`, with its own `cue`,
 * where it starts in that file, 0 if not given). The nearest wins: line,
 * scene, part, then the take. So a new take of one part, or of one line, drops
 * in without re-cutting the long one: put the file in public/m/film/, name it
 * there, and time it (video/README.md, "Elora's voice"). film.tsx moves her
 * from file to file in the quiet between lines, loading the next one early.
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
  | "website"
  | "local"
  | "plan"
  | "close";

/** The examples on the choice, each a scene of its own. */
export const DEMO_IDS = ["tools", "photo", "frontdesk", "website", "local"] as const;
export type DemoId = (typeof DEMO_IDS)[number];

export type Line = {
  text: string;
  at: number;
  /** When she has finished saying it, in seconds into its scene; her glow follows it (elora.tsx). */
  end?: number;
  /** No voice for it yet: a caption only, and her glow stays down. */
  silent?: boolean;
  /** A file of its own for this line (from public/, e.g. "/m/film/voice/office-2.m4a"), and where in it the line starts. */
  voice?: string;
  cue?: number;
};

export type Scene = {
  id: SceneId;
  /** The small label at the top of the screen while the scene plays. Empty: none. */
  label: string;
  duration: number;
  lines: Line[];
  /** Where her first line in this scene starts in its file, in seconds. */
  cue?: number;
  /** A file of its own for this scene's lines (see the top of this file). */
  voice?: string;
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

type ChoiceCard = { demo: DemoId; title: string; line: string; image: string };

export const choice: Record<"owners" | "services", { heading: string; cards: ChoiceCard[] }> = {
  owners: {
    heading: "What kind of business do you run?",
    cards: [
      {
        demo: "website",
        title: "Winery or venue",
        line: "Show people the place and give them a clear way to inquire.",
        image: "/m/film/pearls-site-d-poster.jpg",
      },
      {
        demo: "frontdesk",
        title: "Dental or ortho practice",
        line: "See a call turn into a booked consult.",
        image: "/m/film/choice-frontdesk.jpg",
      },
      {
        demo: "local",
        title: "Local service business",
        line: "Show customers how to start online before they come in.",
        image: "/m/work/cubic-d-poster.jpg",
      },
    ],
  },
  services: {
    heading: "What would you like to improve?",
    cards: [
      {
        demo: "website",
        title: "Website",
        line: "See a real site take a visitor from first look to inquiry.",
        image: "/m/film/pearls-site-d-poster.jpg",
      },
      {
        demo: "photo",
        title: "Photo & video",
        line: "Show what it’s like to visit or work with you.",
        image: "/m/film/choice-photo.jpg",
      },
      {
        demo: "frontdesk",
        title: "Calls & booking",
        line: "See how a call gets answered and confirmed.",
        image: "/m/film/choice-frontdesk.jpg",
      },
      {
        demo: "tools",
        title: "Custom tools",
        line: "See a consult turn into notes and a follow-up draft.",
        image: "/m/film/choice-tools.jpg",
      },
    ],
  },
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
    // Longer than her lines: Pearls' site plays on through, all of it, after her line.
    id: "site",
    label: "03 · The website",
    duration: 11.91,
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
    // The film stops here (film.tsx, HOLD) until the visitor picks a demo or goes on. Its line is the cards' heading.
    id: "choice",
    label: "",
    duration: 2,
    lines: [],
  },
  {
    // Her line from behind the scenes, then Clinical Scribe: the consult written up, the coaching for it, the follow-up letter.
    id: "tools",
    label: "Demo · Custom tools",
    duration: 17,
    cue: 52.99,
    lines: [{ text: "And build tools around how you work, like one that writes up each consult.", at: 0.5, end: 4.48 }],
  },
  {
    // Her line, then the drone footage plays on, and gives way to the posts.
    id: "photo",
    label: "Demo · Photo & video",
    duration: 12.3,
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
    id: "website",
    label: "Website example · Pearls Farm Labor",
    duration: 10.4,
    lines: [
      { text: "Pearls Farm Labor shows its crew at work.", at: 0.3, silent: true },
      { text: "Visitors can see what Pearls does and request a crew.", at: 5.1, silent: true },
    ],
  },
  {
    id: "local",
    label: "Local business example · Cubic Ship",
    duration: 9.6,
    lines: [
      { text: "Cubic Ship shows customers what they can do before they visit a counter.", at: 0.3, silent: true },
      { text: "Start online, then finish in person.", at: 4.5, silent: true },
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

/** The full walkthrough, the choice, the examples, then the plan and close. */
export type SegmentId = "main" | "choice" | DemoId | "finale";
export const SEGMENTS: { id: SegmentId; scenes: SceneId[]; joined?: boolean; voice?: string }[] = [
  { id: "main", scenes: ["elora", "call", "found", "site", "booking", "calls", "office"] },
  // Straight on from the first minute, which plays into it.
  { id: "choice", scenes: ["choice"], joined: true },
  { id: "tools", scenes: ["tools"] },
  { id: "photo", scenes: ["photo"] },
  { id: "frontdesk", scenes: ["frontdesk"] },
  { id: "website", scenes: ["website"] },
  { id: "local", scenes: ["local"] },
  { id: "finale", scenes: ["plan", "close"] },
];
/** The quiet between two parts the film jumps between, in seconds: none of one is ever drawn over the other. */
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
    if (k > 0 && !seg.joined) t += GAP;
    const segStart = t;
    seg.scenes.forEach((id, j) => {
      const scene = scenes.find((s) => s.id === id)!;
      const next = scenes.find((s) => s.id === seg.scenes[j + 1]);
      const first = scene.lines[0]?.at ?? 0;
      const last = scene.lines[scene.lines.length - 1];
      let need = 0;
      const oneFile = !!next && fileOf(scene) === fileOf(next) && [...scene.lines, ...next.lines].every((l) => !l.voice);
      if (scene.cue !== undefined && next?.cue !== undefined && oneFile) need = first + next.cue - scene.cue - (next.lines[0]?.at ?? 0);
      else if (last?.end !== undefined && scene.lines.some((l) => !l.silent)) need = last.end + 0.3;
      const duration = Math.max(scene.duration, need);
      parts.push({ scene, start: t, duration, segment: seg.id });
      t += duration;
    });
    return { id: seg.id, start: segStart, end: t };
  });
  return { parts, segments, total: t };
}

/** The file a scene's lines are in (a line's own `voice` aside): the scene's, its part's, or the take. */
export function fileOf(scene: Scene): string | undefined {
  return scene.voice ?? SEGMENTS.find((g) => g.scenes.includes(scene.id))?.voice ?? voice.src;
}

/**
 * Her voice against the film: stretches of her files, each played from
 * `file` (seconds into `src`) at `film` (seconds into the timeline) for `len`
 * seconds; between two, she waits. One stretch for each run of a scene's
 * lines in one file, and one for each line with a file of its own. A stretch
 * starts a little before its first line: in the same file, half way through
 * the quiet after the line before (by her lines' `end`), where she also waits
 * if the scene before runs longer; in a new file, 0.3 s before the line, or
 * from the top. It runs on to the next stretch where that one carries on in
 * the same file, or else 0.35 s past her last word; the last, to the end.
 * Without a file, one stretch: the file is the film's time.
 */
export function voiceStretches() {
  const { parts } = timeline();
  type Run = { src: string; film: number; cue: number; end: number };
  const runs: Run[] = [];
  for (const p of parts) {
    const scene = p.scene;
    if (scene.cue === undefined && scene.lines.every((l) => !l.voice)) continue;
    const first = scene.lines[0]?.at ?? 0;
    let run: Run | null = null;
    for (const line of scene.lines) {
      if (line.silent) continue;
      const spoken = (line.end ?? line.at + 2) - line.at;
      if (line.voice) {
        run = null;
        const cue = line.cue ?? 0;
        runs.push({ src: line.voice, film: p.start + line.at, cue, end: cue + spoken });
        continue;
      }
      const src = fileOf(scene);
      if (!src || scene.cue === undefined) continue;
      const at = scene.cue + line.at - first;
      if (run) run.end = at + spoken;
      else {
        run = { src, film: p.start + line.at, cue: at, end: at + spoken };
        runs.push(run);
      }
    }
  }
  if (!runs.length) return [{ src: voice.src ?? "", film: 0, file: 0, len: Infinity }];
  const starts = runs.map((r, i) => {
    const before = runs[i - 1];
    const carries = !!before && before.src === r.src && before.end <= r.cue;
    const fresh = !runs.slice(0, i).some((x) => x.src === r.src);
    const file = carries ? Math.max(before.end, (before.end + r.cue) / 2) : fresh && r.cue < 0.5 ? 0 : Math.max(0, r.cue - 0.3);
    return { src: r.src, film: r.film - (r.cue - file), file };
  });
  const stretches = starts.map((s, i) => {
    const next = starts[i + 1];
    const carries = !!next && next.src === s.src && runs[i].end <= runs[i + 1].cue;
    const len = !next ? Infinity : carries ? next.file - s.file : runs[i].end - s.file + 0.35;
    return { ...s, len };
  });
  // From one file into another with little quiet between her lines: the
  // first stops and the second starts half way through that quiet.
  stretches.forEach((s, i) => {
    const next = stretches[i + 1];
    if (!next || next.src === s.src || s.film + s.len <= next.film) return;
    const said = s.film + runs[i].end - s.file;
    const starts = runs[i + 1].film;
    const half = (said + starts) / 2;
    s.len = half - s.film;
    next.file = Math.max(0, runs[i + 1].cue - (starts - half));
    next.film = starts - (runs[i + 1].cue - next.file);
    if (stretches[i + 2] && stretches[i + 2].src === next.src) next.len = stretches[i + 2].file - next.file;
    else if (Number.isFinite(next.len)) next.len = runs[i + 1].end - next.file + 0.35;
  });
  return stretches;
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
