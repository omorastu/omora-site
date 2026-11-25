import { LINES, voiceFile, type VoiceId } from "@/components/elorro/film/lines";
import { V2 } from "@/components/elorro/film/voice-v2";

export { LINES, TAKES, voiceFile, type VoiceId } from "@/components/elorro/film/lines";

/**
 * "How we work", the film: Elora's lines and the film's timing, in one place.
 *
 * One film, told for their business. Through the door (film.tsx, the way
 * in), her hook, then the visitor picks their kind of business and ONE
 * walkthrough plays where every line and picture is about it: getting found,
 * reviews, the website, booking, calls, behind the scenes and a tool of their
 * own, photo and video. After each, the film stops on a question ("Is this
 * something your business needs?", SERVICES) until they answer it. Then
 * their plan, what they said yes to first, and the close; and if they said
 * yes to anything, a note to send, already written. The film never shows one
 * industry's example in another's walkthrough.
 *
 * Each scene runs at least `duration` seconds and holds Elora's lines. Her
 * words are Ashan's approved script (LINES), one file per line, recorded in
 * eight takes and cut by video/scripts/voice-v2.mjs into
 * public/m/film/voice/v2/<line>.m4a; it writes where each caption-sized
 * chunk of each line starts and ends in its file (voice-v2.ts). Lines are
 * laid out from those times: a scene's first starts `lead` in, each next one
 * a `gap` after the last ends, and a line's chunks keep the spacing they have
 * in its file. A scene grows to fit her lines; she's never cut off. A line
 * not yet in voice-v2.ts is captioned only (silent), on estimated timing.
 *
 * The pictures in each scene (scenes.tsx) are timed in seconds into it, the
 * moments that go with her words (the fix arriving as she says "Now…") from
 * the start of her chunks (`at` below, passed to each scene's art).
 *
 * All the parts sit on one timeline, a few seconds apart, and the film jumps
 * between them (film.tsx): times here are seconds into that timeline.
 */

export const INDUSTRIES = ["winery", "dental", "contractor", "general"] as const;
export type Industry = (typeof INDUSTRIES)[number];

/**
 * Elora on screen (elora.tsx): drawn for now. Give her a `video` (a talking
 * avatar, square, her face in the middle) and it takes her place, played in
 * step with the film.
 */
export const elora: { video?: string; poster?: string } = {};

/** The kinds of business, as the picker and the /film page offer them, and the plan each gets. */
export const INDUSTRY: Record<Industry, { title: string; line: string; image: string; plan: string }> = {
  winery: {
    title: "Winery or venue",
    line: "See how guests find you, book a tasting and get a feel for the place.",
    image: "/m/work/prosperando-m-poster.jpg",
    plan: "Plan for your winery",
  },
  dental: {
    title: "Orthodontist or dental",
    line: "See how families find you, book a consult and hear back right away.",
    image: "/m/film/choice-dental.jpg",
    plan: "Plan for your practice",
  },
  contractor: {
    title: "Contractor",
    line: "See how homeowners find you, book a site visit and see your work.",
    image: "/m/work/pearls-drone-m-poster.jpg",
    plan: "Plan for your company",
  },
  general: {
    title: "Any other business",
    line: "See how people find you, book you and hear back right away.",
    image: "/m/film/pearls-site-d-poster.jpg",
    plan: "Plan for your business",
  },
};
/** The three on the picker; the general version is its "Don't see yours?" link. */
export const PICKER: readonly Industry[] = ["winery", "dental", "contractor"];

/**
 * Where each chunk of a line starts and ends in its file, in seconds: from
 * voice-v2.ts once the line's take is cut, else estimated from its words (a
 * little over three a second), and then it's captioned only.
 */
function chunksOf(id: VoiceId): { cue: number; end: number }[] | null {
  const cut = V2[id];
  if (cut) return cut.chunks.map(([cue, end]) => ({ cue, end }));
  return null;
}
function estimate(id: VoiceId) {
  let t = 0.3;
  return LINES[id].map((text, i) => {
    if (i) t += /[.?!:]$/.test(LINES[id][i - 1]) ? 0.45 : 0.25;
    const words = text.split(/\s+/).length;
    const pauses = (text.match(/[,:]/g) ?? []).length;
    const cue = t;
    t += words / 3.1 + pauses * 0.12;
    return { cue, end: t };
  });
}

