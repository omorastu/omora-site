import { createContext, useContext, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import type { Cue } from "@/components/elorro/film/effects";
import {
  INDUSTRY,
  REVIEWS_LEN,
  SERVICE,
  SERVICES,
  SITE_CREDIT,
  SITE_CREDIT_2,
  siteCut,
  siteNow,
  type Answers,
  type Industry,
  type Kind,
} from "@/components/elorro/film/script";

/**
 * The film's pictures. Each scene fills the frame in layers, which the camera
 * moves at different speeds (film.css, "camera"), so they read as depth:
 * - far: the backdrop, edge to edge, soft light only: gradients, no blur
 *   filters (they're costly on a phone), and nothing floating in it;
 * - mid: the scene itself, on a set as big as the screen allows, its big
 *   words in HTML so a shine can cross them like the logo's;
 * - near (the opener and the close only): what sits over the set.
 *
 * Two shapes of set. Wide (desktop, tablets, a phone on its side): a square,
 * 1000 × 1000. Tall (a phone upright, film.css "phones first"): 1000 × 1100,
 * the whole width and the height between the top bar and the captions, and
 * each scene laid out for it: bigger cards and type, side-by-side things
 * stacked. `tall` picks which; film.tsx follows the screen.
 *
 * Every scene is told for one business (`ind`): its words and pictures come
 * from the tables below (SEARCH, DATED, INBOX, REC, PLAN) and the demos'
 * videos (MEDIA, /demos), and an
 * orthodontist never sees a winery's, nor a winery a patient. Real work keeps
 * its "Client work · …" credit; anything made up says Illustration or Demo.
 *
 * Every move is a CSS animation on the film's one clock (film.tsx): a beat is
 * an effect starting a share of the way into its scene. Most scenes are timed
 * in seconds against her lines (`at`, where each starts; see script.ts), so
 * the fix arrives as she says it whatever the length of her take; a few keep
 * the pace they were designed at, as shares of that length, whatever their
 * scene's (the Pearls reel, the close). A thing that moves never carries a
 * transform attribute of its own: its effect goes on a wrapping <g>.
 */

/** A scene as its pictures need it: which, how it's laid out, for whom, and her timing in it. */
export type ArtProps = {
  /** The scene's id: its videos are named after it. */
  id: string;
  tall: boolean;
  ind: Industry;
  /** Where each of her lines in the scene starts, and ends, in seconds into it. */
  at: number[];
  end: number[];
  /** The scene's length, in seconds. */
  d: number;
  /** Where its own pictures are done, in seconds into it: after that, the question it asks, over its last frame. */
  content: number;
  /** What they've said to the questions so far (the plan follows them). */
  answers: Answers;
};

type Vars = CSSProperties & Record<`--${string}`, string | number>;
type Opts = { len?: number; n?: number; dx?: number; dy?: number; cls?: string };
type Beat = { className: string; style: Vars };
type Box = [x: number, y: number, w: number, h: number];
export type SceneArt = { far: ReactNode; mid: ReactNode; near?: ReactNode };

/** An effect, `at` seconds into a scene `D` seconds long (or designed so: then it keeps that pace's shares). */
const beats =
  (D: number) =>
  (kind: string, at: number, o: Opts = {}): Beat => {
    const style: Vars = { "--at": +(Math.max(0, at) / D).toFixed(4) };
    if (o.len) style["--len"] = `${o.len}s`;
    if (o.n) style["--n"] = o.n;
    if (o.dx !== undefined) style["--dx"] = `${o.dx}px`;
    if (o.dy !== undefined) style["--dy"] = `${o.dy}px`;
    return { className: `fx fx-${kind}${o.cls ? ` ${o.cls}` : ""}`, style };
  };
type Beats = ReturnType<typeof beats>;
/** Beats designed for a scene `D` seconds long, kept to their shares of where its own pictures are done (a question may follow them). */
const paced =
  (D: number, p: ArtProps): Beats =>
  (kind, at, o = {}) =>
    beats(p.d)(kind, (at * p.content) / D, o);
/** A circle as a path, so it can be drawn on (pathLength 1): from its left, down and round. */
const ring = (cx: number, cy: number, r: number) => `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`;
/** A magnifying glass at (cx, cy), its lens r. */
const lens = (cx: number, cy: number, r: number) => `${ring(cx, cy, r)} M ${cx + r * 0.75} ${cy + r * 0.8} L ${cx + r * 1.75} ${cy + r * 1.8}`;
/** A four-pointed sparkle at (cx, cy), r to its points: the usual sign of an AI answer. */
const sparkle = (cx: number, cy: number, r: number) =>
  `M ${cx} ${cy - r} Q ${cx} ${cy} ${cx + r} ${cy} Q ${cx} ${cy} ${cx} ${cy + r} Q ${cx} ${cy} ${cx - r} ${cy} Q ${cx} ${cy} ${cx} ${cy - r} Z`;
const HANDSET = "q 10 -18 22 -6 l 8 8 q 6 8 -2 16 q 10 18 26 26 q 8 -8 16 -2 l 8 8 q 12 12 -6 22 q -38 6 -72 -72 z";
const STAR = "l 5.5 11 l 12 1.6 l -8.8 8.6 l 2.4 12 l -11.1 -5.6 l -11.1 5.6 l 2.4 -12 l -8.8 -8.6 l 12 -1.6 z";
/** About how wide a line of Hanken is, in set units, at `size`. */
const wide = (text: string, size: number, em = 0.52) => text.length * size * em;

/** A drawing on the set. */
function Art({ tall, children }: { tall: boolean; children: ReactNode }) {
  return (
    <svg className="film-art" viewBox={`0 0 1000 ${tall ? 1100 : 1000}`} aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}
function Far({ children }: { children: ReactNode }) {
  return (
    <svg className="film-far-art" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}
/** A soft light in a backdrop, at (cx, cy) in % of it, reaching `r` %: one gradient, nothing else. */
function Glow({ id, cx, cy, r, o, color = "#D9B66A" }: { id: string; cx: number; cy: number; r: number; o: number; color?: string }) {
  return (
    <>
      <defs>
        <radialGradient id={id} cx={`${cx}%`} cy={`${cy}%`} r={`${r}%`}>
          <stop offset="0" stopColor={color} stopOpacity={o} />
          <stop offset="1" stopColor="#0C0A08" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="1000" fill={`url(#${id})`} />
    </>
  );
}

/** A gold line with its glow: a wide faint halo, a softer glow, the metal itself. */
function Gold({ d, fx, thin }: { d: string; fx?: Beat; thin?: boolean }) {
  const draws = !!fx && /fx-(un)?draw/.test(fx.className);
  const layer = (cls: string) => (
    <path d={d} pathLength={draws ? 1 : undefined} style={fx?.style} className={`${fx ? `${fx.className} ` : ""}${cls}${thin ? " thin" : ""}`} />
  );
  return (
    <>
      {layer("g-halo")}
      {layer("g-glow")}
      {layer("g-core")}
    </>
  );
}

/** A big word, in HTML on the set: `x`, `y` in % of the set, `size` a share of its width. */
function Word({
  x,
  y,
  size,
  tone = "gold",
  rise,
  shine,
  D,
  children,
}: {
  x: number;
  y: number;
  size: number;
  tone?: "gold" | "paper" | "label" | "note";
  rise: number;
  shine?: number;
  D: number;
  children: ReactNode;
}) {
  const style: Vars = {
    left: `${x}%`,
    top: `${y}%`,
    "--size": size,
    "--at": +(rise / D).toFixed(4),
    "--sh": shine === undefined ? 3 : +(shine / D).toFixed(4),
  };
  return (
    <p className={`film-word film-word--${tone}`} style={style}>
      {children}
    </p>
  );
}

/** One stage of a scene, over the whole set: coming in at `from` (or there from the start), giving way at `to` (or staying to the end). */
function Stage({ b, from, to, children }: { b: Beats; from?: number; to?: number; children: ReactNode }) {
  const inner =
    from === undefined ? <div className="film-layer">{children}</div> : <div {...b("come", from, { len: 1, cls: "film-layer" })}>{children}</div>;
  return to === undefined ? inner : <div {...b("pass", to, { len: 0.8, cls: "film-layer" })}>{inner}</div>;
}

/** Text typed a letter at a time, from `at`, `step` apart (inside a <text>). */
function Typed({ text, at, b, step = 0.055 }: { text: string; at: number; b: Beats; step?: number }) {
  return (
    <>
      {[...text].map((ch, i) => (
        <tspan key={i} {...b("fade", at + i * step, { len: 0.1 })}>
          {ch}
        </tspan>
      ))}
    </>
  );
}

/** A count going up in place: each value at its time, giving way to the next; the last stays. */
function Count({ values, at, x, y, size, cls, b }: { values: string[]; at: number[]; x: number; y: number; size: number; cls: string; b: Beats }) {
  return (
    <>
      {values.map((v, i) => {
        const t = (
          <text className={cls} x={x} y={y} fontSize={size}>
            {v}
          </text>
        );
        return (
          <g key={v} {...b("fade", at[i], { len: 0.2 })}>
            {i < values.length - 1 ? <g {...b("out", at[i + 1], { len: 0.15 })}>{t}</g> : t}
          </g>
        );
      })}
    </>
  );
}

/** A tick in a gold circle at (cx, cy). */
function Tick({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <>
      <circle className="f-gold" cx={cx} cy={cy} r={r} />
      <path className="s-ink" style={{ strokeWidth: +(r * 0.16).toFixed(1) }} d={`M ${cx - r * 0.46} ${cy + r * 0.02} l ${r * 0.3} ${r * 0.3} l ${r * 0.62} ${-r * 0.64}`} />
    </>
  );
}

/* ── Real work, playing ────────────────────────────────────────────────── */

/** The demos of the tools (/demos, filmed for each business by video/scripts/demos.mjs): reviews, a booking, the front desk, one entry, a tool of their own. */
type ToolInd = Exclude<Industry, "dental">;
type DemoMedia = `reviews-${Industry}` | `booking-${Industry}` | `desk-${Industry}` | `entry-${Industry}` | `tool-${ToolInd}`;
export type MediaId = "pearlsSite" | "pearlsCrew" | "prosperandoSite" | "practiceSite" | "clinical" | "photoReel" | DemoMedia;
type Cuts = { desktop: string; mobile?: string; desktopSd: string; mobileSd?: string };
/** The film's own videos, made for it (video/scripts/film.mjs), in public/m/film/. */
const filmCuts = (name: string): Cuts => ({
  desktop: `/m/film/${name}-d.mp4`,
  mobile: `/m/film/${name}-m.mp4`,
  desktopSd: `/m/film/${name}-d-sd.mp4`,
  mobileSd: `/m/film/${name}-m-sd.mp4`,
});
const filmPosters = (name: string) => ({ desktop: `/m/film/${name}-d-poster.jpg`, mobile: `/m/film/${name}-m-poster.jpg` });
/**
 * Elorro's real work, playing: each video's cuts (the tall layout plays the
 * phone cut, the wide one the desktop cut) and its stills. Each plays once
 * through and holds its last frame, but a loop made to repeat (`loop`).
 */
export const MEDIA: Record<MediaId, { cuts: Cuts; poster: { desktop: string; mobile: string }; loop?: boolean }> = {
  // Pearls Farm Labor's site, as one flow, into Request a crew.
  pearlsSite: { cuts: filmCuts("pearls-site"), poster: filmPosters("pearls-site") },
  // The same site from its crews' side: the crews at work, into Request a crew (a contractor's).
  pearlsCrew: { cuts: filmCuts("pearls-crew"), poster: filmPosters("pearls-crew") },
  // Prosperando's site (Jordan's capture).
  prosperandoSite: { cuts: filmCuts("prosperando-site"), poster: filmPosters("prosperando-site") },
  // A practice's site we built as a concept (/demos/practice, a made-up practice), down to its Book a consult form.
  practiceSite: { cuts: filmCuts("practice-site"), poster: filmPosters("practice-site") },
  // Clinical Scribe: a consult recorded, written up, the coaching for it, and the follow-up letter drafted. Made-up demo data.
  clinical: { cuts: filmCuts("clinical-film"), poster: filmPosters("clinical-film") },
  // Pearls: the drone over the vines, then the posts on Pearls' Instagram.
  photoReel: { cuts: filmCuts("photo-reel"), poster: filmPosters("photo-reel") },
  // The demos, each business's own: made-up data, every screen labelled Demo. Each poster is its finished state.
  ...(Object.fromEntries(
    (["reviews", "booking", "desk", "entry", "tool"] as const).flatMap((demo) =>
      (["winery", "dental", "contractor", "general"] as const)
        .filter((ind) => demo !== "tool" || ind !== "dental")
        .map((ind) => [`${demo}-${ind}`, { cuts: filmCuts(`demo-${demo}-${ind}`), poster: filmPosters(`demo-${demo}-${ind}`) }])
    )
  ) as Record<DemoMedia, { cuts: Cuts; poster: { desktop: string; mobile: string } }>),
};
/** One video in one scene: when it plays, in seconds into the scene, and from where in it. */
export type ClipUse = { media: MediaId; at: number; until: number; offset?: number };
/** A video's place in the film is its scene's: each scene has its own element. */
export const clipKey = (scene: string, media: MediaId) => `${scene}:${media}`;

/** Where film.tsx puts a video once its scene is in the page (null as it leaves). */
export const ClipContext = createContext<((key: string, slot: HTMLElement | null) => void) | null>(null);

/**
 * A video on the set, in its box (set units): its still, and a place for the
 * video, fading in at `fx`. `clean`: no darkening at its edges. `round`: its
 * bottom corners rounded to that radius (set units), to sit exactly inside a
 * window's rounded frame, video and all (a border radius, and a clip path,
 * which also holds where the browser draws the video on a layer of its own).
 */
function Clip({ p, media, box: [x, y, w, h], fx, top, clean, round }: { p: ArtProps; media: MediaId; box: Box; fx?: Beat; top?: boolean; clean?: boolean; round?: number }) {
  const attach = useContext(ClipContext);
  const slot = useRef<HTMLDivElement>(null);
  const key = clipKey(p.id, media);
  useLayoutEffect(() => {
    attach?.(key, slot.current);
    return () => attach?.(key, null);
  }, [attach, key]);
  const V = p.tall ? 1100 : 1000;
  const c = MEDIA[media];
  const style: Vars = { ...fx?.style, left: `${x / 10}%`, top: `${(y / V) * 100}%`, width: `${w / 10}%`, height: `${(h / V) * 100}%` };
  if (round) {
    const rx = `${+((round / w) * 100).toFixed(3)}%`;
    const ry = `${+((round / h) * 100).toFixed(3)}%`;
    style.borderRadius = `0 0 ${rx} ${rx} / 0 0 ${ry} ${ry}`;
    style.clipPath = `inset(0 round 0 0 ${rx} ${rx} / 0 0 ${ry} ${ry})`;
  }
  return (
    <div className={`${fx?.className ?? ""} film-clip${top ? " film-clip--top" : ""}${clean ? " film-clip--clean" : ""}`} style={style}>
      <picture>
        <img src={p.tall ? c.poster.mobile : c.poster.desktop} alt="" decoding="async" />
      </picture>
      <div ref={slot} className="film-clip-slot" />
    </div>
  );
}

/**
 * When things happen in each demo's video, in seconds from its start: the
 * same for every business and both sizes (video/scripts/demos.mjs). The
 * scene's sounds and light follow them; `length` is the video's.
 */
const DEMO_AT = {
  // A new 5-star review comes in (0.5); its reply is typed and posted (3.3); the 3-star's reply posted (5.9); the "How did
  // we do?" text sent (6.85); a new review lands (7.8), and the rating ticks up (8.1).
  reviews: { arrives: 0.5, posted: 3.3, calm: 5.9, text: 6.85, landed: 7.8, length: REVIEWS_LEN },
  // A booking comes in (0.5), is checked and saved, and is confirmed on its own (2.8); the confirmation goes (3.4).
  booking: { tap: 0.5, confirmed: 2.8, length: 5.13 },
  // The phone rings until 1.0, is answered, the call is transcribed, the slot booked (6.1), the text sent (7.3), all handled (7.8).
  desk: { ring: 0.1, answered: 1.0, booked: 6.1, text: 7.3, done: 7.8, length: 8.63 },
  // Typed once (0.2–1.4), saved (1.9), and the three systems fill in and tick (2.2 to 3.0).
  entry: { typed: 0.2, filled: 3.0, length: 4.23 },
  // The tool is run (0.5), writes its draft line by line, and is done (3.2).
  tool: { start: 0.5, done: 3.2, length: 4.63 },
};

/** The tool's demo starts as she says they build one (her second line), and is done once it's made its draft. */
const toolAt = (p: ArtProps) => {
  const make = Math.max(2.4, (p.at[1] ?? 2.8) + 0.1);
  return { make, done: make + DEMO_AT.tool.done };
};

/**
 * A demo of a tool, playing in a window (the same as the website scene's,
 * its name in the address bar), coming in at `from`; its video starts as
 * the scene says (SCENES, clips), holding its first frame until then.
 */
function DemoFrame({ p, media, from, name, b }: { p: ArtProps; media: MediaId; from: number; name: string; b: Beats }) {
  const L = p.tall ? SITE_TALL : SITE_WIDE;
  const [fx, fy, fw, fh] = L.frame;
  const [px, py, pw, ph] = L.pill;
  const r = p.tall ? 44 : 18;
  return (
    <div {...b("come", from, { len: 0.8, cls: "film-layer" })}>
      <Art tall={p.tall}>
        <rect className="card card--site s-paper-soft" x={fx} y={fy} width={fw} height={fh} rx={r} />
        {!p.tall && (
          <g className="f-dim">
            <circle cx={fx + 32} cy={fy + L.bar / 2} r="7" />
            <circle cx={fx + 56} cy={fy + L.bar / 2} r="7" />
            <circle cx={fx + 80} cy={fy + L.bar / 2} r="7" />
          </g>
        )}
        <rect className="f-url" x={px} y={py} width={pw} height={ph} rx={ph / 2} />
        <text className="t-body" x="500" y={py + ph / 2 + L.url * 0.36} fontSize={L.url}>
          {name}
        </text>
      </Art>
      <Clip p={p} media={media} box={L.body} clean round={r - INSET} />
      <Art tall={p.tall}>
        <rect className="s-gold-edge" fill="none" x={fx} y={fy} width={fw} height={fh} rx={r} />
      </Art>
    </div>
  );
}

/* ── Through the door: the warm room beyond it, where she says hello ───── */

/** Where the camera comes to rest once it's through (film.tsx, the way in): the door's light, all round; Elora in the middle of it. */
function Opener(): SceneArt {
  return {
    far: (
      <Far>
        <Glow id="far-opener-warm" cx={50} cy={44} r={62} o={0.3} color="#E8C27A" />
        <Glow id="far-opener-floor" cx={50} cy={104} r={60} o={0.16} color="#BE9645" />
        <Glow id="far-opener-paper" cx={50} cy={40} r={30} o={0.06} color="#F4F1EA" />
      </Far>
    ),
    mid: null,
  };
}

/* ── 1 Getting found: page two, the top, and the answer an AI gives ────── */

type Search = {
  query: string;
  you: string;
  sub: string;
  lead: string;
  blurb: [string, string];
  blurbTall: string;
  ask: [string, string];
  askTall: string;
  bullets: [string, string, string];
};
/** What they'd search for, and what the result and the AI answers say, for each business. */
const SEARCH: Record<Industry, Search> = {
  winery: {
    query: "winery tasting napa",
    you: "Your winery",
    sub: "Napa · Tastings daily",
    lead: "For a tasting near Napa, try",
    blurb: ["Small-batch tastings, booked", "online, open daily."],
    blurbTall: "Small-batch tastings, booked online, open daily.",
    ask: ["Best winery for a", "tasting near Napa?"],
    askTall: "Best winery for a tasting near Napa?",
    bullets: ["Small-batch tastings", "Booked online", "Open daily"],
  },
  dental: {
    query: "orthodontist san ramon",
    you: "Your practice",
    sub: "San Ramon · New patients welcome",
    lead: "For an orthodontist nearby, try",
    blurb: ["Braces and aligners for kids", "and adults, booked online."],
    blurbTall: "Braces and aligners for kids and adults, booked online.",
    ask: ["Best orthodontist", "near San Ramon?"],
    askTall: "Best orthodontist near San Ramon?",
    bullets: ["Braces and aligners", "Consults booked online", "Kids and adults"],
  },
  contractor: {
    query: "general contractor near me",
    you: "Your company",
    sub: "General contractor · Licensed & insured",
    lead: "For a general contractor nearby, try",
    blurb: ["Remodels and additions, site", "visits booked online."],
    blurbTall: "Remodels and additions, site visits booked online.",
    ask: ["Best general contractor", "near me?"],
    askTall: "Best general contractor near me?",
    bullets: ["Remodels and additions", "Licensed and insured", "Site visits booked online"],
  },
  general: {
    query: "best near me",
    you: "Your business",
    sub: "Near you · Open today",
    lead: "Near you, people recommend",
    blurb: ["Well reviewed, quick to reply,", "and easy to book online."],
    blurbTall: "Well reviewed, quick to reply, and easy to book online.",
    ask: ["Who’s best for this", "near me?"],
    askTall: "Who’s best for this near me?",
    bullets: ["Well reviewed", "Booked online", "Open today"],
  },
};

/** The search, as laid out: its bar, the results, page two's divider, the business's result, and how far each moves. */
const FIND_WIDE = {
  x: 70, w: 860, bar: [76, 96], mag: [130, 122, 16], q: [180, 141, 46],
  res: { y: 222, h: 104, gap: 124, l1: 38, l2: 74, w1: 400, w2: 700, k: 104 },
  page: [612, 24, 90], you: { y: 640, h: 120, title: [36, 56, 46], star: [40, 77, 1], sub: [220, 99, 24] },
};
const FIND_TALL = {
  x: 40, w: 920, bar: [50, 120], mag: [108, 106, 20], q: [166, 130, 56],
  res: { y: 230, h: 136, gap: 160, l1: 50, l2: 96, w1: 460, w2: 780, k: 84 },
  page: [732, 30, 110], you: { y: 770, h: 150, title: [40, 70, 56], star: [44, 92, 1.3], sub: [260, 122, 30] },
};

/** When things happen in the search: page two as she says so, the move to the top, the AI answers. */
const foundAt = (p: ArtProps) => {
  const page = Math.max(2.2, (p.at[1] ?? 2.4) - 0.2);
  return { page, you: page + 0.2, move: (p.at[2] ?? 4.6) + 0.5, ai: (p.at[3] ?? 6.9) + 0.55 };
};

function Found(p: ArtProps): SceneArt {
  const { tall } = p;
  const b = beats(p.d);
  const S = tall ? FIND_TALL : FIND_WIDE;
  const Q = SEARCH[p.ind];
  const [barY, barH] = S.bar;
  const [py, ps, pgap] = S.page;
  const Y = S.you;
  const T = foundAt(p);
  // The query, as big as fits its bar, typed in about a second and a half.
  const qSize = Math.min(S.q[2], Math.floor((S.x + S.w - S.q[0] - 30) / (Q.query.length * 0.53)));
  const step = Math.min(0.07, 1.5 / Q.query.length);
  // The result's line under its name, in spaced capitals, as big as fits its card.
  const subSize = Math.min(Y.sub[2], Math.floor((S.w - Y.sub[0] - 28) / (Q.sub.length * 0.78)));
  const stars = (cls: string) => (
    <g className={cls} transform={`translate(${S.x + Y.star[0]} ${Y.y + Y.star[1]}) scale(${Y.star[2]})`}>
      {[0, 1, 2, 3, 4].map((s) => (
        <path key={s} d={`M ${12 + s * 30} 0 ${STAR}`} />
      ))}
    </g>
  );
  const result = (gold: boolean) => (
    <>
      <rect className={`card card--deep ${gold ? "s-gold-edge" : "s-paper-soft"}`} x={S.x} y={Y.y} width={S.w} height={Y.h} rx="18" />
      <text className={`t-disp t-left ${gold ? "t-gold" : "t-faint"}`} x={S.x + Y.title[0]} y={Y.y + Y.title[1]} fontSize={Y.title[2]}>
        {Q.you}
      </text>
      {stars(gold ? "f-gold" : "s-faint-star")}
      <text className="t-small t-left" x={S.x + Y.sub[0]} y={Y.y + Y.sub[1]} fontSize={subSize}>
        {Q.sub}
      </text>
    </>
  );
  return {
    far: (
      <Far>
        <Glow id="far-found-a" cx={50} cy={42} r={56} o={0.15} />
        <g {...b("fade", T.ai, { len: 1.2 })}>
          <Glow id="far-found-b" cx={50} cy={52} r={62} o={0.08} color="#F4F1EA" />
        </g>
      </Far>
    ),
    mid: (
      <>
        <Stage b={b} to={T.ai - 0.1}>
          <Art tall={tall}>
            {/* The search. */}
            <g {...b("rise", 0.15, { len: 1 })}>
              <rect className="card card--deep s-paper-soft" x={S.x} y={barY} width={S.w} height={barH} rx={barH / 2} />
              <path className="s-paper" d={lens(S.mag[0], S.mag[1], S.mag[2])} />
            </g>
            <text className="t-body t-left" x={S.q[0]} y={S.q[1] - (S.q[2] - qSize) * 0.36} fontSize={qSize}>
              <Typed text={Q.query} at={0.5} b={b} step={step} />
            </text>
            {[0, 1, 2].map((i) => {
              const y = S.res.y + i * S.res.gap;
              return (
                <g key={i} {...b("moveto", T.move, { len: 1.3, dy: S.res.gap })}>
                  <g {...b("rise", 1.4 + i * 0.15, { len: 0.8 })}>
                    <rect className="card card--deep" x={S.x} y={y} width={S.w} height={S.res.h} rx="16" />
                    <path className="s-dim thick" d={`M ${S.x + 34} ${y + S.res.l1} h ${S.res.w1 - i * 40}`} />
                    <path className="s-soft" d={`M ${S.x + 34} ${y + S.res.l2} h ${S.res.w2 - i * 30}`} />
                  </g>
                </g>
              );
            })}
            {/* Page two, where the business is. */}
            <g {...b("out", T.move - 0.2, { len: 0.4 })}>
              <g {...b("fade", T.page, { len: 0.6 })}>
                <path className="s-soft" d={`M ${S.x} ${py} H ${500 - pgap} M ${500 + pgap} ${py} H ${S.x + S.w}`} />
                <text className="t-small" x="500" y={py + ps * 0.36} fontSize={ps}>
                  Page 2
                </text>
              </g>
            </g>
            <g {...b("moveto", T.move, { len: 1.3, dy: S.res.y - Y.y })}>
              <g {...b("rise", T.you, { len: 0.9 })}>{result(false)}</g>
              {/* At the top, in gold. */}
              <g {...b("fade", T.move + 0.6, { len: 0.8 })}>{result(true)}</g>
            </g>
          </Art>
        </Stage>
        <Stage b={b}>{tall ? <AnswersTall b={b} at={T.ai} Q={Q} /> : <AnswersWide b={b} at={T.ai} Q={Q} />}</Stage>
      </>
    ),
  };
}

/**
 * The newer way to look: ask an AI. Two answer panels, side by side, both
 * naming the business: an AI answer on a search page and a chat. Generic UI
 * in the film's own hand, the services' names in plain text, no logos.
 */
function AnswersWide({ b, at, Q }: { b: Beats; at: number; Q: Search }) {
  return (
    <Art tall={false}>
      {/* An AI answer, at the top of a search page. */}
      <g {...b("drop", at + 0.2, { len: 0.9, dy: -50 })}>
        <rect className="page" x="50" y="110" width="440" height="650" rx="20" />
        <text className="t-ink t-left t-name" x="82" y="170" fontSize="30">
          Google
        </text>
        <rect className="s-ink-line" fill="none" x="82" y="192" width="376" height="52" rx="26" />
        <path className="s-ink-mid" d={lens(108, 216, 8)} />
        <text className="t-ink-soft t-left" x="130" y="225" fontSize={Math.min(19, Math.floor(310 / (Q.query.length * 0.52)))}>
          {Q.query}
        </text>
        {["All", "Maps", "Images"].map((t, i) => (
          <text key={t} className={`t-left ${i ? "t-ink-soft" : "t-ink t-strong"}`} x={82 + [0, 54, 124][i]} y="284" fontSize="16">
            {t}
          </text>
        ))}
        <path className="s-ink-line" d="M 82 298 H 458" />
        <path className="s-ink" style={{ strokeWidth: 3 }} d="M 82 298 H 104" />
        <g {...b("fade", at + 1.7, { len: 0.6 })}>
          <path className="s-ink-line thick" d="M 82 662 H 320" />
          <path className="s-ink-line" d="M 82 694 H 444" />
          <path className="s-ink-line" d="M 82 720 H 400" />
        </g>
      </g>
      <g {...b("rise", at + 0.8, { len: 0.8 })}>
        <rect className="f-ai" x="82" y="318" width="376" height="300" rx="16" />
        <path className="f-gold" d={sparkle(106, 352, 10)} />
        <text className="t-ink t-left t-strong" x="124" y="359" fontSize="19">
          AI answer
        </text>
      </g>
      <g {...b("fade", at + 1.2, { len: 0.6 })}>
        <text className="t-ink t-left" x="104" y="410" fontSize="21">
          {Q.lead}
        </text>
      </g>
      <g {...b("fade", at + 1.45, { len: 0.6 })}>
        <text className="t-gold-deep t-left t-strong" x="104" y="454" fontSize="28">
          {Q.you}
        </text>
        <text className="t-ink-soft t-left" x="104" y="496" fontSize="19">
          {Q.blurb[0]}
        </text>
        <text className="t-ink-soft t-left" x="104" y="524" fontSize="19">
          {Q.blurb[1]}
        </text>
      </g>
      <path pathLength={1} d={`M 104 466 H ${104 + wide(Q.you, 28, 0.56)}`} {...b("draw", at + 2.3, { len: 0.6, cls: "s-gold" })} />

      {/* And asked of a chat. */}
      <g {...b("drop", at + 0.5, { len: 0.9, dy: -50 })}>
        <rect className="page" x="510" y="110" width="440" height="650" rx="20" />
        <text className="t-ink t-left t-name" x="542" y="168" fontSize="26">
          ChatGPT
        </text>
        <path className="s-ink-mid" d="M 660 156 l 6 6 l 6 -6" />
        <rect className="s-ink-line" fill="none" x="542" y="684" width="376" height="56" rx="28" />
        <text className="t-ink-faint t-left" x="568" y="719" fontSize="19">
          Ask anything
        </text>
        <circle className="f-ink" cx="890" cy="712" r="18" />
        <path className="s-paper-on-ink" d="M 890 720 V 704 M 883 711 l 7 -7 l 7 7" />
      </g>
      <g {...b("slide-in", at + 0.9, { len: 0.7, dx: 40 })}>
        <rect className="f-ink-soft" x="630" y="204" width="288" height="96" rx="30" />
        <text className="t-ink t-left" x="654" y="244" fontSize="21">
          {Q.ask[0]}
        </text>
        <text className="t-ink t-left" x="654" y="274" fontSize="21">
          {Q.ask[1]}
        </text>
      </g>
      <g {...b("fade", at + 1.5, { len: 0.6 })}>
        <text className="t-ink t-left" x="542" y="364" fontSize="21">
          I’d go with
        </text>
      </g>
      <g {...b("fade", at + 1.75, { len: 0.6 })}>
        <text className="t-gold-deep t-left t-strong" x="542" y="408" fontSize="28">
          {Q.you}
        </text>
        {Q.bullets.map((t, i) => (
          <text key={t} className="t-ink-soft t-left" x="542" y={452 + i * 32} fontSize="19">
            •&#8194;{t}
          </text>
        ))}
      </g>
      <path pathLength={1} d={`M 542 420 H ${542 + wide(Q.you, 28, 0.56)}`} {...b("draw", at + 2.45, { len: 0.6, cls: "s-gold" })} />
    </Art>
  );
}

/** The same on a phone upright: the two answers one above the other. */
function AnswersTall({ b, at, Q }: { b: Beats; at: number; Q: Search }) {
  return (
    <Art tall>
      <g {...b("drop", at + 0.2, { len: 0.9, dy: -50 })}>
        <rect className="page" x="40" y="30" width="920" height="510" rx="26" />
        <text className="t-ink t-left t-name" x="84" y="100" fontSize="44">
          Google
        </text>
        <rect className="s-ink-line" fill="none" x="84" y="124" width="832" height="70" rx="35" />
        <path className="s-ink-mid" d={lens(122, 156, 11)} />
        <text className="t-ink-soft t-left" x="152" y="170" fontSize="30">
          {Q.query}
        </text>
        {["All", "Maps", "Images"].map((t, i) => (
          <text key={t} className={`t-left ${i ? "t-ink-soft" : "t-ink t-strong"}`} x={84 + [0, 76, 182][i]} y="240" fontSize="26">
            {t}
          </text>
        ))}
        <path className="s-ink-line" d="M 84 258 H 916" />
        <path className="s-ink" style={{ strokeWidth: 3.5 }} d="M 84 258 H 122" />
      </g>
      <g {...b("rise", at + 0.8, { len: 0.8 })}>
        <rect className="f-ai" x="84" y="276" width="832" height="236" rx="20" />
        <path className="f-gold" d={sparkle(118, 318, 13)} />
        <text className="t-ink t-left t-strong" x="142" y="328" fontSize="28">
          AI answer
        </text>
      </g>
      <g {...b("fade", at + 1.2, { len: 0.6 })}>
        <text className="t-ink t-left" x="114" y="380" fontSize="30">
          {Q.lead}
        </text>
      </g>
      <g {...b("fade", at + 1.45, { len: 0.6 })}>
        <text className="t-gold-deep t-left t-strong" x="114" y="432" fontSize="40">
          {Q.you}
        </text>
        <text className="t-ink-soft t-left" x="114" y="484" fontSize="28">
          {Q.blurbTall}
        </text>
      </g>
      <path pathLength={1} d={`M 114 446 H ${114 + wide(Q.you, 40, 0.56)}`} {...b("draw", at + 2.3, { len: 0.6, cls: "s-gold" })} />

      <g {...b("drop", at + 0.5, { len: 0.9, dy: -50 })}>
        <rect className="page" x="40" y="570" width="920" height="500" rx="26" />
        <text className="t-ink t-left t-name" x="84" y="636" fontSize="38">
          ChatGPT
        </text>
        <path className="s-ink-mid" d="M 246 620 l 9 9 l 9 -9" />
        <rect className="s-ink-line" fill="none" x="84" y="964" width="832" height="74" rx="37" />
        <text className="t-ink-faint t-left" x="120" y="1011" fontSize="28">
          Ask anything
        </text>
        <circle className="f-ink" cx="874" cy="1001" r="26" />
        <path className="s-paper-on-ink" d="M 874 1013 V 990 M 864 1000 l 10 -10 l 10 10" />
      </g>
      <g {...b("slide-in", at + 0.9, { len: 0.7, dx: 40 })}>
        <rect className="f-ink-soft" x={916 - wide(Q.askTall, 28) - 64} y="662" width={wide(Q.askTall, 28) + 64} height="78" rx="39" />
        <text className="t-ink t-left" x={916 - wide(Q.askTall, 28) - 32} y="711" fontSize="28">
          {Q.askTall}
        </text>
      </g>
      <g {...b("fade", at + 1.5, { len: 0.6 })}>
        <text className="t-ink t-left" x="84" y="806" fontSize="32">
          I’d go with
        </text>
      </g>
      <g {...b("fade", at + 1.75, { len: 0.6 })}>
        <text className="t-gold-deep t-left t-strong" x="262" y="806" fontSize="40">
          {Q.you}
        </text>
        <text className="t-ink-soft t-left" x="84" y="866" fontSize="28">
          •&#8194;{Q.bullets[0]}&#8194;•&#8194;{Q.bullets[1]}
        </text>
        <text className="t-ink-soft t-left" x="84" y="910" fontSize="28">
          •&#8194;{Q.bullets[2]}
        </text>
      </g>
      <path pathLength={1} d={`M 262 820 H ${262 + wide(Q.you, 40, 0.56)}`} {...b("draw", at + 2.45, { len: 0.6, cls: "s-gold" })} />
    </Art>
  );
}

/* ── 2 Reviews: the numbers, then their reviews answered ────────────────── */

/**
 * The two numbers, word for word as Ashan gave them, each with its source
 * under it, in small type; nothing else is claimed. Each card comes in as she
 * says its sentence.
 */
const STATS = [
  {
    figure: "97%",
    after: "",
    lines: ["of people read reviews before", "choosing a local business."],
    linesTall: ["of people read reviews before choosing", "a local business."],
    source: ["Source: BrightLocal, Local Consumer", "Review Survey 2026"],
    sourceTall: ["Source: BrightLocal, Local Consumer Review Survey 2026"],
  },
  {
    figure: "35%",
    after: " more",
    lines: ["Businesses that reply to at least", "1 in 4 reviews earn 35% more than", "average. 3 in 4 small businesses", "don’t reply to any."],
    linesTall: ["Businesses that reply to at least 1 in 4 reviews", "earn 35% more than average. 3 in 4 small", "businesses don’t reply to any."],
    source: ["Source: Womply, study of 200,000+", "U.S. small businesses (2019)"],
    sourceTall: ["Source: Womply, study of 200,000+ U.S. small businesses (2019)"],
  },
];
/** Side by side on a wide screen; one over the other, upright. */
const STAT_WIDE = { cards: [[70, 250, 420, 470], [510, 250, 420, 470]] as Box[], m: 36, fig: [140, 104], text: [204, 25, 36], src: [418, 15, 22] };
const STAT_TALL = { cards: [[50, 60, 900, 430], [50, 530, 900, 500]] as Box[], m: 52, fig: [150, 120], text: [222, 34, 46], src: [0, 23, 30] };

/** The demo comes in as she starts on their business (her fourth chunk), the numbers giving way. */
const reviewsFix = (p: ArtProps) => Math.max(6, (p.at[3] ?? 8.6) + 0.1);

function Reviews(p: ArtProps): SceneArt {
  const { tall, ind } = p;
  const b = beats(p.d);
  const FIX = reviewsFix(p);
  const S = tall ? STAT_TALL : STAT_WIDE;
  // Each card as she starts its sentence; the second's figure counted up as she says it.
  const at = [Math.max(0.3, (p.at[0] ?? 0.35) - 0.05), Math.max(2.6, (p.at[1] ?? 3.2) - 0.05)];
  return {
    far: (
      <Far>
        <Glow id="far-reviews-a" cx={50} cy={46} r={56} o={0.14} color="#E8C27A" />
        <g {...b("fade", FIX, { len: 1.4 })}>
          <Glow id="far-reviews-b" cx={50} cy={44} r={58} o={0.16} />
        </g>
      </Far>
    ),
    mid: (
      <>
        <Stage b={b} to={FIX - 0.1}>
          <Art tall={tall}>
            {STATS.map((st, k) => {
              const [x, y, w, h] = S.cards[k];
              const l = x + S.m;
              const lines = tall ? st.linesTall : st.lines;
              const source = tall ? st.sourceTall : st.source;
              const srcY = tall ? y + h - S.m - (source.length - 1) * S.src[2] : y + S.src[0];
              return (
                <g key={st.figure} {...b("rise", at[k], { len: 1 })}>
                  <rect className="card" x={x} y={y} width={w} height={h} rx={tall ? 28 : 20} />
                  <text className="t-disp t-gold t-left" x={l} y={y + S.fig[0]} fontSize={S.fig[1]}>
                    {st.figure}
                    {st.after && <tspan fontSize={S.fig[1] * 0.42}>{st.after}</tspan>}
                  </text>
                  {/* A gold line drawn under the number, a beat after it's in. */}
                  <Gold d={`M ${l} ${y + S.fig[0] + S.fig[1] * 0.2} H ${l + S.fig[1] * 1.6}`} fx={b("draw", at[k] + 0.55, { len: 0.9 })} thin />
                  {lines.map((line, i) => (
                    <text key={line} className="t-body t-left" x={l} y={y + S.text[0] + i * S.text[2]} fontSize={S.text[1]}>
                      {line}
                    </text>
                  ))}
                  {source.map((line, i) => (
                    <text key={line} className="t-faint t-left" x={l} y={srcY + i * S.src[2]} fontSize={S.src[1]}>
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}
          </Art>
        </Stage>
        <DemoFrame p={p} media={`reviews-${ind}`} from={FIX} name="Reviews · Demo" b={b} />
      </>
    ),
  };
}

/* ── 3 The website: a dated one, then one they built ──────────────────── */

type Dated = { url: string; banner: string; bannerTall: [string, string]; links: string; linksTall: [string, string]; side: string[]; cta: string; ctaTall: string };
/** The business's old site, the kind that sends people away. */
const DATED: Record<Industry, Dated> = {
  winery: {
    url: "yourwinery.com",
    banner: "WELCOME TO OUR WINERY!!!",
    bannerTall: ["WELCOME TO OUR", "WINERY!!!"],
    links: "Home | About Us | Our Wines | Events | Gift Shop | Guestbook | Links",
    linksTall: ["Home | About Us | Our Wines | Events", "Gift Shop | Guestbook | Links"],
    side: ["» Specials", "» Wine Club", "» Gift Shop", "» Directions", "» Guestbook", "» Newsletter", "» Awards", "» Photos", "» Links"],
    cta: "Click HERE to book a tasting!!",
    ctaTall: "Click HERE to book!!",
  },
  dental: {
    url: "yourpractice.com",
    banner: "WELCOME TO OUR PRACTICE!!!",
    bannerTall: ["WELCOME TO OUR", "PRACTICE!!!"],
    links: "Home | About Us | Our Team | Services | Forms | Insurance | Links",
    linksTall: ["Home | About Us | Our Team | Services", "Forms | Insurance | Links"],
    side: ["» New Patients", "» Our Doctors", "» Braces", "» Forms", "» Insurance", "» Directions", "» Smile Gallery", "» Newsletter", "» Links"],
    cta: "Click HERE to request an appt!!",
    ctaTall: "Click HERE for an appt!!",
  },
  contractor: {
    url: "yourcompany.com",
    banner: "WELCOME TO OUR COMPANY!!!",
    bannerTall: ["WELCOME TO OUR", "COMPANY!!!"],
    links: "Home | About Us | Services | Projects | Gallery | Reviews | Links",
    linksTall: ["Home | About Us | Services | Projects", "Gallery | Reviews | Links"],
    side: ["» Kitchens", "» Bathrooms", "» Additions", "» Gallery", "» Reviews", "» Directions", "» Licenses", "» Newsletter", "» Links"],
    cta: "Click HERE to request an estimate!!",
    ctaTall: "Click HERE for a quote!!",
  },
  general: {
    url: "yourbusiness.com",
    banner: "WELCOME TO OUR WEBSITE!!!",
    bannerTall: ["WELCOME TO OUR", "WEBSITE!!!"],
    links: "Home | About Us | Services | Gallery | Events | Guestbook | Links",
    linksTall: ["Home | About Us | Services | Gallery", "Events | Guestbook | Links"],
    side: ["» Specials", "» Services", "» Gallery", "» Directions", "» Guestbook", "» Newsletter", "» Awards", "» Photos", "» Links"],
    cta: "Click HERE to book!!",
    ctaTall: "Click HERE to book!!",
  },
};
/**
 * The real site each business's walkthrough shows (its credit: script.ts,
 * SITE_CREDIT): a winery, Prosperando's, then Pearls'; a practice, the
 * concept site we built (we have no dental client site); a contractor,
 * Pearls' from its crews' side; any other business, Pearls'.
 */
const SITE_MEDIA: Record<Industry, MediaId> = { winery: "prosperandoSite", dental: "practiceSite", contractor: "pearlsCrew", general: "pearlsSite" };
const SITE_MEDIA_2: Partial<Record<Industry, MediaId>> = { winery: "pearlsSite" };

/** A browser window on the set: its frame (rounded: 18, or 44 tall), its bar, its address pill, and the page in it, INSET in from the frame's sides and foot. */
const SITE_WIDE = { frame: [70, 100, 860, 596] as Box, bar: 56, url: 20, pill: [300, 110, 400, 36] as Box, body: [72, 158, 856, 536] as Box };
const SITE_TALL = { frame: [130, 40, 740, 1014] as Box, bar: 90, url: 26, pill: [190, 60, 620, 50] as Box, body: [132, 132, 736, 920] as Box };
const INSET = 2;
/** The new site comes in as she says they build one; a winery's cuts from Prosperando's to Pearls' (script.ts). */
const siteAt = (p: ArtProps) => ({ now: siteNow(p.at[1]), cut: siteCut(p.at[1]) });

function Site(p: ArtProps): SceneArt {
  const { tall, ind } = p;
  const b = beats(p.d);
  const L = tall ? SITE_TALL : SITE_WIDE;
  const [fx, fy, fw, fh] = L.frame;
  const [px, py, pw, ph] = L.pill;
  const r = tall ? 44 : 18;
  const urlY = py + ph / 2 + L.url * 0.36;
  const T = siteAt(p);
  const media = SITE_MEDIA[ind];
  const second = SITE_MEDIA_2[ind];
  return {
    far: (
      <Far>
        <Glow id="far-site-a" cx={50} cy={46} r={58} o={0.13} color="#F4F1EA" />
        <g {...b("fade", T.now, { len: 1.4 })}>
          <Glow id="far-site-b" cx={50} cy={50} r={60} o={0.16} />
        </g>
      </Far>
    ),
    mid: (
      <div {...b("rise", 0.1, { len: 1, cls: "film-layer" })}>
        {/* A browser: the same frame for the old site and the new. */}
        <Art tall={tall}>
          <rect className="card card--site s-paper-soft" x={fx} y={fy} width={fw} height={fh} rx={r} />
          {!tall && (
            <g className="f-dim">
              <circle cx={fx + 32} cy={fy + L.bar / 2} r="7" />
              <circle cx={fx + 56} cy={fy + L.bar / 2} r="7" />
              <circle cx={fx + 80} cy={fy + L.bar / 2} r="7" />
            </g>
          )}
          <rect className="f-url" x={px} y={py} width={pw} height={ph} rx={ph / 2} />
        </Art>
        {/* The new one, playing; a winery's, then a quick cut to the second. */}
        <Clip p={p} media={media} box={L.body} fx={b("fade", T.now + 0.2, { len: 0.6 })} clean round={r - INSET} />
        {second && <Clip p={p} media={second} box={L.body} fx={b("fade", T.cut, { len: 0.18 })} clean round={r - INSET} />}
        {/* Over it, until it gives way: the old one. */}
        <div {...b("pass", T.now, { len: 0.8, cls: "film-layer" })}>
          <Art tall={tall}>
            {tall ? <DatedTall b={b} body={L.body} D={DATED[ind]} /> : <DatedWide b={b} body={L.body} D={DATED[ind]} />}
            <text className="t-faint" x="500" y={urlY} fontSize={L.url}>
              {DATED[ind].url}
            </text>
          </Art>
        </div>
        <Art tall={tall}>
          {second ? (
            <>
              <g {...b("pass", T.cut, { len: 0.18 })}>
                <text x="500" y={urlY} fontSize={L.url} {...b("fade", T.now + 0.3, { len: 0.6, cls: "t-body" })}>
                  {SITE_CREDIT[ind]}
                </text>
              </g>
              <text x="500" y={urlY} fontSize={L.url} {...b("fade", T.cut, { len: 0.18, cls: "t-body" })}>
                {SITE_CREDIT_2}
              </text>
            </>
          ) : (
            <text x="500" y={urlY} fontSize={L.url} {...b("fade", T.now + 0.3, { len: 0.6, cls: "t-body" })}>
              {SITE_CREDIT[ind]}
            </text>
          )}
          <g {...b("fade", T.now + 0.9, { len: 1 })}>
            <rect className="s-gold-edge" fill="none" x={fx} y={fy} width={fw} height={fh} rx={r} />
          </g>
        </Art>
      </div>
    ),
  };
}

/** A dated, cluttered site, in its box: a shouting banner, a wall of links, a broken picture, a visitor counter. */
function DatedWide({ b, body: [x, y, w, h], D }: { b: Beats; body: Box; D: Dated }) {
  const bar = (bx: number, by: number, bw: number) => <rect key={`${bx} ${by}`} className="f-old-text" x={bx} y={by} width={bw} height="8" rx="2" />;
  return (
    <>
      <rect className="f-old-page" x={x} y={y} width={w} height={h} />
      <g {...b("pop", 0.2, { len: 0.4 })}>
        <rect className="f-old-banner" x={x + 16} y={y + 14} width={w - 32} height="70" />
        <text className="t-old t-old-yellow t-strong" x="500" y={y + 61} fontSize="32">
          {D.banner}
        </text>
      </g>
      <text x="500" y={y + 112} fontSize="16" {...b("fade", 0.35, { len: 0.2, cls: "t-old t-old-link" })}>
        {D.links}
      </text>
      <g {...b("pop", 0.5, { len: 0.4 })}>
        <rect className="f-old-box" x={x + 16} y={y + 130} width="170" height="380" />
        {D.side.map((t, i) => (
          <text key={t} className="t-old t-old-link t-left" x={x + 30} y={y + 162 + i * 38} fontSize="16">
            {t}
          </text>
        ))}
      </g>
      <g {...b("pop", 0.6, { len: 0.4 })}>
        <rect className="f-old-img" x={x + 202} y={y + 130} width="250" height="170" />
        <path className="s-old" d={`M ${x + 202} ${y + 130} l 250 170 M ${x + 452} ${y + 130} l -250 170`} />
      </g>
      <g {...b("fade", 0.7, { len: 0.3 })}>
        {[0, 1, 2, 3, 4, 5].map((i) => bar(x + 466, y + 136 + i * 26, [170, 150, 176, 120, 160, 96][i]))}
        {[0, 1, 2, 3, 4, 5].map((i) => bar(x + 202, y + 322 + i * 24, [436, 410, 438, 380, 420, 260][i]))}
      </g>
      <g {...b("blink", 1.4, { len: 0.6, n: 4 })}>
        <text className="t-old t-old-link t-left" x={x + 202} y={y + 492} fontSize="20">
          {D.cta}
        </text>
        <path className="s-old-link" d={`M ${x + 202} ${y + 497} h ${Math.round(D.cta.length * 9.2)}`} />
      </g>
      <g {...b("pop", 0.8, { len: 0.4 })}>
        <rect className="f-old-news" x={x + 656} y={y + 130} width="184" height="150" />
        <text className="t-old t-old-maroon t-strong" x={x + 748} y={y + 164} fontSize="22">
          NEWS!!!
        </text>
        {[0, 1, 2].map((i) => bar(x + 674, y + 190 + i * 24, [148, 130, 110][i]))}
      </g>
      <g {...b("pop", 0.9, { len: 0.4 })}>
        <rect className="f-old-hazard" x={x + 656} y={y + 296} width="184" height="56" />
        <rect className="f-old-page" x={x + 670} y={y + 310} width="156" height="28" />
        <text className="t-old t-old-grey t-strong" x={x + 748} y={y + 330} fontSize="13">
          UNDER CONSTRUCTION
        </text>
      </g>
      <g {...b("pop", 1, { len: 0.4 })}>
        <text className="t-old t-old-grey" x={x + 748} y={y + 386} fontSize="14">
          You are visitor no.
        </text>
        <rect className="f-old-counter" x={x + 672} y={y + 398} width="152" height="46" />
        <text className="t-mono t-old-green" x={x + 748} y={y + 430} fontSize="26">
          004217
        </text>
      </g>
      <text x="500" y={y + h - 14} fontSize="13" {...b("fade", 1.1, { len: 0.2, cls: "t-old t-old-grey" })}>
        Best viewed at 800 × 600
      </text>
    </>
  );
}

/** The same, on a phone: a desktop page squeezed small, as such sites are. */
function DatedTall({ b, body: [x, y, w], D }: { b: Beats; body: Box; D: Dated }) {
  const bar = (bx: number, by: number, bw: number) => <rect key={`${bx} ${by}`} className="f-old-text" x={bx} y={by} width={bw} height="11" rx="3" />;
  return (
    <>
      <rect className="f-old-page" x={x} y={y} width={w} height="920" />
      <g {...b("pop", 0.2, { len: 0.4 })}>
        <rect className="f-old-banner" x={x + 14} y={y + 14} width={w - 28} height="116" />
        <text className="t-old t-old-yellow t-strong" x="500" y={y + 64} fontSize="38">
          {D.bannerTall[0]}
        </text>
        <text className="t-old t-old-yellow t-strong" x="500" y={y + 110} fontSize="38">
          {D.bannerTall[1]}
        </text>
      </g>
      <g {...b("fade", 0.35, { len: 0.2 })}>
        <text className="t-old t-old-link" x="500" y={y + 170} fontSize="24">
          {D.linksTall[0]}
        </text>
        <text className="t-old t-old-link" x="500" y={y + 204} fontSize="24">
          {D.linksTall[1]}
        </text>
      </g>
      <g {...b("pop", 0.5, { len: 0.4 })}>
        <rect className="f-old-box" x={x + 14} y={y + 228} width="220" height="440" />
        {D.side.slice(0, 8).map((t, i) => (
          <text key={t} className="t-old t-old-link t-left" x={x + 30} y={y + 274 + i * 52} fontSize="23">
            {t}
          </text>
        ))}
      </g>
      <g {...b("pop", 0.6, { len: 0.4 })}>
        <rect className="f-old-img" x={x + 250} y={y + 228} width="472" height="236" />
        <path className="s-old" d={`M ${x + 250} ${y + 228} l 472 236 M ${x + 722} ${y + 228} l -472 236`} />
      </g>
      <g {...b("pop", 0.8, { len: 0.4 })}>
        <rect className="f-old-news" x={x + 250} y={y + 480} width="472" height="188" />
        <text className="t-old t-old-maroon t-strong" x={x + 486} y={y + 528} fontSize="32">
          NEWS!!!
        </text>
        {[0, 1, 2].map((i) => bar(x + 280, y + 560 + i * 30, [412, 380, 300][i]))}
      </g>
      <g {...b("fade", 0.7, { len: 0.3 })}>{[0, 1, 2, 3].map((i) => bar(x + 14, y + 692 + i * 30, [708, 660, 690, 520][i]))}</g>
      <g {...b("blink", 1.4, { len: 0.6, n: 4 })}>
        <text className="t-old t-old-link t-left" x={x + 14} y={y + 872} fontSize="26">
          {D.ctaTall}
        </text>
        <path className="s-old-link" d={`M ${x + 14} ${y + 878} h ${Math.round(D.ctaTall.length * 12)}`} />
      </g>
      <g {...b("pop", 1, { len: 0.4 })}>
        <rect className="f-old-counter" x={x + 470} y={y + 838} width="252" height="56" />
        <text className="t-mono t-old-green" x={x + 596} y={y + 878} fontSize="32">
          004217
        </text>
      </g>
    </>
  );
}

/* ── 3 Booking: the requests piling up, then their booking app ─────────── */

type Inbox = { texts: string[]; box: string; mails: [string, string][] };
/** What piles up for each: texts, and an inbox or voicemail. */
const INBOX: Record<Industry, Inbox> = {
  winery: {
    texts: ["Can I book Saturday at 2?", "Is 4 still open?", "Any room for 6 on Sunday?", "Did you get my text?", "Can we do 3 instead?"],
    box: "Inbox",
    mails: [
      ["Booking request", "Hi, is Saturday at 2 free?"],
      ["Re: Tasting for 6", "Following up on my email…"],
      ["Fwd: Saturday?", "Can you fit us in…"],
      ["Group of 8", "Any time this weekend?"],
      ["Re: Re: Booking", "Just checking again…"],
    ],
  },
  dental: {
    texts: ["Sorry, missed your call!", "Can you call me back?", "Is Thursday still open?", "Tried you again at 5", "Any time after school?"],
    box: "Voicemail",
    mails: [
      ["Voicemail · 0:42", "Hi, returning your call…"],
      ["Voicemail · 1:05", "About my son’s consult…"],
      ["Missed call", "925 555 0110"],
      ["Voicemail · 0:31", "Calling back again…"],
      ["Missed call", "925 555 0148"],
    ],
  },
  contractor: {
    texts: ["When can you come out?", "Still need that estimate", "Any update on the quote?", "Can you do Tuesday?", "Did you get my photos?"],
    box: "Voicemail",
    mails: [
      ["Voicemail · 0:48", "About the kitchen estimate…"],
      ["Voicemail · 1:12", "Following up on the remodel…"],
      ["Missed call", "925 555 0163"],
      ["Voicemail · 0:36", "Just checking in again…"],
      ["Voicemail · 0:54", "Can someone come by…"],
    ],
  },
  general: {
    texts: ["Can I book Wednesday?", "Is 3 still open?", "Any time this week?", "Did you get my text?", "Can we do 4 instead?"],
    box: "Inbox",
    mails: [
      ["Booking request", "Hi, is Wednesday at 3 free?"],
      ["Re: Appointment", "Following up on my email…"],
      ["Fwd: This week?", "Can you fit me in…"],
      ["New customer", "Any time this week?"],
      ["Re: Re: Booking", "Just checking again…"],
    ],
  },
};
/** The fix comes in as she says "Now…". */
const bookingFix = (p: ArtProps) => Math.max(3.4, (p.at[1] ?? 3.75) + 0.15);

function Booking(p: ArtProps): SceneArt {
  const { tall, ind } = p;
  const b = beats(p.d);
  const FIX = bookingFix(p);
  return {
    far: (
      <Far>
        <Glow id="far-booking-a" cx={50} cy={46} r={56} o={0.11} color="#F4F1EA" />
        <g {...b("fade", FIX, { len: 1.4 })}>
          <Glow id="far-booking-b" cx={50} cy={44} r={58} o={0.17} />
        </g>
      </Far>
    ),
    mid: (
      <>
        <Stage b={b} to={FIX - 0.1}>{tall ? <InboxTall b={b} I={INBOX[ind]} /> : <InboxWide b={b} I={INBOX[ind]} />}</Stage>
        <DemoFrame p={p} media={`booking-${ind}`} from={FIX} name="Booking · Demo" b={b} />
      </>
    ),
  };
}

function InboxWide({ b, I }: { b: Beats; I: Inbox }) {
  return (
    <Art tall={false}>
      {/* Texts, one after another. */}
      <g {...b("rise", 0.1, { len: 0.9 })}>
        <rect className="card" x="70" y="110" width="400" height="640" rx="40" />
        <text className="t-small t-left" x="108" y="170" fontSize="20">
          Messages
        </text>
        <path className="s-soft" d="M 70 196 H 470" />
      </g>
      {I.texts.map((t, i) => (
        <g key={t} {...b("pop", 0.35 + i * 0.5, { len: 0.5 })}>
          <rect className="bubble" x="96" y={222 + i * 98} width={Math.min(348, t.length * 11.6 + 46)} height="72" rx="26" />
          <text className="t-body t-left" x="120" y={266 + i * 98} fontSize="23">
            {t}
          </text>
        </g>
      ))}
      {/* And emails or voicemails, piling up. */}
      <g {...b("rise", 0.25, { len: 0.9 })}>
        <rect className="card" x="510" y="110" width="420" height="640" rx="26" />
        <text className="t-small t-left" x="546" y="170" fontSize="20">
          {I.box}
        </text>
        <path className="s-soft" d="M 510 196 H 930" />
        <circle className="f-paper" cx="886" cy="162" r="24" />
      </g>
      <Count values={["3", "8", "14"]} at={[0.6, 1.5, 2.4]} x={886} y={170} size={22} cls="t-ink t-strong" b={b} />
      {I.mails.map(([from, subject], i) => (
        <g key={from + i} {...b("rise", 0.6 + i * 0.45, { len: 0.6 })}>
          <circle className="f-paper" cx="544" cy={240 + i * 100} r="6" />
          <text className="t-body t-left t-strong" x="564" y={248 + i * 100} fontSize="24">
            {from}
          </text>
          <text className="t-faint t-left" x="564" y={282 + i * 100} fontSize="20">
            {subject}
          </text>
          {i < I.mails.length - 1 && <path className="s-soft" d={`M 544 ${308 + i * 100} H 900`} />}
        </g>
      ))}
    </Art>
  );
}

function InboxTall({ b, I }: { b: Beats; I: Inbox }) {
  return (
    <Art tall>
      <g {...b("rise", 0.1, { len: 0.9 })}>
        <rect className="card" x="40" y="30" width="920" height="500" rx="44" />
        <text className="t-small t-left" x="84" y="94" fontSize="28">
          Messages
        </text>
        <path className="s-soft" d="M 40 124 H 960" />
      </g>
      {I.texts.slice(0, 4).map((t, i) => (
        <g key={t} {...b("pop", 0.35 + i * 0.55, { len: 0.5 })}>
          <rect className="bubble" x="76" y={148 + i * 92} width={t.length * 16.2 + 64} height="76" rx="34" />
          <text className="t-body t-left" x="108" y={198 + i * 92} fontSize="32">
            {t}
          </text>
        </g>
      ))}
      <g {...b("rise", 0.25, { len: 0.9 })}>
        <rect className="card" x="40" y="560" width="920" height="520" rx="30" />
        <text className="t-small t-left" x="84" y="624" fontSize="28">
          {I.box}
        </text>
        <path className="s-soft" d="M 40 654 H 960" />
        <circle className="f-paper" cx="900" cy="614" r="32" />
      </g>
      <Count values={["3", "8", "14"]} at={[0.6, 1.5, 2.4]} x={900} y={624} size={30} cls="t-ink t-strong" b={b} />
      {I.mails.slice(0, 4).map(([from, subject], i) => (
        <g key={from + i} {...b("rise", 0.6 + i * 0.5, { len: 0.6 })}>
          <circle className="f-paper" cx="86" cy={692 + i * 100} r="8" />
          <text className="t-body t-left t-strong" x="112" y={704 + i * 100} fontSize="32">
            {from}
          </text>
          <text className="t-faint t-left" x="112" y={744 + i * 100} fontSize="27">
            {subject}
          </text>
          {i < 3 && <path className="s-soft" d={`M 84 ${770 + i * 100} H 916`} />}
        </g>
      ))}
    </Art>
  );
}

/** A choice on the booking form: picked (gold) from `pick`, if it's the one. */
/* ── 4 Calls: the phone unanswered; then the front desk takes a call ────── */

/** Whose phone rings unanswered, for each. */
const PHONE: Record<Industry, string> = { winery: "Tasting room", dental: "Front desk", contractor: "Your phone", general: "Your phone" };
/** The front desk demo comes in as she says "Now every call…". */
const callsFix = (p: ArtProps) => Math.max(3.2, (p.at[1] ?? 4.4) - 0.1);

function Calls(p: ArtProps): SceneArt {
  const { tall, ind } = p;
  const b = beats(p.d);
  const FIX = callsFix(p);
  return {
    far: (
      <Far>
        <Glow id="far-calls-a" cx={50} cy={48} r={54} o={0.1} color="#F4F1EA" />
        <g {...b("fade", FIX + DEMO_AT.desk.done, { len: 1.2 })}>
          <Glow id="far-calls-b" cx={60} cy={44} r={62} o={0.16} />
        </g>
      </Far>
    ),
    mid: (
      <>
        {/* Their phone, ringing and ringing, the missed calls counting up. */}
        <Stage b={b} to={FIX - 0.1}>
          <Art tall={tall}>
            <g transform={tall ? "translate(500 560) scale(1.3) translate(-500 -440)" : "translate(500 430) scale(.97) translate(-500 -460)"}>
              <g {...b("rise", 0.15, { len: 0.9 })}>
                <rect className="s-paper-soft card" x="330" y="120" width="340" height="680" rx="56" />
                <text className="t-small" x="500" y="236" fontSize="30">
                  {PHONE[ind]}
                </text>
                <g transform="translate(500 450) scale(2.4) translate(-300 -486)">
                  <path className="s-paper" d={`M 262 450 ${HANDSET}`} />
                </g>
                <text className="t-faint" x="500" y="690" fontSize="34">
                  Missed calls
                </text>
              </g>
              <g {...b("fade", 0.5, { len: 0.3 })}>
                <g {...b("blink", 0.6, { len: 0.6, n: 6 })}>
                  <path className="s-dim thin-ring" d="M 712 380 q 30 50 0 100 M 744 350 q 52 80 0 160 M 288 380 q -30 50 0 100 M 256 350 q -52 80 0 160" />
                </g>
              </g>
              <g {...b("pop", 0.8, { len: 0.5 })}>
                <circle className="f-paper" cx="664" cy="132" r="52" />
              </g>
              <Count values={["1", "2", "3", "4", "5"]} at={[0.8, 1.35, 1.9, 2.45, 3]} x={664} y={150} size={50} cls="t-ink t-strong" b={b} />
            </g>
          </Art>
        </Stage>
        {/* Then a call comes in, and the front desk takes it, books it and follows it up. */}
        <DemoFrame p={p} media={`desk-${ind}`} from={FIX} name="Front desk · Demo" b={b} />
      </>
    ),
  };
}

/* ── 5 Behind the scenes: the same details two or three times, then once ── */

type Rec = { type: string; first: string; when: string; name: string; phone: string; short: string; re: string };
/** The record that gets typed in, for each: a guest, a patient, a job, a customer. */
const REC: Record<Industry, Rec> = {
  winery: { type: "Guest", first: "Maya Chen", when: "Tasting for 6 · Sat 2pm", name: "Maya Chen", phone: "707 555 0186", short: "Sat 2pm", re: "Your tasting, Sat 2pm" },
  dental: { type: "Patient", first: "Sofia Park", when: "Consult · Thu 10am", name: "Sofia Park", phone: "415 555 0142", short: "Thu 10am", re: "Your consult, Thu 10am" },
  contractor: { type: "Job", first: "Bennett kitchen", when: "Site visit · Tue 9am", name: "Laura Bennett", phone: "925 555 0173", short: "Tue 9am", re: "Your site visit, Tue 9am" },
  general: { type: "Customer", first: "Emma Ruiz", when: "Appointment · Wed 3pm", name: "Emma Ruiz", phone: "510 555 0119", short: "Wed 3pm", re: "Your appointment, Wed 3pm" },
};

type Win = { x: number; w: number; h: number; bar: number; ys: number[]; title: number; label: number; value: number; k: number };
const DESK_WIDE: Win = { x: 330, w: 600, h: 200, bar: 50, ys: [110, 330, 550], title: 17, label: 20, value: 26, k: 1 };
const DESK_TALL: Win = { x: 90, w: 870, h: 270, bar: 64, ys: [210, 500, 790], title: 26, label: 28, value: 36, k: 1.4 };
const APPS = ["Booking system", "Spreadsheet", "Email"];
/** When each app gets the record typed in by hand. */
const TYPE_AT = [0.7, 1.8, 2.9];
/** The one entry comes in as she says they make one (a demo, /demos/one-entry). */
const officeAt = (p: ArtProps) => ({ one: Math.max(3.9, (p.at[1] ?? 4.1) + 0.3) });

/** One of the apps with the record in it: typed by hand (`typed`, from its time), or filled in on its own from the one entry. */
function AppFields({ i, W, wy, b, typed, R }: { i: number; W: Win; wy: number; b: Beats; typed: boolean; R: Rec }) {
  const x = W.x;
  const k = W.k;
  const name = (text: string, nx: number, ny: number, size: number) => (
    <text className={`${typed ? "t-body" : "t-gold-text"} t-left`} x={nx} y={ny} fontSize={size}>
      {typed ? <Typed text={text} at={TYPE_AT[i]} b={b} /> : text}
    </text>
  );
  const rest = (node: ReactNode) => (typed ? <g {...b("fade", TYPE_AT[i] + 0.65, { len: 0.3 })}>{node}</g> : node);
  const val = typed ? "t-body" : "t-gold-text";
  if (i === 0)
    return (
      <>
        {name(R.first, x + 170 * k, wy + 104 * k, W.value)}
        {rest(
          <text className={`${val} t-left`} x={x + 170 * k} y={wy + 158 * k} fontSize={W.value}>
            {R.when}
          </text>
        )}
      </>
    );
  if (i === 1)
    return (
      <>
        {name(R.name, x + 32 * k, wy + 154 * k, W.value - 2)}
        {rest(
          <>
            <text className={`${val} t-left`} x={x + 226 * k} y={wy + 154 * k} fontSize={W.value - 4}>
              {R.phone}
            </text>
            <text className={`${val} t-left`} x={x + 420 * k} y={wy + 154 * k} fontSize={W.value - 4}>
              {R.short}
            </text>
          </>
        )}
      </>
    );
  return (
    <>
      {name(R.name, x + 92 * k, wy + 104 * k, W.value)}
      {rest(
        <text className={`${val} t-left`} x={x + 92 * k} y={wy + 158 * k} fontSize={W.value - 2}>
          {R.re}
        </text>
      )}
    </>
  );
}

/** An app's window, its labels and lines, empty. */
function AppWindow({ i, W, wy, R }: { i: number; W: Win; wy: number; R: Rec }) {
  const x = W.x;
  const k = W.k;
  const label = (t: string, lx: number, ly: number) => (
    <text className="t-faint t-left" x={lx} y={ly} fontSize={W.label}>
      {t}
    </text>
  );
  return (
    <>
      <rect className="card card--deep s-paper-soft" x={x} y={wy} width={W.w} height={W.h} rx="18" />
      <path className="s-soft" d={`M ${x} ${wy + W.bar} H ${x + W.w}`} />
      <g className="f-dim">
        {[0, 1, 2].map((d) => (
          <circle key={d} cx={x + 26 + d * 20 * k} cy={wy + W.bar / 2} r={5 * k} />
        ))}
      </g>
      <text className="t-small t-left" x={x + 26 + 66 * k} y={wy + W.bar / 2 + W.title * 0.36} fontSize={W.title}>
        {APPS[i]}
      </text>
      {i === 0 && (
        <>
          {label(R.type, x + 32 * k, wy + 104 * k)}
          {label("Visit", x + 32 * k, wy + 158 * k)}
        </>
      )}
      {i === 1 && (
        <>
          {label("Name", x + 32 * k, wy + 98 * k)}
          {label("Phone", x + 226 * k, wy + 98 * k)}
          {label("Visit", x + 420 * k, wy + 98 * k)}
          <path className="s-soft" d={`M ${x} ${wy + 114 * k} H ${x + W.w} M ${x + 210 * k} ${wy + W.bar} V ${wy + W.h} M ${x + 404 * k} ${wy + W.bar} V ${wy + W.h}`} />
        </>
      )}
      {i === 2 && (
        <>
          {label("To", x + 32 * k, wy + 104 * k)}
          {label("Re", x + 32 * k, wy + 158 * k)}
        </>
      )}
    </>
  );
}

function Office(p: ArtProps): SceneArt {
  const { tall } = p;
  const b = beats(p.d);
  const W = tall ? DESK_TALL : DESK_WIDE;
  const R = REC[p.ind];
  const { one: ONE } = officeAt(p);
  // The card beside them: typed by hand.
  const [sx, sy, sw, sh] = tall ? ([40, 30, 920, 150] as Box) : ([70, 300, 200, 260] as Box);
  return {
    far: (
      <Far>
        <Glow id="far-office-a" cx={50} cy={40} r={58} o={0.1} color="#F4F1EA" />
        <g {...b("fade", ONE, { len: 1.2 })}>
          <Glow id="far-office-b" cx={36} cy={30} r={64} o={0.16} />
        </g>
      </Far>
    ),
    mid: (
      <>
        {/* The same details, entered by hand in each tool. */}
        <Stage b={b} to={ONE - 0.1}>
          <Art tall={tall}>
            {W.ys.map((y, i) => (
              <g key={y} {...b("rise", 0.2 + i * 0.2, { len: 0.8 })}>
                <AppWindow i={i} W={W} wy={y} R={R} />
              </g>
            ))}
            {W.ys.map((y, i) => (
              <AppFields key={y} i={i} W={W} wy={y} b={b} typed R={R} />
            ))}
            <g {...b("rise", 0.4, { len: 0.8 })}>
              <rect className="card s-paper-soft" x={sx} y={sy} width={sw} height={sh} rx="20" />
              <text className="t-small t-left" x={tall ? 84 : sx + 28} y={tall ? sy + 62 : sy + 50} fontSize={tall ? 26 : 18}>
                By hand
              </text>
              <text className="t-faint t-left" x={tall ? 84 : sx + 28} y={tall ? sy + 114 : sy + 222} fontSize={tall ? 30 : 20}>
                Repeated entry
              </text>
            </g>
          </Art>
        </Stage>
        {/* Then once: one entry, and every system fills in on its own. */}
        <DemoFrame p={p} media={`entry-${p.ind}`} from={ONE} name="One entry · Demo" b={b} />
      </>
    ),
  };
}

/** A tool of their own, as she says they build one: their notes, then what it makes of them (a demo, /demos/tool). */
function ToolDemo(p: ArtProps): SceneArt {
  const b = beats(p.d);
  const T = toolAt(p);
  return {
    far: (
      <Far>
        <Glow id="far-tool-a" cx={50} cy={46} r={58} o={0.1} color="#F4F1EA" />
        <g {...b("fade", T.done, { len: 1.2 })}>
          <Glow id="far-tool-b" cx={56} cy={44} r={62} o={0.16} />
        </g>
      </Far>
    ),
    mid: <DemoFrame p={p} media={`tool-${p.ind as ToolInd}`} from={0.15} name="Your tool · Demo" b={b} />,
  };
}

/* ── 5, and a tool of their own ────────────────────────────────────────── */

/** Clinical Scribe's consult workflow, in recreated screens with fictional data (a practice's tool of their own). */
function ClinicalTools(p: ArtProps): SceneArt {
  const { tall } = p;
  const b = beats(p.d);
  // The consult-notes window, its title bar, and its body, where the gold sketch turns into the real thing.
  const T = tall ? { win: [40, 190, 920, 850] as Box, bar: 70, title: 122, size: 92, rec: 236 } : { win: [70, 210, 860, 600] as Box, bar: 74, title: 150, size: 88, rec: 210 };
  const [wx, wy, ww, wh] = T.win;
  const body: Box = [wx + 2, wy + T.bar + 2, ww - 4, wh - T.bar - 4];
  const waveY = tall ? 470 : 420;
  const waveX = (i: number) => (tall ? 92 + i * 32 : 124 + i * 29);
  const waveK = tall ? 1.9 : 1.4;
  return {
    far: (
      <Far>
        <Glow id="far-tools" cx={36} cy={30} r={64} o={0.16} />
      </Far>
    ),
    mid: (
      <>
        <Art tall={tall}>
          <text x="500" y={T.title} fontSize={T.size} {...b("rise", 0.2, { len: 1.2, cls: "t-disp" })}>
            Clinical Scribe
          </text>
          <text x="500" y={T.title + (tall ? 42 : 34)} fontSize={tall ? 32 : 24} {...b("fade", 0.7, { len: 0.5, cls: "t-small" })}>
            Recreated screens · Demo data
          </text>
        </Art>
        <div {...b("rise", 0.5, { len: 1.1, cls: "film-layer" })}>
          <Art tall={tall}>
            <rect className="card card--deep" x={wx} y={wy} width={ww} height={wh} rx="22" />
            <path className="s-soft" d={`M ${wx} ${wy + T.bar} H ${wx + ww}`} />
            <text className="t-body t-left" x={wx + 36} y={wy + T.bar * 0.66} fontSize={tall ? 34 : 30}>
              Consult notes
            </text>
            <g {...b("blink", 0.8, { len: 1.2, n: 4 })}>
              <circle className="f-gold" cx={wx + ww - T.rec} cy={wy + T.bar / 2} r="9" />
            </g>
            <text className="t-small t-left" x={wx + ww - T.rec + 22} y={wy + T.bar * 0.62} fontSize={tall ? 26 : 22}>
              Recording
            </text>
            <g {...b("out", 1.5, { len: 0.8 })}>
              {WAVE.map((h, i) => (
                <path key={i} d={`M ${waveX(i)} ${waveY - (h * waveK) / 2} V ${waveY + (h * waveK) / 2}`} {...b("tall", 0.7 + i * 0.022, { len: 0.4, cls: "g-core thin" })} />
              ))}
              {[0, 1, 2, 3].map((i) => (
                <path
                  key={i}
                  d={`M ${wx + 70} ${waveY + (tall ? 170 : 130) + i * (tall ? 70 : 52)} H ${wx + ww - 70 - i * 80}`}
                  {...b("grow", 0.95 + i * 0.12, { len: 0.5, cls: "s-gold thick" })}
                />
              ))}
            </g>
          </Art>
          <Clip p={p} media="clinical" box={body} fx={b("fade", 1.5, { len: 0.8 })} top />
          <Art tall={tall}>
            <rect className="s-gold-edge" fill="none" x={wx} y={wy} width={ww} height={wh} rx="22" />
            <g {...b("pop", 14.6, { len: 0.7 })}>
              <g transform={tall ? "translate(500 972) scale(1.2) translate(-500 -734)" : undefined}>
                <rect className="f-gold-v" x="300" y="696" width="400" height="76" rx="10" />
                <text className="t-ink t-caps" x="500" y="744" fontSize="24">
                  Follow-up drafted
                </text>
                <circle className="f-paper" cx="730" cy="734" r="28" />
                <path className="s-ink" d="M 716 735 l 9 9 l 19 -20" />
              </g>
            </g>
          </Art>
        </div>
      </>
    ),
  };
}

const WAVE = [22, 48, 30, 70, 44, 90, 56, 34, 80, 62, 40, 96, 52, 28, 74, 58, 36, 86, 46, 64, 30, 78, 50, 38, 68, 26];

/* ── The picker and the note: their backdrop (what's on it is film.tsx's) ── */

function ChoiceBackdrop(): SceneArt {
  return {
    far: (
      <Far>
        <Glow id="far-choice-a" cx={50} cy={46} r={62} o={0.14} color="#E8C27A" />
        <Glow id="far-choice-b" cx={50} cy={100} r={56} o={0.08} color="#BE9645" />
      </Far>
    ),
    mid: null,
  };
}

/* ── 6 Photo & video ───────────────────────────────────────────────────── */

/** Pearls' reel keeps the pace it was designed at, as shares of this length, whatever its scene's. */
const REEL_D = 15.04;

/** The vineyard drawn in gold, then filmed: our drone footage for Pearls, into Pearls' posts. */
function Photo(p: ArtProps): SceneArt {
  const { tall } = p;
  const b = paced(REEL_D, p);
  const rows = [-300, -200, -100, 0, 100, 200, 300];
  const T = tall ? { title: 122, size: 92 } : { title: 150, size: 88 };
  // The viewfinder, and the footage inside it.
  const V = tall
    ? { c: [40, 190, 960, 1030], clip: [60, 210, 880, 800] as Box, rec: [100, 262], hill: "M 60 640 C 260 520, 420 590, 540 560 S 800 500, 940 580", sun: [720, 430, 66], row: [640, 1000], focus: [410, 690, 180, 140] }
    : { c: [70, 210, 930, 820], clip: [90, 230, 820, 570] as Box, rec: [132, 272], hill: "M 90 560 C 260 450, 400 510, 520 480 S 800 420, 910 500", sun: [720, 380, 58], row: [560, 800], focus: [420, 600, 160, 120] };
  return {
    far: (
      <Far>
        <Glow id="far-photo-dawn" cx={50} cy={72} r={60} o={0.22} color="#E8C27A" />
      </Far>
    ),
    mid: (
      <>
        <Art tall={tall}>
          <text x="500" y={T.title} fontSize={T.size} {...b("rise", 0.2, { len: 1.2, cls: "t-disp" })}>
            Photo &amp; video
          </text>
          <text x="500" y={T.title + (tall ? 42 : 34)} fontSize={tall ? 32 : 24} {...b("fade", 0.65, { len: 0.5, cls: "t-small" })}>
            Client work · Pearls Farm Labor
          </text>
          <g {...b("out", 1.2, { len: 0.8 })}>
            <path pathLength={1} d={V.hill} {...b("draw", 0.2, { len: 1, cls: "s-paper-soft" })} />
            <Gold d={ring(V.sun[0], V.sun[1], V.sun[2])} fx={b("draw", 0.3, { len: 0.9 })} />
            {rows.map((dx, i) => (
              <Gold key={dx} d={`M ${500 + dx * 0.12} ${V.row[0]} L ${500 + dx * 1.45} ${V.row[1]}`} fx={b("draw", 0.35 + i * 0.07, { len: 0.8 })} thin />
            ))}
          </g>
        </Art>
        <Clip p={p} media="photoReel" box={V.clip} fx={b("fade", 1.2, { len: 0.8 })} />
        {/* The viewfinder, while the drone films; it lifts as the footage gives way to the posts. */}
        <div {...b("out", 5.5, { len: 0.7, cls: "film-layer" })}>
          <Viewfinder b={b} V={V} tall={tall} />
        </div>
      </>
    ),
  };
}

/** A camera's viewfinder over the set: its corners, Rec blinking, and focus pulled at `focus`. */
function Viewfinder({ b, V, tall, focus = 1.7 }: { b: Beats; V: { c: number[]; rec: number[]; focus: number[] }; tall: boolean; focus?: number }) {
  const [c0, c1, c2, c3] = V.c;
  return (
    <Art tall={tall}>
      <path d={`M ${c0} ${c1 + 60} V ${c1} H ${c0 + 70} M ${c2 - 70} ${c1} H ${c2} V ${c1 + 60} M ${c2} ${c3 - 60} V ${c3} H ${c2 - 70} M ${c0 + 70} ${c3} H ${c0} V ${c3 - 60}`} {...b("fade", 0.2, { cls: "s-paper thick-ish" })} />
      <g {...b("blink", 0.6, { len: 0.8, n: 4 })}>
        <circle className="f-gold" cx={V.rec[0]} cy={V.rec[1]} r={tall ? 13 : 12} />
      </g>
      <text x={V.rec[0] + 24} y={V.rec[1] + 10} fontSize={tall ? 32 : 28} {...b("fade", 0.6, { cls: "t-small t-left t-on-film" })}>
        Rec
      </text>
      <g {...b("focus", focus, { len: 0.9 })}>
        <rect className="s-paper" x={V.focus[0]} y={V.focus[1]} width={V.focus[2]} height={V.focus[3]} />
      </g>
    </Art>
  );
}

/* ── The plan: the page they'd get after the first call ────────────────── */

/** What the film just showed, in the same order, as each business's plan has it: what, and a line of what that means. */
const PLAN: Record<Industry, [string, string][]> = {
  winery: [
    ["Found on Google and in AI search", "At the top when people look for a tasting"],
    ["Reviews answered, and more of them", "Every review replied to, and happy guests asked for one"],
    ["A new site", "Your wines, and exactly how to visit"],
    ["Tastings booked online", "Booked in a click, confirmed on its own"],
    ["Every call answered", "Booked in and followed up, even after hours"],
    ["One entry, no double work", "Each guest typed once, filled in everywhere"],
    ["A tool built for you", "Around how your week runs"],
    ["Photo & video", "Your vineyard, in posts people see"],
  ],
  dental: [
    ["Found on Google and in AI search", "At the top when parents look nearby"],
    ["Reviews answered, and more of them", "Careful replies, and happy patients asked for one"],
    ["A new site", "Your practice, and how to book a consult"],
    ["Consults booked online", "Booked in a click, confirmed on its own"],
    ["Every call answered", "Even while the desk is with a patient"],
    ["One entry, no double work", "Each patient typed once, filled in everywhere"],
    ["A tool built for you", "Consults written up, follow-ups drafted"],
    ["Photo & video", "A welcoming practice, before anyone walks in"],
  ],
  contractor: [
    ["Found on Google and in AI search", "At the top when homeowners look"],
    ["Reviews answered, and more of them", "Every review replied to, and happy clients asked for one"],
    ["A new site", "Your work, and how to get a quote"],
    ["Site visits booked online", "Booked in a click, confirmed on its own"],
    ["Every call answered", "Even while you’re on a job site"],
    ["One entry, no double work", "Each job typed once, filled in everywhere"],
    ["A tool built for you", "Estimates written up from your site notes"],
    ["Photo & video", "Finished work that sells the next job"],
  ],
  general: [
    ["Found on Google and in AI search", "At the top when people look for you"],
    ["Reviews answered, and more of them", "Every review replied to, and happy customers asked for one"],
    ["A new site", "What you do, and what to do next"],
    ["Booking online", "Booked in a click, confirmed on its own"],
    ["Every call answered", "Booked in and followed up, even after hours"],
    ["One entry, no double work", "Each customer typed once, filled in everywhere"],
    ["A tool built for you", "Around how your week runs"],
    ["Photo & video", "What you do, in posts people see"],
  ],
};
/**
 * The page, wide and tall. `split`: with what they said yes to first and the
 * rest under "Also available" (a closer pitch, the label's room, and the
 * quieter rows' own pitch and sizes).
 */
const PAGE_WIDE = {
  page: [190, 40, 620, 790] as Box, m: 52, mark: [100, 24], date: 16, rule: 122, title: [180, 44], by: [210, 17],
  items: [262, 52], indent: 46, num: 21, what: 18, why: [14.5, 21.5], tick: [-14, -6, 12], line: 34, sep: 676,
  field: { label: 708, size: 13, y: 722, h: 24, w: 230, dx: 286 }, foot: [802, 14],
  split: { pitch: 48, label: 58, size: 12.5, first: 34, also: 42, what: 16, why: [13, 18.5] },
};
const PAGE_TALL = {
  page: [50, 30, 900, 1040] as Box, m: 60, mark: [104, 34], date: 24, rule: 136, title: [210, 60], by: [252, 26],
  items: [322, 74], indent: 64, num: 30, what: 28, why: [23.5, 34], tick: [-24, -10, 19], line: 50, sep: 900,
  field: { label: 942, size: 22, y: 960, h: 34, w: 370, dx: 410 }, foot: [1050, 22],
  split: { pitch: 66, label: 76, size: 20, first: 48, also: 58, what: 25, why: [20, 30] },
};
/** Each item they said yes to ticked as she runs through the page (`n` of them); the two fields lit as she says how long it takes. */
const planAt = (p: ArtProps, n: number) => {
  const a = (p.at[0] ?? 0.4) + 1.5;
  const z = Math.max(a + 3.6, (p.at[1] ?? 3.8) + 1.9);
  return { ticks: Array.from({ length: n }, (_, i) => +(a + ((z - a) * i) / Math.max(1, n - 1)).toFixed(2)), fields: (p.at[1] ?? 3.8) + 2.4 };
};
/**
 * Their plan's items, as they answered: what they said yes to, in the film's
 * order, then the rest ("Also available"). Yes to nothing (or not asked yet),
 * or to everything: the whole plan, as one list.
 */
export function planFor(ind: Industry, answers: Answers) {
  const items = PLAN[ind];
  const yes = new Set(SERVICES.filter((s) => answers[s] === true).flatMap((s) => SERVICE[s].plan));
  if (!yes.size || yes.size === items.length) return { first: items, also: [] as [string, string][] };
  return { first: items.filter((_, i) => yes.has(i)), also: items.filter((_, i) => !yes.has(i)) };
}

function Plan(p: ArtProps): SceneArt {
  const { tall } = p;
  const b = beats(p.d);
  const P = tall ? PAGE_TALL : PAGE_WIDE;
  const { first: items, also } = planFor(p.ind, p.answers);
  const [x, y, w, h] = P.page;
  const l = x + P.m;
  const r = x + w - P.m;
  const F = P.field;
  const S = P.split;
  const pitch = also.length ? S.pitch : P.items[1];
  const itemY = (i: number) => P.items[0] + i * pitch;
  // "Also available", under what they said yes to, and its quieter rows.
  const alsoY = itemY(items.length - 1) + S.label;
  const otherY = (j: number) => alsoY + S.first + j * S.also;
  const tick = (i: number) => ({ cx: r + P.tick[0], cy: itemY(i) + P.tick[1], r: P.tick[2] });
  const T = planAt(p, items.length);
  const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return {
    far: (
      <Far>
        <Glow id="far-plan-warm" cx={50} cy={46} r={50} o={0.16} color="#E8C27A" />
        <Glow id="far-plan-paper" cx={50} cy={48} r={40} o={0.07} color="#F4F1EA" />
      </Far>
    ),
    mid: (
      <Art tall={tall}>
        {/* (On a wide screen, a touch smaller and lower: clear of the top bar and the captions.) */}
        <g transform={tall ? undefined : "translate(500 455) scale(.95) translate(-500 -435)"}>
          <g {...b("rise", 0.2, { len: 1.2 })}>
            <rect className="doc-shadow" x={x + 6} y={y + 14} width={w} height={h} rx="6" />
            <rect className="page" x={x} y={y} width={w} height={h} rx="6" />
            {/* Its head: the wordmark, the date, whose plan it is. */}
            <text className="t-mark t-left" x={l} y={P.mark[0]} fontSize={P.mark[1]}>
              Elorro
            </text>
            <text className="t-ink-soft t-right" x={r} y={P.mark[0]} fontSize={P.date}>
              {date}
            </text>
            <path className="s-gold-hair" d={`M ${l} ${P.rule} H ${r}`} />
            <text className="t-disp t-ink t-left" x={l} y={P.title[0]} fontSize={P.title[1]}>
              {INDUSTRY[p.ind].plan}
            </text>
            <text className="t-ink-soft t-left" x={l} y={P.by[0]} fontSize={P.by[1]}>
              Prepared by Ashan &amp; Jordan, after your first call
            </text>
            {/* What the film showed, in order: what they said yes to (or all of it). */}
            {items.map(([what, why], i) => (
              <g key={what}>
                <text className="t-disp t-gold-deep t-left" x={l} y={itemY(i)} fontSize={P.num}>
                  {`0${i + 1}`}
                </text>
                <text className="t-ink t-left t-strong" x={l + P.indent} y={itemY(i)} fontSize={P.what}>
                  {what}
                </text>
                <text className="t-ink-soft t-left" x={l + P.indent} y={itemY(i) + P.why[1]} fontSize={P.why[0]}>
                  {why}
                </text>
                {i < items.length - 1 && <path className="s-ink-line" d={`M ${l} ${itemY(i) + (also.length ? pitch * 0.62 : P.line)} H ${r}`} />}
                <circle className="s-ink-line" fill="none" {...tick(i)} />
              </g>
            ))}
            {/* The rest, quieter, there if they want it. */}
            {also.length > 0 && (
              <g className="plan-also">
                <path className="s-ink-line" d={`M ${l} ${alsoY - S.size * 1.7} H ${r}`} />
                <text className="t-ink-soft t-left t-caps" x={l} y={alsoY} fontSize={S.size}>
                  Also available
                </text>
                {also.map(([what, why], j) => (
                  <g key={what}>
                    <text className="t-ink-soft t-left" x={l + P.indent} y={otherY(j)} fontSize={S.what}>
                      {what}
                    </text>
                    <text className="t-ink-faint t-left" x={l + P.indent} y={otherY(j) + S.why[1]} fontSize={S.why[0]}>
                      {why}
                    </text>
                  </g>
                ))}
              </g>
            )}
            {/* How long, and the investment: placeholders, left to the call itself. */}
            <path className="s-ink-line" d={`M ${l} ${P.sep} H ${r}`} />
            {["Timeline", "Investment"].map((t, i) => (
              <g key={t}>
                <text className="t-ink-soft t-left t-caps" x={l + i * F.dx} y={F.label} fontSize={F.size}>
                  {t}
                </text>
                <rect className="f-ink-soft" x={l + i * F.dx} y={F.y} width={F.w} height={F.h} rx={F.h / 2} />
              </g>
            ))}
            <text className="t-ink-faint" x={x + w / 2} y={P.foot[0]} fontSize={P.foot[1]}>
              elorro.com · Bay Area
            </text>
          </g>
          {items.map(([what], i) => (
            <g key={what} {...b("pop", T.ticks[i], { len: 0.5 })}>
              <Tick {...tick(i)} />
            </g>
          ))}
          {/* The two fields, lit as she says how long it takes. */}
          <g {...b("fade", T.fields, { len: 0.8 })}>
            {[0, 1].map((i) => (
              <rect key={i} className="s-gold-faint" x={l + i * F.dx} y={F.y} width={F.w} height={F.h} rx={F.h / 2} />
            ))}
          </g>
        </g>
      </Art>
    ),
  };
}

/* ── One plan ──────────────────────────────────────────────────────────── */

/** The close keeps the pace it was designed at, as shares of this length. */
const CLOSE_D = 10.5;

function Close(p: ArtProps): SceneArt {
  const { tall } = p;
  const b = beats(CLOSE_D);
  // The gold line sits clear below "A & J", the J's tail included: half way between it and "One plan." (measured in
  // Chrome at eight sizes from 360 to 1440 wide; both scale with the set, so it holds at every size).
  const ry = tall ? 547 : 492;
  const rx = tall ? 240 : 200;
  return {
    far: (
      <Far>
        <Glow id="far-close-glow" cx={50} cy={44} r={50} o={0.22} color="#E8C27A" />
      </Far>
    ),
    mid: (
      <>
        <Word x={50} y={tall ? 32.5 : 33} size={tall ? 0.27 : 0.22} tone="paper" rise={0.2} shine={0.9} D={CLOSE_D}>
          A <span className="film-amp">&amp;</span> J
        </Word>
        <Art tall={tall}>
          <Gold d={`M 500 ${ry} H ${500 - rx}`} fx={b("draw", 0.9, { len: 1.4 })} />
          <Gold d={`M 500 ${ry} H ${500 + rx}`} fx={b("draw", 0.9, { len: 1.4 })} />
        </Art>
        <Word x={50} y={tall ? 58.5 : 58} size={tall ? 0.14 : 0.115} rise={1.1} shine={2} D={CLOSE_D}>
          One plan.
        </Word>
        <Word x={50} y={tall ? 67.5 : 67} size={tall ? 0.042 : 0.04} tone="note" rise={3.7} D={CLOSE_D}>
          Built and looked after by the two of them
        </Word>
      </>
    ),
    near: <i {...b("sweep", 1.4, { len: 2, cls: "film-sweep" })} />,
  };
}

/* ── Every kind of scene: its pictures, its videos, its sounds ─────────── */

type Def = {
  art: (p: ArtProps) => SceneArt;
  /** Its videos: when each plays, in seconds into the scene. */
  clips?: (p: ArtProps) => ClipUse[];
  /** Its sound effects (effects.ts), in seconds into the scene. */
  sfx?: (p: ArtProps) => [number, Cue][];
};

const reelClip = (p: ArtProps): ClipUse[] => [{ media: "photoReel", at: (1.2 * p.content) / REEL_D, until: (15.7 * p.content) / REEL_D }];
const reelSfx = (p: ArtProps): [number, Cue][] => [[(1.1 * p.content) / REEL_D, "tap"]];
const clinicalClip = (): ClipUse[] => [{ media: "clinical", at: 1.5, until: 17.7 }];
const clinicalSfx = (): [number, Cue][] => [[5.9, "tick"], [10.1, "tick"], [14.6, "text"]];

export const SCENES: Record<Kind, Def> = {
  opener: { art: Opener },
  pick: { art: ChoiceBackdrop },
  found: { art: Found, sfx: () => [[0.5, "tap"], [0.75, "tap"], [1, "tap"]] },
  reviews: {
    art: Reviews,
    clips: (p) => [{ media: `reviews-${p.ind}`, at: reviewsFix(p), until: p.content }],
    sfx: (p) => [
      [reviewsFix(p) + DEMO_AT.reviews.posted, "tick"],
      [reviewsFix(p) + DEMO_AT.reviews.text, "text"],
      [reviewsFix(p) + DEMO_AT.reviews.landed, "tick"],
    ],
  },
  site: {
    art: Site,
    clips: (p) => {
      const T = siteAt(p);
      const second = SITE_MEDIA_2[p.ind];
      return second
        ? [
            { media: SITE_MEDIA[p.ind], at: T.now + 0.2, until: T.cut + 0.2 },
            { media: second, at: T.cut, until: p.content },
          ]
        : [{ media: SITE_MEDIA[p.ind], at: T.now + 0.2, until: p.content }];
    },
  },
  booking: {
    art: Booking,
    clips: (p) => [{ media: `booking-${p.ind}`, at: bookingFix(p), until: p.content }],
    sfx: (p) => [[bookingFix(p) + DEMO_AT.booking.tap, "tap"], [bookingFix(p) + DEMO_AT.booking.confirmed, "tick"]],
  },
  calls: {
    art: Calls,
    clips: (p) => [{ media: `desk-${p.ind}`, at: callsFix(p), until: p.content }],
    sfx: (p) => [
      [callsFix(p) + DEMO_AT.desk.ring, "ring"],
      [callsFix(p) + DEMO_AT.desk.answered, "pickup"],
      [callsFix(p) + DEMO_AT.desk.booked, "tick"],
      [callsFix(p) + DEMO_AT.desk.text, "text"],
    ],
  },
  office: {
    art: Office,
    clips: (p) => [{ media: `entry-${p.ind}`, at: officeAt(p).one, until: p.content }],
    sfx: (p) => [[officeAt(p).one + DEMO_AT.entry.filled, "tick"]],
  },
  tools: {
    art: (p) => (p.ind === "dental" ? ClinicalTools(p) : ToolDemo(p)),
    clips: (p) => (p.ind === "dental" ? clinicalClip() : [{ media: `tool-${p.ind as ToolInd}`, at: toolAt(p).make, until: p.content }]),
    sfx: (p) => (p.ind === "dental" ? clinicalSfx() : [[toolAt(p).done, "text"]]),
  },
  photo: { art: Photo, clips: reelClip, sfx: reelSfx },
  plan: { art: Plan },
  close: { art: Close },
  send: { art: ChoiceBackdrop },
};

/**
 * How the camera moves through each scene: the set's drift (x, y, a share of
 * it), its push (scale from, to) and its turn; the backdrop drifts less. On a
 * phone upright the push is halved (film.css, --zk), so the set's edges stay
 * on screen. Real work in a window of its own holds still.
 */
type Camera = { px: string; py: string; z0: number; z1: number; ry: string };
const CAMERA: Record<Kind, Camera> = {
  opener: { px: "0%", py: "-1.2%", z0: 1.02, z1: 1.1, ry: "0deg" },
  pick: { px: "0%", py: "0%", z0: 1, z1: 1.02, ry: "0deg" },
  found: { px: "-1%", py: "0%", z0: 1.02, z1: 1.06, ry: "2deg" },
  reviews: { px: "0.8%", py: "0%", z0: 1.02, z1: 1.05, ry: "0deg" },
  site: { px: "0%", py: "-0.8%", z0: 1, z1: 1.05, ry: "0deg" },
  // (No turn where a demo plays: a turning set with a video in it is a lot to draw, at half the frame rate in Chrome.)
  booking: { px: "1%", py: "0%", z0: 1.02, z1: 1.05, ry: "0deg" },
  calls: { px: "-0.6%", py: "0.4%", z0: 1.01, z1: 1.04, ry: "0deg" },
  office: { px: "1%", py: "0%", z0: 1.02, z1: 1.05, ry: "0deg" },
  tools: { px: "1%", py: "0%", z0: 1.02, z1: 1.05, ry: "0deg" },
  photo: { px: "0%", py: "0%", z0: 1.02, z1: 1.06, ry: "0deg" },
  plan: { px: "0%", py: "-1.2%", z0: 1.06, z1: 1, ry: "0deg" },
  close: { px: "0%", py: "-2%", z0: 1.1, z1: 1, ry: "0deg" },
  send: { px: "0%", py: "0%", z0: 1, z1: 1.02, ry: "0deg" },
};
export const cameraOf = (kind: Kind) => CAMERA[kind];