/* ── The scenes ─────────────────────────────────────────────────────────── */

export type Kind = "opener" | "pick" | "found" | "reviews" | "site" | "booking" | "calls" | "office" | "tools" | "photo" | "plan" | "close" | "send";

/**
 * The seven things the film shows, each asked about once its scene is over:
 * what it's called (in the email a note brings us), and which of the plan's
 * eight items it is (behind the scenes and a tool of their own are one
 * question, and two items).
 */
export const SERVICES = ["found", "reviews", "site", "booking", "calls", "tools", "photo"] as const;
export type Service = (typeof SERVICES)[number];
export const SERVICE: Record<Service, { title: string; plan: number[] }> = {
  found: { title: "Getting found", plan: [0] },
  reviews: { title: "Reviews", plan: [1] },
  site: { title: "The website", plan: [2] },
  booking: { title: "Booking", plan: [3] },
  calls: { title: "Calls", plan: [4] },
  tools: { title: "Behind the scenes, and a tool of their own", plan: [5, 6] },
  photo: { title: "Photo & video", plan: [7] },
};
/** What they said to each question, this visit (film.tsx keeps it, in memory only). */
export type Answers = Partial<Record<Service, boolean>>;

/** The note they'd send, written from their business and what they said yes to; they add to it. */
const RUN: Record<Industry, string> = {
  winery: "I run a winery.",
  dental: "I run an orthodontic or dental practice.",
  contractor: "I run a contracting company.",
  general: "I run a business.",
};
const WANT: Record<Service, (ind: Industry) => string> = {
  found: () => "getting found on Google and in AI search",
  reviews: () => "managing our reviews",
  site: () => "a new website",
  booking: (ind) => ({ winery: "online booking for tastings", dental: "online booking for consults", contractor: "online booking for site visits", general: "online booking" })[ind],
  calls: () => "having every call answered",
  tools: () => "tools that take the busywork off our plate",
  photo: () => "photo & video",
};
export function noteFor(ind: Industry, yes: Service[]) {
  const wants = yes.map((s) => WANT[s](ind));
  const list = wants.length > 1 ? `${wants.slice(0, -1).join(", ")} and ${wants[wants.length - 1]}` : (wants[0] ?? "working with you");
  return `Hi Ashan and Jordan, ${RUN[ind]} I’m interested in ${list}. `;
}

export type Line = {
  text: string;
  /** When she starts it, in seconds into its scene. */
  at: number;
  /** When she has finished saying it, in seconds into its scene; her glow follows it (elora.tsx). */
  end?: number;
  /** No voice for it (yet): a caption only, and her glow stays down. */
  silent?: boolean;
  /** Its file (from public/), and where in it the line starts. */
  voice?: string;
  cue?: number;
  /** On screen in full instead (a question, the note's): no caption at the foot. */
  heading?: boolean;
};

export type Scene = {
  id: string;
  kind: Kind;
  /** The business the scene is told for; none for the shared parts. */
  ind?: Industry;
  /** The small labels at the top of the screen while the scene plays, each from `at` seconds into it to the next (none: no label). */
  labels: { text: string; at: number }[];
  duration: number;
  /** Where its own pictures are done: then the question, if it asks one (`ask`), over its last frame. */
  content: number;
  /** The question after it: which service, what she asks (the card's heading too), and when she starts and finishes asking, in seconds into it. */
  ask?: { service: Service; q: string; at: number; end: number };
  lines: Line[];
};

type Plan = {
  id: string;
  kind: Kind;
  ind?: Industry;
  /** The label; a second label from the start of chunk `relabel`; a third from `then` (seconds into the scene, worked out from her lines). */
  label: string | [string, string];
  relabel?: number;
  then?: [label: string, at: (lines: Line[]) => number];
  /** The least the pictures need, in seconds. */
  duration: number;
  /** Her lines, in order. */
  say?: VoiceId[];
  /** Her first line's start, and the quiet between two lines, in seconds. */
  lead?: number;
  gap?: number;
  /** At least `sec` seconds from the start of chunk `chunk` (the pictures that follow her words, playing out). */
  hold?: [chunk: number, sec: number];
  /** After her last word. */
  tail?: number;
  heading?: boolean;
  /** Then the question: her line for it, and the service it's about. */
  ask?: [VoiceId, Service];
};

/** The question comes in this long after a scene's own pictures are done, and the scene lasts this long after she's asked it. */
const ASK_LEAD = 0.2;
const ASK_TAIL = 1;

/** Her line `id`, laid out from `t` seconds into its scene. */
function place(id: VoiceId, t: number, heading?: boolean) {
  const cut = chunksOf(id);
  const chunks = cut ?? estimate(id);
  const first = chunks[0].cue;
  const lines: Line[] = LINES[id].map((text, i) => ({
    text,
    at: +(t + chunks[i].cue - first).toFixed(3),
    end: +(t + chunks[i].end - first).toFixed(3),
    ...(cut ? { voice: voiceFile(id), cue: chunks[i].cue } : { silent: true }),
    ...(heading ? { heading: true } : {}),
  }));
  return { lines, end: t + chunks[chunks.length - 1].end - first };
}

/** Lay her lines out in a scene, and how long it lasts. */
function resolve(p: Plan): Scene {
  const lines: Line[] = [];
  let t = p.lead ?? 0.35;
  (p.say ?? []).forEach((id, n) => {
    if (n) t += p.gap ?? 0.5;
    const said = place(id, t, p.heading);
    lines.push(...said.lines);
    t = said.end;
  });
  const last = lines[lines.length - 1];
  let duration = p.duration;
  if (last?.end !== undefined && p.say) duration = Math.max(duration, last.end + (p.tail ?? 0.35));
  if (p.hold && lines[p.hold[0]]) duration = Math.max(duration, lines[p.hold[0]].at + p.hold[1]);
  const content = +duration.toFixed(3);
  // Then the question, over its last frame: she asks it, and the film stops there (film.tsx) until it's answered.
  let ask: Scene["ask"];
  if (p.ask) {
    const said = place(p.ask[0], content + ASK_LEAD, true);
    lines.push(...said.lines);
    ask = { service: p.ask[1], q: LINES[p.ask[0]].join(" "), at: said.lines[0].at, end: +said.end.toFixed(3) };
    duration = said.end + ASK_TAIL;
  }
  const [label, label2] = typeof p.label === "string" ? [p.label, undefined] : p.label;
  const labels = label ? [{ text: label, at: 0 }] : [];
  if (label2 !== undefined && p.relabel !== undefined) labels.push({ text: label2, at: +Math.max(0.5, (lines[p.relabel]?.at ?? 0) - 0.1).toFixed(3) });
  if (p.then) labels.push({ text: p.then[0], at: +p.then[1](lines).toFixed(3) });
  return { id: p.id, kind: p.kind, ind: p.ind, labels, duration: +duration.toFixed(3), content, ask, lines };
}

/**
 * The website scene's real site (scenes.tsx, SITE_MEDIA), credited: Elorro's
 * client work, or for a practice, a concept site we built (/demos/practice).
 */
export const SITE_CREDIT: Record<Industry, string> = {
  winery: "Client work · Prosperando Vineyards",
  dental: "Concept site",
  contractor: "Client work · Pearls Farm Labor",
  general: "Client work · Pearls Farm Labor",
};
/** For a winery, a second: Pearls' site, after Prosperando's. */
export const SITE_CREDIT_2 = "Client work · Pearls Farm Labor";
/**
 * When the website scene's new site comes in (as she says they build one, her
 * second chunk, `at1` seconds in), and for a winery, when Prosperando's site
 * (which reaches its vineyards about five seconds in) cuts to Pearls'.
 */
export const siteNow = (at1?: number) => Math.max(2.6, (at1 ?? 3.7) - 0.1);
export const SITE_CUT = 5.6;
export const siteCut = (at1?: number) => siteNow(at1) + 0.2 + SITE_CUT;
/** How long a site's scroll plays before it's in and resting on its last page, and a moment on it (the Pearls loops, the practice's). */
const SITE_PLAY = 7.9;

/**
 * How long the demos play from her "Now…" (their videos' lengths, from
 * video/scripts/demos.mjs, and a moment on their finished state): each scene
 * lasts at least that long from the start of her second line.
 */
// (Booking's comes in 0.15 s after her "Now…" and plays 5.13 s; the front desk's 0.1 s before, 8.63 s; one entry's 0.3 s after,
// 4.23 s; the tool's 0.1 s after, 4.63 s.)
const BOOKING_HOLD = 0.15 + 5.13 + 0.45;
// (Reviews' comes in 0.1 s after she starts on their business, and plays 10 s: video/scripts/demos.mjs.)
export const REVIEWS_LEN = 10;
const REVIEWS_HOLD = 0.1 + REVIEWS_LEN + 0.5;
const CALLS_HOLD = -0.1 + 8.63 + 0.45;
const OFFICE_HOLD = 0.3 + 4.23 + 0.45;
const TOOL_HOLD = 0.1 + 4.63 + 0.45;
/** Her first line, once the camera is through the door (film.tsx, the way in). */
const OPENER_LEAD = 1.8;

/** One business's walkthrough: seven chapters, eight scenes, and a question after each chapter. */
const walk = (ind: Industry): Plan[] => [
  // 1 Getting found: her line for them, then how they get to the top, and into the AI answer. Then the question.
  { id: `found-${ind}`, kind: "found", ind, label: "Illustration · Getting found", duration: 12, say: [`${ind}-found`, "found-top"], hold: [3, 3.9], ask: ["ask-1", "found"] },
  // 2 Reviews: the two numbers, sourced, as she says them; then their reviews inbox, as a new one comes in and is answered (a demo, /demos/reviews).
  {
    id: `reviews-${ind}`,
    kind: "reviews",
    ind,
    label: ["Reviews · The numbers", "Demo · Reviews"],
    relabel: 3,
    duration: 12,
    say: ["reviews-shared", `${ind}-reviews`],
    hold: [3, REVIEWS_HOLD],
    tail: 0.5,
    ask: ["ask-reviews", "reviews"],
  },
  // 3 The website: a dated one, then a real one, playing on as she says what it's for. A winery's is Prosperando's, then
  // Pearls': the scene grows to fit both, and she waits while the second plays.
  {
    id: `site-${ind}`,
    kind: "site",
    ind,
    label: ["Illustration · Website", SITE_CREDIT[ind]],
    relabel: 1,
    ...(ind === "winery" ? { then: [SITE_CREDIT_2, (lines: Line[]) => siteCut(lines[1]?.at)] as Plan["then"] } : {}),
    duration: 11,
    say: ["site-shared", `${ind}-site`],
    // (From her second chunk: the site comes in 0.1 s later; a winery's cuts to Pearls' SITE_CUT after that.)
    hold: [1, ind === "winery" ? 0.1 + SITE_CUT + SITE_PLAY : 9.6],
    tail: 0.6,
    ask: ["ask-site", "site"],
  },
  // 4 Booking: the requests piling up, then their booking app, as one comes in and is confirmed (a demo, /demos/booking).
  {
    id: `booking-${ind}`,
    kind: "booking",
    ind,
    label: ["Illustration · Booking", "Demo · Booking"],
    relabel: 1,
    duration: 8,
    say: [`${ind}-booking`],
    hold: [1, BOOKING_HOLD],
    tail: 0.5,
    ask: ["ask-booking", "booking"],
  },
  // 5 Calls: the phone unanswered, then the front desk taking a call, told for them (a demo, /demos/front-desk).
  { id: `calls-${ind}`, kind: "calls", ind, label: ["Illustration · Calls", "Demo · Front desk"], relabel: 1, duration: 10, say: [`${ind}-calls`], hold: [1, CALLS_HOLD], ask: ["ask-calls", "calls"] },
  // 6 Behind the scenes: typed in by hand, then once, into everything (a demo, /demos/one-entry).
  { id: `office-${ind}`, kind: "office", ind, label: ["Illustration · Behind the scenes", "Demo · One entry"], relabel: 1, duration: 7.6, say: ["office"], hold: [1, OFFICE_HOLD], tail: 0.45 },
  // …and a tool of their own: Clinical Scribe for a practice; for the others, one built around their week (a demo, /demos/tool). Then one question for both.
  ind === "dental"
    ? { id: "tools-dental", kind: "tools", ind, label: "Clinical Scribe · Recreated screens · Demo data", duration: 17, say: ["dental-tools"], lead: 0.5, ask: ["ask-office", "tools"] }
    : { id: `tools-${ind}`, kind: "tools", ind, label: "Demo · A tool for your week", duration: 8, say: [`${ind}-tools`], lead: 0.45, hold: [1, TOOL_HOLD], ask: ["ask-office", "tools"] },
  // 7 Photo & video: for every business, the real reel (the drone shot for Pearls, into Pearls' Instagram).
  {
    id: `photo-${ind}`,
    kind: "photo",
    ind,
    label: "Client work · Pearls Farm Labor",
    duration: 12.3,
    say: [`${ind}-photo`],
    lead: 0.5,
    tail: 0.8,
    ask: ["ask-photo", "photo"],
  },
];

const PLANS: Plan[] = [
  // Through the door (film.tsx): the warm room beyond it, and her hook, from once the camera's through; with the picker to follow, her fourth line too.
  { id: "opener", kind: "opener", label: "", duration: 8, say: ["hook-1", "hook-2", "hook-3", "hook-4"], lead: OPENER_LEAD, gap: 0.45, tail: 0.3 },
  // The picker: its backdrop, as the film stops for it (film.tsx, HOLD).
  { id: "pick", kind: "pick", label: "", duration: 2 },
  // The same, for a business already known (/film?for=…): her hook, and on into its walkthrough.
  { id: "opener-direct", kind: "opener", label: "", duration: 8, say: ["hook-1", "hook-2", "hook-3"], lead: OPENER_LEAD, gap: 0.45, tail: 0.3 },
  ...INDUSTRIES.flatMap(walk),
  // Their plan (titled and itemised for their business), then the close.
  { id: "plan", kind: "plan", label: "Your plan", duration: 8.4, say: ["plan"], lead: 0.4, tail: 1.2 },
  { id: "close", kind: "close", label: "", duration: 7.5, say: ["close"], lead: 0, tail: 1.4 },
  // Said yes to anything: the note to send, written for them (film.tsx); she talks them through it, captioned, and the
  // film stops once her last caption has gone.
  { id: "send", kind: "send", label: "", duration: 2.5, say: ["send"], lead: 0.5, tail: 2.2 },
];

export const scenes: Scene[] = PLANS.map(resolve);
export const sceneById = (id: string) => scenes.find((s) => s.id === id)!;

/* ── The parts of the film, on one timeline ─────────────────────────────── */

export type SegmentId = "intro" | "pick" | "direct" | Industry | "finale" | "send";
export type Segment = { id: SegmentId; scenes: string[]; joined?: boolean };
export const SEGMENTS: Segment[] = [
  { id: "intro", scenes: ["opener"] },
  // Straight on from the opener, which plays into it.
  { id: "pick", scenes: ["pick"], joined: true },
  { id: "direct", scenes: ["opener-direct"] },
  ...INDUSTRIES.map((ind): Segment => ({ id: ind, scenes: walk(ind).map((p) => p.id) })),
  { id: "finale", scenes: ["plan", "close"] },
  { id: "send", scenes: ["send"] },
];
/** The quiet between two parts the film jumps between, in seconds: none of one is ever drawn over the other. */
export const GAP = 4;

/** Where each scene starts and how long it lasts, in seconds, where each part starts and ends, and the whole timeline's length. */
export function timeline() {
  let t = 0;
  const parts: { scene: Scene; start: number; duration: number; segment: SegmentId }[] = [];
  const segments = SEGMENTS.map((seg, k) => {
    if (k > 0 && !seg.joined) t += GAP;
    const segStart = t;
    for (const id of seg.scenes) {
      const scene = sceneById(id);
      parts.push({ scene, start: +t.toFixed(3), duration: scene.duration, segment: seg.id });
      t += scene.duration;
    }
    return { id: seg.id, start: +segStart.toFixed(3), end: +t.toFixed(3) };
  });
  return { parts, segments, total: +t.toFixed(3) };
}

/**
 * Her voice against the film: stretches of her files, each played from
 * `file` (seconds into `src`) at `film` (seconds into the timeline) for `len`
 * seconds; between two, she waits. One stretch for each of her lines' chunks
 * (each with its file); two chunks of one file in a row play on from one to
 * the next. A stretch starts a little before its chunk: in the same file,
 * half way through the quiet after the chunk before; in a new file, 0.3 s
 * before the chunk, or from the top. It runs on to the next stretch where
 * that one carries on in the same file, or else 0.35 s past her last word.
 */
export function voiceStretches() {
  const { parts } = timeline();
  type Run = { src: string; film: number; cue: number; end: number };
  const runs: Run[] = [];
  for (const p of parts) {
    for (const line of p.scene.lines) {
      if (line.silent || !line.voice) continue;
      const cue = line.cue ?? 0;
      runs.push({ src: line.voice, film: p.start + line.at, cue, end: cue + (line.end ?? line.at + 2) - line.at });
    }
  }
  if (!runs.length) return [];
  const starts = runs.map((r, i) => {
    const before = runs[i - 1];
    const carries = !!before && before.src === r.src && before.end <= r.cue && r.film - before.film - (r.cue - before.cue) < 0.05;
    const fresh = !carries;
    const file = carries ? Math.max(before.end, (before.end + r.cue) / 2) : fresh && r.cue < 0.5 ? 0 : Math.max(0, r.cue - 0.3);
    return { src: r.src, film: r.film - (r.cue - file), file, carries };
  });
  const stretches = starts.map((s, i) => {
    const next = starts[i + 1];
    const len = next?.carries ? next.file - s.file : runs[i].end - s.file + 0.35;
    return { src: s.src, film: s.film, file: s.file, len };
  });
  // From one file into another with little quiet between her lines: the
  // first stops and the second starts half way through that quiet.
  stretches.forEach((s, i) => {
    const next = stretches[i + 1];
    if (!next || starts[i + 1].carries || s.film + s.len <= next.film) return;
    const said = s.film + runs[i].end - s.file;
    const begins = runs[i + 1].film;
    const half = (said + begins) / 2;
    s.len = half - s.film;
    next.file = Math.max(0, runs[i + 1].cue - (begins - half));
    next.film = begins - (runs[i + 1].cue - next.file);
    if (starts[i + 2]?.carries) next.len = stretches[i + 2].file - next.file;
    else next.len = runs[i + 1].end - next.file + 0.35;
  });
  // Never past the end of its file (a short line, as a question is, can be shorter than its last word and the quiet
  // after it): the film picking up there, as after a question, then waits for her next stretch instead of playing nothing.
  for (const s of stretches) {
    const file = V2[s.src.split("/").pop()!.replace(/\.m4a$/, "")]?.file;
    if (file !== undefined) s.len = Math.max(0.05, Math.min(s.len, file - s.file - 0.04));
  }
  return stretches;
}

/**
 * Every caption, with when it shows and goes, in seconds into the timeline.
 * A caption stays up until her next line, even across a change of scene, so
 * none fades while the pictures move on, but never past the end of its part;
 * the last stays to the end. `said` is when she has finished saying it (its
 * `end`, or else when it would end within its own scene), which is what her
 * glow follows (elora.tsx); a silent line has none. A heading line (a
 * question, the note's) is on screen in full instead, not at the foot.
 */
export function captions() {
  const { parts, segments, total } = timeline();
  const all = parts.flatMap(({ scene, start, duration, segment }, part) =>
    scene.lines.map((line, i) => {
      const next = scene.lines[i + 1];
      const from = start + line.at;
      const said = start + (line.end ?? (next ? next.at - 0.15 : duration - 0.25));
      return { text: line.text, from, to: said, said, part, scene: scene.id, segment, silent: !line.voice, heading: !!line.heading };
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
