import { createContext, useContext, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import type { SceneId } from "@/components/elorro/film/script";

/**
 * The film's pictures. Each scene fills the frame in three layers, which the
 * camera moves at different speeds (film.css, "camera"), so they read as
 * depth:
 * - far: the backdrop, edge to edge, all soft light: gradients only, no blur
 *   filters (they're costly on a phone);
 * - mid: the scene itself, on a set as big as the screen allows, its big
 *   words in HTML so a shine can cross them like the logo's;
 * - near: out-of-focus gold, drifting past.
 *
 * Two shapes of set. Wide (desktop, tablets, a phone on its side): a square,
 * 1000 × 1000. Tall (a phone upright, film.css "phones first"): 1000 × 1100,
 * the whole width and the height between the top bar and the captions, and
 * each scene laid out for it: bigger cards and type, side-by-side things
 * stacked. `tall` picks which; film.tsx follows the screen.
 *
 * Every move is a CSS animation on the film's one clock (film.tsx): a beat is
 * an effect starting a share of the way into its scene, worked out from the
 * scene's designed length (DESIGN), so a scene timed longer or shorter in
 * script.ts keeps its choreography in step. A thing that moves never carries
 * a transform attribute of its own: its effect goes on a wrapping <g>.
 *
 * A gold thread runs through it: the rule under the logo, the thread Elora
 * leaves as she goes to her corner (Handoff), the call, the knot of the
 * three problems pulled straight, one thread at a time, into the lines of the
 * plan, the rule under the two of them. The two businesses
 * are the ones Elorro works for: a winery and an orthodontist. The winery is
 * the one followed onto its website. "And the rest" shows two pieces of
 * Elorro's real work, playing (Clip).
 */

/** Each scene's length as designed, in seconds: its beats are shares of it. */
export const DESIGN: Record<SceneId, number> = { elora: 9, call: 9.5, problem: 16, plan: 9.5, web: 14.5, more: 15.5, close: 10.5 };

type Vars = CSSProperties & Record<`--${string}`, string | number>;
type Opts = { len?: number; n?: number; dx?: number; dy?: number; cls?: string };
type Beat = { className: string; style: Vars };
type Box = [x: number, y: number, w: number, h: number];
export type SceneArt = { far: ReactNode; mid: ReactNode; near?: ReactNode };

/** An effect, `at` seconds into a scene designed `D` seconds long. */
const beats =
  (D: number) =>
  (kind: string, at: number, o: Opts = {}): Beat => {
    const style: Vars = { "--at": +(at / D).toFixed(4) };
    if (o.len) style["--len"] = `${o.len}s`;
    if (o.n) style["--n"] = o.n;
    if (o.dx !== undefined) style["--dx"] = `${o.dx}px`;
    if (o.dy !== undefined) style["--dy"] = `${o.dy}px`;
    return { className: `fx fx-${kind}${o.cls ? ` ${o.cls}` : ""}`, style };
  };
type Beats = ReturnType<typeof beats>;

/** A wave along y, from x0 to x1: `amp` high, one crest every `len`. */
const wave = (x0: number, x1: number, y: number, amp: number, len: number) => {
  let d = `M ${x0} ${y} Q ${x0 + len / 4} ${y - amp} ${x0 + len / 2} ${y}`;
  for (let x = x0 + len; x <= x1; x += len / 2) d += ` T ${x} ${y}`;
  return d;
};
/** A circle as a path, so it can be drawn on (pathLength 1): from its left, down and round. */
const ring = (cx: number, cy: number, r: number) => `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`;
/** The same from its right, down and round the other way. */
const ringR = (cx: number, cy: number, r: number) => `M ${cx + r} ${cy} a ${r} ${r} 0 1 1 ${-2 * r} 0 a ${r} ${r} 0 1 1 ${2 * r} 0`;
const HANDSET = "q 10 -18 22 -6 l 8 8 q 6 8 -2 16 q 10 18 26 26 q 8 -8 16 -2 l 8 8 q 12 12 -6 22 q -38 6 -72 -72 z";
const STAR = "l 5.5 11 l 12 1.6 l -8.8 8.6 l 2.4 12 l -11.1 -5.6 l -11.1 5.6 l 2.4 -12 l -8.8 -8.6 l 12 -1.6 z";
const sec = (t: number) => `${t.toFixed(3)}s`;

/** A drawing on the set. With `smil` (its scene's designed length), it holds SMIL animations, whose clock film.tsx keeps on the film's. */
function Art({ tall, smil, children }: { tall: boolean; smil?: number; children: ReactNode }) {
  return (
    <svg
      className={smil ? "film-art film-smil" : "film-art"}
      data-design={smil}
      viewBox={`0 0 1000 ${tall ? 1100 : 1000}`}
      aria-hidden="true"
      focusable="false"
    >
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

/** Soft gold lights out of focus: [x %, y %, size in vmin, strength]. */
function Bokeh({ dots }: { dots: [number, number, number, number][] }) {
  return (
    <>
      {dots.map(([x, y, s, o], i) => (
        <i key={i} className="film-bokeh" style={{ left: `${x}%`, top: `${y}%`, width: `${s}vmin`, height: `${s}vmin`, opacity: o }} />
      ))}
    </>
  );
}
const NEAR_A: [number, number, number, number][] = [[8, 18, 16, 0.22], [86, 12, 9, 0.3], [78, 74, 22, 0.16], [14, 82, 11, 0.26], [52, 6, 6, 0.35]];
const NEAR_B: [number, number, number, number][] = [[90, 30, 18, 0.2], [6, 50, 12, 0.24], [70, 88, 10, 0.3], [30, 10, 24, 0.12], [44, 92, 7, 0.34]];

/* ── Real work, playing ────────────────────────────────────────────────── */

export type ClipId = "clinical" | "pearls";
type Cuts = { desktop: string; mobile: string; desktopSd: string; mobileSd: string };
/**
 * Two of Elorro's own loops (the Work page's), shown in "And the rest": its
 * still first, the loop over it once it plays. `at` and `until` are when it
 * plays, in seconds into its scene as designed; `offset`, where in the loop
 * it starts. film.tsx loads it shortly before (never at the film's start),
 * plays it in step with the film, and leaves it on its still under reduced
 * motion or on a connection too slow for it.
 */
export const CLIPS: Record<ClipId, { scene: SceneId; at: number; until: number; offset: number; cuts: Cuts; poster: { desktop: string; mobile: string } }> = {
  // Clinical Scribe: a consult recorded, then written up. Made-up demo data.
  clinical: {
    scene: "more",
    at: 1.7,
    until: 6,
    offset: 1.8,
    cuts: { desktop: "/m/work/clinical-d.mp4", mobile: "/m/work/clinical-m.mp4", desktopSd: "/m/work/clinical-d-sd.mp4", mobileSd: "/m/work/clinical-m-sd.mp4" },
    poster: { desktop: "/m/work/clinical-d-poster.jpg", mobile: "/m/work/clinical-m-poster.jpg" },
  },
  // Pearls: the drone over the vines.
  pearls: {
    scene: "more",
    at: 6.6,
    until: 9.7,
    offset: 0,
    cuts: {
      desktop: "/m/work/pearls-drone-d.mp4",
      mobile: "/m/work/pearls-drone-m.mp4",
      desktopSd: "/m/work/pearls-drone-d-sd.mp4",
      mobileSd: "/m/work/pearls-drone-m-sd.mp4",
    },
    poster: { desktop: "/m/work/pearls-drone-d-poster.jpg", mobile: "/m/work/pearls-drone-m-poster.jpg" },
  },
};

/** Where film.tsx puts a loop's video once its scene is in the page (null as it leaves). */
export const ClipContext = createContext<((id: ClipId, slot: HTMLElement | null) => void) | null>(null);

/** A loop on the set, in its box (set units): its still, and a place for its video, fading in at `fx`. */
function Clip({ id, tall, box: [x, y, w, h], fx, top }: { id: ClipId; tall: boolean; box: Box; fx: Beat; top?: boolean }) {
  const attach = useContext(ClipContext);
  const slot = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    attach?.(id, slot.current);
    return () => attach?.(id, null);
  }, [attach, id]);
  const V = tall ? 1100 : 1000;
  const c = CLIPS[id];
  const style: Vars = { ...fx.style, left: `${x / 10}%`, top: `${(y / V) * 100}%`, width: `${w / 10}%`, height: `${(h / V) * 100}%` };
  return (
    <div className={`${fx.className} film-clip${top ? " film-clip--top" : ""}`} style={style}>
      <picture>
        <source media="(max-width: 1023px)" srcSet={c.poster.mobile} />
        <img src={c.poster.desktop} alt="" decoding="async" />
      </picture>
      <div ref={slot} className="film-clip-slot" />
    </div>
  );
}

/* ── Between Elora and the call: the thread she leaves ─────────────────── */

/**
 * As Elora goes to her corner, a gold thread draws out from behind her, both
 * ways across the middle of the frame; "How they work" rises at the top as
 * she settles. Then the thread gathers to the length of the call's, between
 * where its two circles draw on (Call), and hands over to it. Times are in
 * seconds into the film (this layer's --s is 0 and its --d one second).
 */
export function Handoff({ tall, thread, title, gone }: { tall: boolean; thread: number; title: number; gone: number }) {
  const b = beats(1);
  const y = tall ? 560 : 500;
  const reach = tall ? 440 : 380;
  const keep = tall ? 70 : 100;
  const half = (to: number) =>
    ["g-halo", "g-glow", "g-core"].map((c) => <path key={c} d={`M 500 ${y} H ${to}`} pathLength={1} className={`${c} h-thread`} />);
  return (
    <div className="film-handoff" aria-hidden="true" style={{ "--s": "0s", "--d": "1s", "--from": sec(thread), "--keep": +(1 - keep / reach).toFixed(4) } as Vars}>
      <Art tall={tall}>
        <g {...b("out", gone, { len: 0.7 })}>
          {half(500 - reach)}
          {half(500 + reach)}
        </g>
      </Art>
      <div {...b("out", gone + 0.9, { len: 0.8, cls: "film-out" })}>
        <Word x={50} y={tall ? 13 : 15} size={tall ? 0.11 : 0.085} rise={title} shine={title + 0.6} D={1}>
          How they work
        </Word>
      </div>
    </div>
  );
}

/* ── 0. Elora ──────────────────────────────────────────────────────────── */

function Elora(tall: boolean): SceneArt {
  const D = DESIGN.elora;
  const b = beats(D);
  const ry = tall ? 600 : 590;
  const rx = tall ? 400 : 250;
  return {
    far: (
      <Far>
        <defs>
          <radialGradient id="far-elora-spot" cx="50%" cy="34%" r="58%">
            <stop offset="0" stopColor="#E8C27A" stopOpacity=".34" />
            <stop offset=".5" stopColor="#A8802F" stopOpacity=".1" />
            <stop offset="1" stopColor="#0C0A08" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="far-elora-floor" cx="50%" cy="100%" r="60%">
            <stop offset="0" stopColor="#BE9645" stopOpacity=".2" />
            <stop offset="1" stopColor="#0C0A08" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1600" height="1000" fill="url(#far-elora-spot)" />
        <rect width="1600" height="1000" fill="url(#far-elora-floor)" />
      </Far>
    ),
    mid: (
      <>
        {/* The logo, its light crossing it, lifting away as she comes. */}
        <div {...b("lift", 1.5, { len: 1.3, cls: "film-logo-wrap" })}>
          <div {...b("rise", 0.3, { len: 1.4, cls: "film-logo" })}>
            <span className="film-logo-shine" style={{ "--sh": +(0.7 / D).toFixed(4) } as Vars} />
          </div>
        </div>
        <Art tall={tall}>
          <g {...b("out", 1.6, { len: 1 })}>
            <Gold d={`M 500 ${ry} H ${500 - rx}`} fx={b("draw", 0.8, { len: 1.3 })} />
            <Gold d={`M 500 ${ry} H ${500 + rx}`} fx={b("draw", 0.8, { len: 1.3 })} />
          </g>
        </Art>
        <div {...b("out", 7.5, { len: 0.8, cls: "film-out" })}>
          <Word x={50} y={tall ? 72 : 71} size={tall ? 0.13 : 0.11} rise={1.9} shine={2.6} D={D}>
            Elora
          </Word>
          <Word x={50} y={tall ? 81 : 78.5} size={tall ? 0.036 : 0.03} tone="label" rise={2.6} D={D}>
            Ashan &amp; Jordan’s assistant
          </Word>
        </div>
      </>
    ),
    near: (
      <>
        <Bokeh dots={NEAR_A} />
        <i {...b("sweep", 0.7, { len: 1.8, cls: "film-sweep" })} />
      </>
    ),
  };
}

/* ── 1. The call ───────────────────────────────────────────────────────── */

function Call(tall: boolean): SceneArt {
  const D = DESIGN.call;
  const b = beats(D);
  // The two circles, side by side; bigger on a phone. The thread between them is the one Elora left (Handoff).
  const r = tall ? 190 : 150;
  const cy = tall ? 560 : 500;
  const you = tall ? 240 : 250;
  const us = tall ? 760 : 750;
  const label = cy + r + 70;
  return {
    far: (
      <Far>
        <defs>
          <radialGradient id="far-call-you" cx="34%" cy="52%" r="40%">
            <stop offset="0" stopColor="#F4F1EA" stopOpacity=".1" />
            <stop offset="1" stopColor="#0C0A08" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="far-call-us" cx="66%" cy="52%" r="44%">
            <stop offset="0" stopColor="#D9B66A" stopOpacity=".3" />
            <stop offset="1" stopColor="#0C0A08" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="far-call-line" x1="0" x2="1">
            <stop offset="0" stopColor="#BE9645" stopOpacity="0" />
            <stop offset=".5" stopColor="#BE9645" stopOpacity=".35" />
            <stop offset="1" stopColor="#BE9645" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="1600" height="1000" fill="url(#far-call-you)" />
        <rect width="1600" height="1000" fill="url(#far-call-us)" />
        <rect x="0" y="719" width="1600" height="2" fill="url(#far-call-line)" />
      </Far>
    ),
    mid: (
      <>
        <Word x={50} y={tall ? 14 : 15} size={tall ? 0.13 : 0.11} rise={5.0} shine={5.7} D={D}>
          Listen.
        </Word>
        <Art tall={tall}>
          <defs>
            <clipPath id="film-call-line">
              <rect x={you + r + 2} y={cy - 60} width={us - you - 2 * r - 4} height="120" />
            </clipPath>
          </defs>
          {/* You: drawn on from the thread's end. */}
          <path pathLength={1} d={ringR(you, cy, r)} {...b("draw", 0.9, { len: 1.3, cls: "s-paper-soft" })} />
          <g {...b("fade", 1.5, { len: 1 })}>
            <g transform={`translate(${you} ${cy}) scale(${tall ? 2.15 : 1.7}) translate(-250 -470)`}>
              <path className="s-paper" d="M 196 446 H 304 L 296 418 H 204 Z M 196 446 q 9 14 18 0 q 9 14 18 0 q 9 14 18 0 q 9 14 18 0 q 9 14 18 0 q 9 14 18 0" />
              <path className="s-paper" d="M 206 458 V 522 H 294 V 458 M 234 522 V 486 H 262 V 522" />
            </g>
          </g>
          <text x={you} y={label} fontSize={tall ? 38 : 30} {...b("fade", 1.6, { cls: "t-small" })}>
            You
          </text>
          {/* The two of them, drawn on from the thread's other end. */}
          <Gold d={ring(us, cy, r)} fx={b("draw", 1, { len: 1.4 })} />
          <g {...b("fade", 1.6, { len: 1 })}>
            <text className="t-disp" x={us} y={cy + (tall ? 44 : 34)} fontSize={tall ? 134 : 104}>
              A <tspan className="t-gold">&amp;</tspan> J
            </text>
          </g>
          <text x={us} y={label} fontSize={tall ? 38 : 30} {...b("fade", 1.8, { cls: "t-small" })}>
            Ashan &amp; Jordan
          </text>
          {/* The call, and your voice coming down it. */}
          <Gold d={`M ${you + r + 2} ${cy} H ${us - r - 2}`} fx={b("fade", 1.3, { len: 0.6 })} />
          <g clipPath="url(#film-call-line)">
            <g {...b("fade", 2.9, { len: 0.5 })}>
              <g {...b("out", 7.6, { len: 0.6 })}>
                <path d={wave(you, us - 90, cy, 30, 72)} {...b("flow", 2.9, { len: 0.75, n: 6, dx: 72, cls: "g-glow thin" })} />
                <path d={wave(you, us - 90, cy, 30, 72)} {...b("flow", 2.9, { len: 0.75, n: 6, dx: 72, cls: "g-core thin" })} />
              </g>
            </g>
          </g>
          {/* And they listen. */}
          <circle cx={us} cy={cy} r={r} {...b("ring", 3.3, { len: 1.6, n: 3, cls: "s-gold-thin" })} />
          <circle cx={us} cy={cy} r={r} {...b("ring", 3.8, { len: 1.6, n: 3, cls: "s-gold-thin" })} />
        </Art>
      </>
    ),
    near: <Bokeh dots={NEAR_B} />,
  };
}

/* ── 2. What's really going on: three panels, the camera moving across ─── */

/** One business's day, as laid out: the card, its title, hours and lines, the two bookings and the ×2. */
type Cal = { x: number; y: number; w: number; h: number; title: [number, number, number]; hours: [x: number, y: number, dy: number, size: number]; line: [number, number]; a: Box; b: Box; size: number; badge: [cx: number, cy: number, r: number, size: number] };
const calWide = (x: number): Cal => ({ x, y: 180, w: 400, h: 540, title: [32, 68, 26], hours: [34, 168, 120, 28], line: [112, 372], a: [112, 190, 260, 66], b: [96, 244, 260, 66], size: 28, badge: [366, 250, 34, 30] });
const calTall = (y: number): Cal => ({ x: 40, y, w: 920, h: 470, title: [40, 72, 34], hours: [44, 170, 120, 36], line: [150, 880], a: [150, 214, 500, 78], b: [200, 288, 500, 78], size: 42, badge: [800, 290, 46, 42] });

/** A day's bookings at one business, two of them in the same hour. */
function Booked({ c, title, hours, a, b2, fx, t0 }: { c: Cal; title: string; hours: string[]; a: string; b2: string; fx: Beats; t0: number }) {
  const at = `translate(${c.x} ${c.y})`;
  const [hx, hy, hdy, hs] = c.hours;
  const [bx, by, br, bs] = c.badge;
  const chip = ([x, y, w, h]: Box, cls: string, tcls: string, text: string) => (
    <g transform={at}>
      <rect className={cls} x={x} y={y} width={w} height={h} rx="12" />
      <text className={`${tcls} t-left`} x={x + c.size * 0.7} y={y + h / 2 + c.size * 0.36} fontSize={c.size}>
        {text}
      </text>
    </g>
  );
  return (
    <g {...fx("rise", t0, { len: 1 })}>
      <g transform={at}>
        <rect className="card" width={c.w} height={c.h} rx="26" />
        <text className="t-small t-gold-text t-left" x={c.title[0]} y={c.title[1]} fontSize={c.title[2]}>
          {title}
        </text>
        {hours.map((h, i) => (
          <g key={h}>
            <text className="t-faint t-left" x={hx} y={hy + i * hdy} fontSize={hs}>
              {h}
            </text>
            <path className="s-soft" d={`M ${c.line[0]} ${hy + 10 + i * hdy} H ${c.line[1]}`} />
          </g>
        ))}
      </g>
      <g {...fx("rise", t0 + 1, { len: 0.8 })}>{chip(c.a, "chip", "t-ink", a)}</g>
      <g {...fx("rise", t0 + 2.4, { len: 0.8 })}>{chip(c.b, "chip chip--clash", "t-gold-text", b2)}</g>
      <g {...fx("pop", t0 + 3.2, { len: 0.6 })}>
        <g transform={at}>
          <circle className="f-gold" cx={bx} cy={by} r={br} />
          <text className="t-ink t-strong" x={bx} y={by + bs * 0.36} fontSize={bs}>
            ×2
          </text>
        </g>
      </g>
    </g>
  );
}

/** The two searches, as laid out: where each sits, its bar, the results under it, and where the business is. */
const SEARCH_WIDE = { ys: [90, 450], x: 70, w: 860, bar: 88, mag: [130, 42, 15], q: [180, 58, 42], res: [90, 140, 62, 520, 60, 170, 840, 40], you: [240, 66, 30, 44, 32, 26] };
const SEARCH_TALL = { ys: [50, 590], x: 40, w: 920, bar: 110, mag: [105, 55, 19], q: [160, 73, 52], res: [60, 175, 70, 560, 70, 205, 900, 50], you: [300, 90, 36, 59, 44, 34] };

function Problem(tall: boolean): SceneArt {
  const D = DESIGN.problem;
  const b = beats(D);
  const S = tall ? SEARCH_TALL : SEARCH_WIDE;
  return {
    far: (
      <Far>
        <defs>
          <radialGradient id="far-problem-a" cx="50%" cy="46%" r="52%">
            <stop offset="0" stopColor="#BE9645" stopOpacity=".2" />
            <stop offset="1" stopColor="#0C0A08" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="far-problem-b" cx="50%" cy="90%" r="60%">
            <stop offset="0" stopColor="#D9B66A" stopOpacity=".26" />
            <stop offset="1" stopColor="#0C0A08" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="far-problem-c" cx="50%" cy="40%" r="62%">
            <stop offset="0" stopColor="#F4F1EA" stopOpacity=".1" />
            <stop offset="1" stopColor="#0C0A08" stopOpacity="0" />
          </radialGradient>
          <pattern id="far-problem-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 H 0 V 80" fill="none" stroke="#BE9645" strokeOpacity=".07" strokeWidth="2" />
          </pattern>
        </defs>
        <g {...b("panelA1", 0)}>
          <rect width="1600" height="1000" fill="url(#far-problem-grid)" />
          <rect width="1600" height="1000" fill="url(#far-problem-a)" />
        </g>
        <g {...b("panelA2", 0)}>
          <rect width="1600" height="1000" fill="url(#far-problem-b)" />
        </g>
        <g {...b("panelA3", 0)}>
          <rect width="1600" height="1000" fill="url(#far-problem-c)" />
        </g>
      </Far>
    ),
    mid: (
      <div {...b("pan2", 0, { cls: "film-strip" })}>
        {/* A tasting and a consult, each booked twice: side by side, or one above the other on a phone. */}
        <div {...b("panelA1", 0, { cls: "film-panel" })}>
          <Art tall={tall}>
            <Booked c={tall ? calTall(60) : calWide(70)} title="Winery · Sat" hours={["1pm", "2pm", "3pm"]} a="Tasting · 6 guests" b2="Tasting · 4 guests" fx={b} t0={0.9} />
            <Booked c={tall ? calTall(570) : calWide(530)} title="Orthodontist · Tue" hours={["8am", "9am", "10am"]} a="Consult · Ana" b2="Consult · Ben" fx={b} t0={1.5} />
          </Art>
        </div>
        {/* The front desk, too busy to answer. */}
        <div {...b("panelA2", 0, { cls: "film-panel" })}>
          <Art tall={tall}>
            <g transform={tall ? "translate(500 560) scale(1.3) translate(-500 -440)" : undefined}>
              <g {...b("rise", 7.2, { len: 0.9 })}>
                <g {...b("shake", 7.8, { len: 0.7, n: 4 })}>
                  <rect className="s-paper-soft card" x="330" y="120" width="340" height="680" rx="56" />
                  <text className="t-small t-gold-text" x="500" y="236" fontSize="30">
                    Front desk
                  </text>
                  <g transform="translate(500 450) scale(2.4) translate(-300 -486)">
                    <path className="s-paper" d={`M 262 450 ${HANDSET}`} />
                  </g>
                  <text className="t-faint" x="500" y="690" fontSize="34">
                    Missed calls
                  </text>
                </g>
              </g>
              <g {...b("fade", 7.6, { len: 0.3 })}>
                <g {...b("blink", 7.8, { len: 0.7, n: 4 })}>
                  <Gold d="M 712 380 q 30 50 0 100 M 744 350 q 52 80 0 160 M 288 380 q -30 50 0 100 M 256 350 q -52 80 0 160" thin />
                </g>
              </g>
              <g {...b("pop", 8.1, { len: 0.5 })}>
                <circle className="f-gold" cx="664" cy="132" r="52" />
              </g>
              {["1", "2", "3"].map((n, i) => (
                <g key={n} {...b("fade", 8.1 + i * 0.6, { len: 0.2 })}>
                  {i < 2 ? (
                    <g {...b("out", 8.7 + i * 0.6, { len: 0.15 })}>
                      <text className="t-ink t-strong" x="664" y="150" fontSize="50">
                        {n}
                      </text>
                    </g>
                  ) : (
                    <text className="t-ink t-strong" x="664" y="150" fontSize="50">
                      {n}
                    </text>
                  )}
                </g>
              ))}
            </g>
          </Art>
        </div>
        {/* Two good businesses, on page two. */}
        <div {...b("panelA3", 0, { cls: "film-panel" })}>
          <Art tall={tall}>
            {[
              { y: S.ys[0], q: "winery napa", you: "Your winery", t: 10.6 },
              { y: S.ys[1], q: "orthodontist san ramon", you: "Your practice", t: 12.3 },
            ].map(({ y, q, you, t }) => {
              const [mx, my, mr] = S.mag;
              const [rx, r1, rdy, rw1, rk1, r2, rw2, rk2] = S.res;
              const [yy, yh, yx, yt, ys, ps] = S.you;
              return (
                <g key={q}>
                  <g {...b("rise", t - 0.2, { len: 0.8 })}>
                    <rect className="card s-paper-soft" x={S.x} y={y} width={S.w} height={S.bar} rx={S.bar / 2} />
                    <path className="s-paper" d={`${ring(mx, y + my, mr)} M ${mx + mr * 0.75} ${y + my + mr * 0.8} L ${mx + mr * 1.75} ${y + my + mr * 1.8}`} />
                  </g>
                  <text className="t-body t-left" x={S.q[0]} y={y + S.q[1]} fontSize={S.q[2]}>
                    {[...q].map((ch, i) => (
                      <tspan key={i} {...b("fade", t + i * 0.05, { len: 0.1 })}>
                        {ch}
                      </tspan>
                    ))}
                  </text>
                  {[0, 1].map((i) => (
                    <g key={i} {...b("rise", t + 1 + i * 0.15, { len: 0.7 })}>
                      <path className="s-dim thick" d={`M ${rx} ${y + r1 + i * rdy} H ${rw1 - i * rk1}`} />
                      <path className="s-soft" d={`M ${rx} ${y + r2 + i * rdy} H ${rw2 - i * rk2}`} />
                    </g>
                  ))}
                  <g {...b("fade", t + 1.5, { len: 1 })}>
                    <rect className="s-gold-faint" x={S.x} y={y + yy} width={S.w} height={yh} rx="14" />
                    <text className="t-gold-text t-left" x={S.x + yx} y={y + yy + yt} fontSize={ys}>
                      {you}
                    </text>
                    <text className="t-small t-right" x={S.x + S.w - yx} y={y + yy + yt} fontSize={ps}>
                      Page 2
                    </text>
                  </g>
                </g>
              );
            })}
          </Art>
        </div>
      </div>
    ),
    near: <Bokeh dots={NEAR_A} />,
  };
}

/* ── 3. Sorting it out: the knot, pulled straight into the plan ────────── */

/**
 * One thread, tangled and pulled straight: the same six curves both ways, so
 * one turns into the other. From x0 to x1 along y when straight; tangled, it
 * dips and loops across the rows around it (g apart), the way thread `i`
 * does, so the three cross into a knot.
 */
function thread(x0: number, x1: number, y: number, g: number, i: number) {
  const N = 6;
  const step = (x1 - x0) / N;
  const O = [
    [0, 0.4, 1.1, 0.6, 1.25, 0.3, 0],
    [0, -0.55, 0.5, -0.4, 0.6, -0.45, 0],
    [0, -0.3, -1.15, -0.35, -1.1, -0.4, 0],
  ][i];
  const r = (n: number) => +n.toFixed(1);
  const pts = O.map((o, k) => [x0 + k * step, y + o * g]);
  let tangled = `M ${r(x0)} ${r(y)}`;
  let straight = tangled;
  for (let k = 1; k <= N; k++) {
    const [xa, ya] = pts[k - 1];
    const [xb, yb] = pts[k];
    // Every other inner curve doubles back on itself (its handles reach past each other, on the same side): a curl.
    const loop = k > 1 && k < N && (k + i) % 2 === 1;
    const s = (i % 2 ? -1 : 1) * (k % 2 ? 1 : -1);
    const h = g * 0.5;
    const reach = loop ? 1.9 : 0.45;
    tangled += ` C ${r(xa + step * reach)} ${r(ya - s * h)} ${r(xb - step * reach)} ${r(loop ? ya - s * h : yb + s * h * 0.6)} ${r(xb)} ${r(yb)}`;
    straight += ` C ${r(xa + step / 3)} ${r(y)} ${r(xb - step / 3)} ${r(y)} ${r(xb)} ${r(y)}`;
  }
  return { tangled, straight };
}

/**
 * A thread in the film's gold, drawn on tangled and pulled straight `at`
 * seconds into its scene (as designed), over `len`. The pull is SMIL, the
 * one way a path's shape can move in every browser; film.tsx keeps its
 * picture's clock on the film's (Art `smil`). Under reduced motion (`calm`)
 * it's only ever straight, fading in as it would have pulled straight.
 */
function Thread({ paths, at, len, draw, calm }: { paths: { tangled: string; straight: string }; at: number; len: number; draw: Beat; calm: boolean }) {
  return (
    <>
      {["g-halo", "g-glow", "g-core"].map((c) => (
        <path key={c} d={calm ? paths.straight : paths.tangled} pathLength={1} className={`${draw.className} ${c}`} style={draw.style}>
          {!calm && (
            <animate
              attributeName="d"
              values={`${paths.tangled};${paths.straight}`}
              keyTimes="0;1"
              calcMode="spline"
              keySplines=".6 0 .2 1"
              begin={`${at}s`}
              dur={`${len}s`}
              fill="freeze"
            />
          )}
        </path>
      ))}
    </>
  );
}

/** The three problems from the scene before, each where its thread starts: a 220 × 110 tag, resolved `at`. */
function Problem3({ kind, x, y, k, at, b }: { kind: 0 | 1 | 2; x: number; y: number; k: number; at: number; b: Beats }) {
  const badge = ["×2", "3", "2"][kind];
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <rect className="card" width="220" height="110" rx="14" />
      <text className="t-small t-gold-text t-left" x="18" y="30" fontSize="16">
        {["Sat · 2pm", "Front desk", "Search"][kind]}
      </text>
      {kind === 0 && (
        <>
          <rect className="chip" x="18" y="44" width="150" height="30" rx="7" />
          <text className="t-ink t-left" x="30" y="65" fontSize="18">
            Tasting
          </text>
          {/* The second booking slides onto the first and is gone: one calendar. */}
          <g {...b("moveto", at - 0.5, { len: 0.5, dx: -10, dy: -14 })}>
            <g {...b("out", at - 0.1, { len: 0.3 })}>
              <rect className="chip chip--clash" x="28" y="58" width="150" height="30" rx="7" />
              <text className="t-gold-text t-left" x="40" y="79" fontSize="18">
                Tasting
              </text>
            </g>
          </g>
        </>
      )}
      {kind === 1 && (
        <>
          <g transform="translate(46 72) scale(.5) translate(-300 -486)">
            <path className="s-paper" d={`M 262 450 ${HANDSET}`} />
          </g>
          <text className="t-faint t-left" x="84" y="80" fontSize="20">
            Missed
          </text>
        </>
      )}
      {kind === 2 && (
        <>
          <path className="s-paper thin-line" d={`${ring(30, 62, 9)} M 37 69 L 45 77`} />
          <text className="t-body t-left" x="54" y="69" fontSize="18">
            Your winery
          </text>
          <g {...b("out", at, { len: 0.3 })}>
            <text className="t-faint t-left" x="54" y="96" fontSize="16">
              Page 2
            </text>
          </g>
          <g {...b("fade", at + 0.2, { len: 0.4 })}>
            <text className="t-gold-text t-left" x="54" y="96" fontSize="16">
              Page 1
            </text>
          </g>
        </>
      )}
      <g {...b("out", at, { len: 0.3 })}>
        <circle className="f-gold" cx="192" cy="28" r="18" />
        <text className="t-ink t-strong" x="192" y="34" fontSize="16">
          {badge}
        </text>
      </g>
      <g {...b("pop", at + 0.1, { len: 0.5 })}>
        <circle className="f-gold" cx="192" cy="28" r="18" />
        <path className="s-ink thin-ink" d="M 184 28 l 6 6 l 12 -13" />
      </g>
    </g>
  );
}

function Plan(tall: boolean, calm: boolean): SceneArt {
  const D = DESIGN.plan;
  const b = beats(D);
  // The page, its rows, and where each thread runs along its row.
  const L = tall
    ? { page: [30, 40, 940, 1020] as Box, title: [160, 96], rule: [110, 210, 890], rows: [470, 700, 930], g: 230, tag: [60, -140, 1.45], x0: 379, x1: 930, text: [404, -34, 54] }
    : { page: [70, 90, 860, 800] as Box, title: [205, 84], rule: [150, 250, 850], rows: [430, 600, 770], g: 170, tag: [110, -96, 1], x0: 330, x1: 880, text: [372, -24, 44] };
  // Each pulled straight in turn: when it starts, and when its row is written.
  const PULL = [1.5, 2.8, 4.1];
  const LEN = 1;
  const rows = ["One calendar", "Every call answered", "Found on Google"];
  const [px, py, pw, ph] = L.page;
  return {
    far: (
      <Far>
        <defs>
          <linearGradient id="far-plan-ray" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#E8C27A" stopOpacity="0" />
            <stop offset=".5" stopColor="#E8C27A" stopOpacity=".13" />
            <stop offset="1" stopColor="#E8C27A" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="far-plan-glow" cx="50%" cy="48%" r="48%">
            <stop offset="0" stopColor="#F4F1EA" stopOpacity=".12" />
            <stop offset="1" stopColor="#0C0A08" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g {...b("fade", 4.6, { len: 2.4 })}>
          {[260, 620, 980, 1300].map((x, i) => (
            <path key={x} d={`M ${x} -100 l 220 0 l ${-260 - i * 40} 1200 l -220 0 z`} fill="url(#far-plan-ray)" />
          ))}
          <rect width="1600" height="1000" fill="url(#far-plan-glow)" />
        </g>
      </Far>
    ),
    mid: (
      <Art tall={tall} smil={D}>
        {/* The page, and the three problems at the head of its rows. */}
        <g {...b("rise", 0.1, { len: 1 })}>
          <rect className="card card--deep s-paper-soft" x={px} y={py} width={pw} height={ph} rx="22" />
          <text className="t-disp" x="500" y={L.title[0]} fontSize={L.title[1]}>
            The plan
          </text>
          <path className="s-soft" d={`M ${L.rule[0]} ${L.rule[1]} H ${L.rule[2]}`} />
        </g>
        <g {...b("fade", 5.4, { len: 1 })}>
          <rect className="s-gold-edge" fill="none" x={px} y={py} width={pw} height={ph} rx="22" />
        </g>
        {L.rows.map((y, i) => (
          <g key={y} {...b("pop", 0.35 + i * 0.15, { len: 0.6 })}>
            <Problem3 kind={i as 0 | 1 | 2} x={L.tag[0]} y={y + L.tag[1]} k={L.tag[2]} at={PULL[i] + LEN * 0.8} b={b} />
          </g>
        ))}
        {/* What each becomes in the plan, written as its thread pulls straight. */}
        {rows.map((t, i) => (
          <text key={t} x={L.text[0]} y={L.rows[i] + L.text[1]} fontSize={L.text[2]} {...b("rise", PULL[i] + LEN * 0.75, { len: 0.8, cls: "t-body t-left" })}>
            {t}
          </text>
        ))}
        {/* The knot: one thread from each problem, pulled straight one at a time, each becoming the line under its row. */}
        {L.rows.map((y, i) => (
          <Thread
            key={y}
            paths={thread(L.x0, L.x1, y, L.g, i)}
            at={PULL[i]}
            len={LEN}
            calm={calm}
            draw={calm ? b("fade", PULL[i] + LEN * 0.6, { len: 0.6 }) : b("draw", 0.3 + i * 0.12, { len: 1.1 })}
          />
        ))}
        {/* A glint along each, as it comes straight. */}
        {L.rows.map((y, i) => (
          <path key={y} d={`M ${L.x0} ${y} H ${L.x1}`} pathLength={1} {...b("glint", PULL[i] + LEN * 0.8, { len: 0.7, cls: "g-glint" })} />
        ))}
      </Art>
    ),
    near: (
      <>
        <Bokeh dots={NEAR_B} />
        <i {...b("sweep", 5.6, { len: 1.8, cls: "film-sweep" })} />
      </>
    ),
  };
}

/* ── 4. Websites & getting found: the winery ───────────────────────────── */

const QUERY = "winery napa";

function Web(tall: boolean): SceneArt {
  const D = DESIGN.web;
  const b = beats(D);
  const rows = Array.from({ length: 15 }, (_, i) => -560 + i * 80);
  return {
    far: (
      <Far>
        <defs>
          <linearGradient id="far-web-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0C0A08" />
            <stop offset=".42" stopColor="#3A2A14" />
            <stop offset=".56" stopColor="#7A5A26" />
            <stop offset=".6" stopColor="#2A1F12" />
            <stop offset="1" stopColor="#0C0A08" />
          </linearGradient>
          <radialGradient id="far-web-sun" cx="50%" cy="56%" r="34%">
            <stop offset="0" stopColor="#F6E2AE" stopOpacity=".75" />
            <stop offset=".25" stopColor="#D9B66A" stopOpacity=".35" />
            <stop offset="1" stopColor="#0C0A08" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="far-web-row" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#BE9645" stopOpacity="0" />
            <stop offset="1" stopColor="#BE9645" stopOpacity=".42" />
          </linearGradient>
        </defs>
        <rect width="1600" height="1000" fill="url(#far-web-sky)" opacity=".85" />
        <rect width="1600" height="1000" fill="url(#far-web-sun)" />
        <path d="M 0 560 C 220 500, 420 540, 640 512 S 1060 470, 1260 520 S 1520 540, 1600 520 L 1600 1000 L 0 1000 Z" fill="#14100C" />
        <path d="M 0 600 C 300 570, 600 600, 900 580 S 1400 560, 1600 590 L 1600 1000 L 0 1000 Z" fill="#0E0B09" />
        {rows.map((x) => (
          <path key={x} d={`M 800 585 L ${800 + x * 2.2} 1000`} stroke="url(#far-web-row)" strokeWidth="5" fill="none" />
        ))}
      </Far>
    ),
    mid: tall ? <WebTall b={b} /> : <WebWide b={b} />,
    near: <Bokeh dots={NEAR_A} />,
  };
}

function WebWide({ b }: { b: Beats }) {
  return (
    <Art tall={false}>
      <g {...b("out", 6.8, { len: 0.8 })}>
        <g {...b("rise", 0.3, { len: 1 })}>
          <rect className="card card--deep s-paper-soft" x="70" y="100" width="860" height="104" rx="52" />
          <path className="s-paper" d={`${ring(134, 152, 17)} M 147 166 L 165 184`} />
        </g>
        <text className="t-body t-left" x="190" y="170" fontSize="52">
          {[...QUERY].map((ch, i) => (
            <tspan key={i} {...b("fade", 0.9 + i * 0.07, { len: 0.12 })}>
              {ch}
            </tspan>
          ))}
        </text>
        {[0, 1, 2].map((i) => (
          <g key={i} {...b("slide", 3.7, { len: 1.3, dy: -134 })}>
            <g {...b("rise", 2.2 + i * 0.15, { len: 0.8 })}>
              <rect className="card card--deep" x="70" y={404 + i * 134} width="860" height="112" rx="16" />
              <path className="s-dim thick" d={`M 104 ${444 + i * 134} H ${470 - i * 40}`} />
              <path className="s-soft" d={`M 104 ${484 + i * 134} H ${820 - i * 30}`} />
            </g>
          </g>
        ))}
        <g {...b("slide", 3.6, { len: 1.5, dy: 402 })}>
          <g {...b("glow", 3.6, { len: 1.5 })}>
            <rect className="card card--deep s-gold-edge" x="70" y="250" width="860" height="124" rx="18" />
            <text className="t-disp t-gold t-left" x="106" y="312" fontSize="52">
              Your winery
            </text>
            <g className="f-gold">
              {[0, 1, 2, 3, 4].map((s) => (
                <path key={s} d={`M ${110 + s * 30} 330 ${STAR}`} />
              ))}
            </g>
            <text className="t-small t-left" x="290" y="352" fontSize="26">
              Napa · Tastings daily
            </text>
          </g>
        </g>
      </g>

      {/* The top result opens into the site, which puts itself together. */}
      <g {...b("open", 7, { len: 1.2 })}>
        <rect className="card card--site s-paper-soft" x="50" y="80" width="900" height="740" rx="24" />
        <path className="s-soft" d="M 50 150 H 950" />
        <g className="f-dim">
          <circle cx="92" cy="116" r="9" />
          <circle cx="122" cy="116" r="9" />
          <circle cx="152" cy="116" r="9" />
        </g>
      </g>
      <g {...b("fade", 7.7, { len: 0.7 })}>
        <text className="t-disp t-gold t-left" x="100" y="222" fontSize="42">
          Your winery
        </text>
        <path className="s-soft thick" d="M 640 208 H 710 M 740 208 H 810 M 840 208 H 900" />
      </g>
      <g {...b("rise", 8.1, { len: 0.9 })}>
        <text className="t-disp t-left" x="100" y="350" fontSize="96">
          Taste
        </text>
        <text className="t-disp t-left" x="100" y="442" fontSize="96">
          the valley.
        </text>
        <path className="s-soft" d="M 100 490 H 440 M 100 524 H 390" />
      </g>
      <g {...b("rise", 8.5, { len: 1 })}>
        <rect className="f-gold-dim" x="590" y="250" width="310" height="380" rx="14" />
        <Gold d={ring(800, 340, 36)} thin />
        <path className="s-gold-soft" d="M 590 470 C 650 440, 720 456, 770 446 S 860 430, 900 446" />
        {[-140, -90, -45, 0, 45, 90, 140].map((dx) => (
          <path key={dx} className="s-gold-soft" d={`M ${745 + dx * 0.12} 470 L ${745 + dx} 630`} />
        ))}
      </g>
      <g {...b("press", 10.3, { len: 0.5 })}>
        <g {...b("pop", 8.9, { len: 0.7 })}>
          <rect className="f-gold-v" x="100" y="560" width="340" height="84" rx="8" />
          <text className="t-ink t-caps" x="270" y="613" fontSize="28">
            Book a tasting
          </text>
        </g>
      </g>
      {["Tastings", "Wine club", "Visit us"].map((f, i) => (
        <g key={f} {...b("rise", 9.3 + i * 0.2, { len: 0.8 })}>
          <rect className="s-soft card" x={100 + i * 276} y="676" width="248" height="112" rx="12" />
          <text className="t-body t-left" x={126 + i * 276} y="726" fontSize="32">
            {f}
          </text>
          <path className="s-soft" d={`M ${126 + i * 276} 760 H ${300 + i * 276}`} />
        </g>
      ))}
      <circle cx="270" cy="602" r="50" {...b("ring", 10.3, { len: 0.9, n: 1, cls: "s-gold-thin" })} />
      {/* A booking comes in. */}
      <g {...b("rise", 10.9, { len: 1 })}>
        <rect className="page" x="460" y="640" width="500" height="160" rx="18" />
        <circle className="f-gold" cx="504" cy="698" r="13" />
        <text className="t-ink t-left t-strong" x="532" y="712" fontSize="38">
          New booking
        </text>
        <text className="t-ink-soft t-left" x="490" y="770" fontSize="30">
          Tasting for 4 · Sat 2pm
        </text>
      </g>
    </Art>
  );
}

/** The same, on a phone upright: the search and the site each the whole width, the site's picture under its words. */
function WebTall({ b }: { b: Beats }) {
  return (
    <Art tall>
      <g {...b("out", 6.8, { len: 0.8 })}>
        <g {...b("rise", 0.3, { len: 1 })}>
          <rect className="card card--deep s-paper-soft" x="40" y="60" width="920" height="130" rx="65" />
          <path className="s-paper" d={`${ring(110, 125, 22)} M 126 141 L 148 163`} />
        </g>
        <text className="t-body t-left" x="172" y="146" fontSize="60">
          {[...QUERY].map((ch, i) => (
            <tspan key={i} {...b("fade", 0.9 + i * 0.07, { len: 0.12 })}>
              {ch}
            </tspan>
          ))}
        </text>
        {[0, 1, 2].map((i) => (
          <g key={i} {...b("slide", 3.7, { len: 1.3, dy: -170 })}>
            <g {...b("rise", 2.2 + i * 0.15, { len: 0.8 })}>
              <rect className="card card--deep" x="40" y={430 + i * 170} width="920" height="140" rx="18" />
              <path className="s-dim thick" d={`M 84 ${482 + i * 170} H ${540 - i * 50}`} />
              <path className="s-soft" d={`M 84 ${528 + i * 170} H ${880 - i * 40}`} />
            </g>
          </g>
        ))}
        <g {...b("slide", 3.6, { len: 1.5, dy: 510 })}>
          <g {...b("glow", 3.6, { len: 1.5 })}>
            <rect className="card card--deep s-gold-edge" x="40" y="250" width="920" height="150" rx="20" />
            <text className="t-disp t-gold t-left" x="80" y="322" fontSize="62">
              Your winery
            </text>
            <g className="f-gold" transform="translate(84 340) scale(1.3)">
              {[0, 1, 2, 3, 4].map((s) => (
                <path key={s} d={`M ${s * 30} 0 ${STAR}`} />
              ))}
            </g>
            <text className="t-small t-left" x="300" y="372" fontSize="30">
              Napa · Tastings daily
            </text>
          </g>
        </g>
      </g>

      <g {...b("open", 7, { len: 1.2 })}>
        <rect className="card card--site s-paper-soft" x="30" y="30" width="940" height="1000" rx="26" />
        <path className="s-soft" d="M 30 104 H 970" />
        <g className="f-dim">
          <circle cx="74" cy="67" r="10" />
          <circle cx="106" cy="67" r="10" />
          <circle cx="138" cy="67" r="10" />
        </g>
      </g>
      <g {...b("fade", 7.7, { len: 0.7 })}>
        <text className="t-disp t-gold t-left" x="72" y="176" fontSize="46">
          Your winery
        </text>
        <path className="s-soft thick" d="M 660 162 H 730 M 760 162 H 830 M 860 162 H 920" />
      </g>
      <g {...b("rise", 8.1, { len: 0.9 })}>
        <text className="t-disp t-left" x="70" y="300" fontSize="112">
          Taste
        </text>
        <text className="t-disp t-left" x="70" y="408" fontSize="112">
          the valley.
        </text>
        <path className="s-soft" d="M 72 462 H 540 M 72 498 H 460" />
      </g>
      <g {...b("rise", 8.5, { len: 1 })}>
        <rect className="f-gold-dim" x="70" y="530" width="860" height="240" rx="14" />
        <Gold d={ring(790, 600, 34)} thin />
        <path className="s-gold-soft" d="M 70 680 C 200 650, 360 668, 500 660 S 800 640, 930 656" />
        {[-180, -120, -60, 0, 60, 120, 180].map((dx) => (
          <path key={dx} className="s-gold-soft" d={`M ${500 + dx * 0.12} 680 L ${500 + dx * 2.3} 770`} />
        ))}
      </g>
      <g {...b("press", 10.3, { len: 0.5 })}>
        <g {...b("pop", 8.9, { len: 0.7 })}>
          <rect className="f-gold-v" x="70" y="805" width="380" height="92" rx="8" />
          <text className="t-ink t-caps" x="260" y="862" fontSize="30">
            Book a tasting
          </text>
        </g>
      </g>
      {["Tastings", "Wine club", "Visit us"].map((f, i) => (
        <g key={f} {...b("rise", 9.3 + i * 0.2, { len: 0.8 })}>
          <rect className="s-soft card" x={70 + i * 290} y="925" width="270" height="80" rx="12" />
          <text className="t-body t-left" x={96 + i * 290} y="976" fontSize="30">
            {f}
          </text>
        </g>
      ))}
      <circle cx="260" cy="851" r="56" {...b("ring", 10.3, { len: 0.9, n: 1, cls: "s-gold-thin" })} />
      <g {...b("rise", 10.9, { len: 1 })}>
        <rect className="page" x="440" y="830" width="520" height="175" rx="18" />
        <circle className="f-gold" cx="482" cy="888" r="14" />
        <text className="t-ink t-left t-strong" x="510" y="902" fontSize="42">
          New booking
        </text>
        <text className="t-ink-soft t-left" x="470" y="968" fontSize="34">
          Tasting for 4 · Sat 2pm
        </text>
      </g>
    </Art>
  );
}

/* ── 5. And the rest: three panels, panned across ──────────────────────── */

const WAVE = [22, 48, 30, 70, 44, 90, 56, 34, 80, 62, 40, 96, 52, 28, 74, 58, 36, 86, 46, 64, 30, 78, 50, 38, 68, 26];

function More(tall: boolean): SceneArt {
  const D = DESIGN.more;
  const b = beats(D);
  const rows = [-300, -200, -100, 0, 100, 200, 300];
  // Custom tools: the consult-notes window, its title bar, and its body, where the gold sketch turns into the real thing.
  const W = tall ? { win: [40, 190, 920, 850] as Box, bar: 70, title: 122, size: 92, rec: 236 } : { win: [70, 210, 860, 600] as Box, bar: 74, title: 150, size: 88, rec: 210 };
  const [wx, wy, ww, wh] = W.win;
  const body: Box = [wx + 2, wy + W.bar + 2, ww - 4, wh - W.bar - 4];
  const waveY = tall ? 470 : 420;
  const waveX = (i: number) => (tall ? 92 + i * 32 : 124 + i * 29);
  const waveK = tall ? 1.9 : 1.4;
  // Photo & video: the viewfinder, and the footage inside it.
  const V = tall
    ? { c: [40, 190, 960, 1030], clip: [60, 210, 880, 800] as Box, rec: [100, 262], hill: "M 60 640 C 260 520, 420 590, 540 560 S 800 500, 940 580", sun: [720, 430, 66], row: [640, 1000], focus: [410, 690, 180, 140] }
    : { c: [70, 210, 930, 820], clip: [90, 230, 820, 570] as Box, rec: [132, 272], hill: "M 90 560 C 260 450, 400 510, 520 480 S 800 420, 910 500", sun: [720, 380, 58], row: [560, 800], focus: [420, 600, 160, 120] };
  const [c0, c1, c2, c3] = V.c;
  return {
    far: (
      <Far>
        <defs>
          <linearGradient id="far-more-window" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#F4F1EA" stopOpacity="0" />
            <stop offset=".5" stopColor="#F4F1EA" stopOpacity=".08" />
            <stop offset="1" stopColor="#F4F1EA" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="far-more-dawn" cx="50%" cy="72%" r="60%">
            <stop offset="0" stopColor="#E8C27A" stopOpacity=".34" />
            <stop offset="1" stopColor="#0C0A08" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="far-more-lamp" cx="30%" cy="18%" r="62%">
            <stop offset="0" stopColor="#D9B66A" stopOpacity=".26" />
            <stop offset="1" stopColor="#0C0A08" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g {...b("panel1", 0)}>
          {[280, 560, 840, 1120].map((x) => (
            <rect key={x} x={x} y="-50" width="180" height="1100" fill="url(#far-more-window)" />
          ))}
        </g>
        <g {...b("panel2", 0)}>
          <rect width="1600" height="1000" fill="url(#far-more-dawn)" />
        </g>
        <g {...b("panel3", 0)}>
          <rect width="1600" height="1000" fill="url(#far-more-lamp)" />
        </g>
      </Far>
    ),
    mid: (
      <div {...b("pan", 0, { cls: "film-strip" })}>
        {/* Custom tools: an orthodontist's consult, recorded and written up. The gold sketch of it gives way to the real tool, Clinical Scribe. */}
        <div {...b("panel1", 0, { cls: "film-panel" })}>
          <Art tall={tall}>
            <text x="500" y={W.title} fontSize={W.size} {...b("rise", 0.4, { len: 1.2, cls: "t-disp" })}>
              Custom tools
            </text>
          </Art>
          <div {...b("rise", 0.7, { len: 1.1, cls: "film-layer" })}>
            <Art tall={tall}>
              <rect className="card card--deep" x={wx} y={wy} width={ww} height={wh} rx="22" />
              <path className="s-soft" d={`M ${wx} ${wy + W.bar} H ${wx + ww}`} />
              <text className="t-body t-left" x={wx + 36} y={wy + W.bar * 0.66} fontSize={tall ? 34 : 30}>
                Consult notes
              </text>
              <g {...b("blink", 1, { len: 1.2, n: 4 })}>
                <circle className="f-gold" cx={wx + ww - W.rec} cy={wy + W.bar / 2} r="9" />
              </g>
              <text className="t-small t-left" x={wx + ww - W.rec + 22} y={wy + W.bar * 0.62} fontSize={tall ? 26 : 22}>
                Recording
              </text>
              <g {...b("out", 1.7, { len: 0.8 })}>
                {WAVE.map((h, i) => (
                  <path key={i} d={`M ${waveX(i)} ${waveY - (h * waveK) / 2} V ${waveY + (h * waveK) / 2}`} {...b("tall", 0.9 + i * 0.022, { len: 0.4, cls: "g-core thin" })} />
                ))}
                {[0, 1, 2, 3].map((i) => (
                  <path
                    key={i}
                    d={`M ${wx + 70} ${waveY + (tall ? 170 : 130) + i * (tall ? 70 : 52)} H ${wx + ww - 70 - i * 80}`}
                    {...b("grow", 1.15 + i * 0.12, { len: 0.5, cls: "s-gold thick" })}
                  />
                ))}
              </g>
            </Art>
            <Clip id="clinical" tall={tall} box={body} fx={b("fade", 1.7, { len: 0.8 })} top />
            <Art tall={tall}>
              <rect className="s-gold-edge" fill="none" x={wx} y={wy} width={ww} height={wh} rx="22" />
              <g {...b("pop", 4, { len: 0.7 })}>
                <g transform={tall ? "translate(500 972) scale(1.2) translate(-500 -734)" : undefined}>
                  <rect className="f-gold-v" x="340" y="696" width="320" height="76" rx="10" />
                  <text className="t-ink t-caps" x="500" y="744" fontSize="24">
                    Letter drafted
                  </text>
                  <circle className="f-paper" cx="690" cy="734" r="28" />
                  <path className="s-ink" d="M 676 735 l 9 9 l 19 -20" />
                </g>
              </g>
            </Art>
          </div>
        </div>
        {/* Photo & video: the vineyard drawn in gold, then filmed: our drone footage for Pearls. */}
        <div {...b("panel2", 0, { cls: "film-panel" })}>
          <Art tall={tall}>
            <text x="500" y={W.title} fontSize={W.size} {...b("rise", 5.6, { len: 1.2, cls: "t-disp" })}>
              Photo &amp; video
            </text>
            <g {...b("out", 6.6, { len: 0.8 })}>
              <path pathLength={1} d={V.hill} {...b("draw", 5.6, { len: 1, cls: "s-paper-soft" })} />
              <Gold d={ring(V.sun[0], V.sun[1], V.sun[2])} fx={b("draw", 5.7, { len: 0.9 })} />
              {rows.map((dx, i) => (
                <Gold key={dx} d={`M ${500 + dx * 0.12} ${V.row[0]} L ${500 + dx * 1.45} ${V.row[1]}`} fx={b("draw", 5.75 + i * 0.07, { len: 0.8 })} thin />
              ))}
            </g>
          </Art>
          <Clip id="pearls" tall={tall} box={V.clip} fx={b("fade", 6.6, { len: 0.8 })} />
          <Art tall={tall}>
            <path d={`M ${c0} ${c1 + 60} V ${c1} H ${c0 + 70} M ${c2 - 70} ${c1} H ${c2} V ${c1 + 60} M ${c2} ${c3 - 60} V ${c3} H ${c2 - 70} M ${c0 + 70} ${c3} H ${c0} V ${c3 - 60}`} {...b("fade", 5.6, { cls: "s-paper thick-ish" })} />
            <g {...b("blink", 6, { len: 0.8, n: 4 })}>
              <circle className="f-gold" cx={V.rec[0]} cy={V.rec[1]} r={tall ? 13 : 12} />
            </g>
            <text x={V.rec[0] + 24} y={V.rec[1] + 10} fontSize={tall ? 32 : 28} {...b("fade", 6, { cls: "t-small t-left t-on-film" })}>
              Rec
            </text>
            <g {...b("focus", 7.1, { len: 0.9 })}>
              <rect className="s-paper" x={V.focus[0]} y={V.focus[1]} width={V.focus[2]} height={V.focus[3]} />
            </g>
          </Art>
        </div>
        {/* Phones, booking and follow-up: the orthodontist's front desk, handled. */}
        <div {...b("panel3", 0, { cls: "film-panel" })}>{tall ? <PhonesTall b={b} /> : <PhonesWide b={b} />}</div>
      </div>
    ),
    near: <Bokeh dots={NEAR_B} />,
  };
}

/** The caller, the same on both layouts: a made-up patient of the orthodontist's. */
const CALLER = { name: "Sofia Park", initials: "SP" };

/** The answer button's handset, in ink, at (cx, cy). */
const Handset = ({ cx, cy, k, cls = "s-ink" }: { cx: number; cy: number; k: number; cls?: string }) => (
  <g transform={`translate(${cx} ${cy}) scale(${k}) translate(-300 -486)`}>
    <path className={cls} d={`M 262 450 ${HANDSET}`} />
  </g>
);

/** A call coming in to the front desk, at (cx, cy): the caller's circle, ringing, until it's answered. */
function Ringing({ cx, cy, r, b }: { cx: number; cy: number; r: number; b: Beats }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} {...b("ring", 9.6, { len: 1, n: 1, cls: "s-gold-thin" })} />
      <circle cx={cx} cy={cy} r={r} {...b("ring", 10.05, { len: 1, n: 1, cls: "s-gold-thin" })} />
      <circle className="f-gold-dim s-gold-edge" cx={cx} cy={cy} r={r} />
      <text className="t-disp" x={cx} y={cy + r * 0.27} fontSize={r * 0.78}>
        {CALLER.initials}
      </text>
    </>
  );
}

function PhonesWide({ b }: { b: Beats }) {
  return (
    <Art tall={false}>
      <text x="500" y="150" fontSize="80" {...b("rise", 9.2, { len: 1.2, cls: "t-disp" })}>
        Phones &amp; booking
      </text>
      {/* The front desk's phone: a call coming in, then answered. */}
      <g {...b("rise", 9.4, { len: 0.8 })}>
        <rect className="card s-paper-soft" x="70" y="230" width="290" height="560" rx="44" />
        <path className="s-soft thick" d="M 190 262 H 240" />
        <text className="t-small t-gold-text" x="215" y="322" fontSize="22">
          Front desk
        </text>
        <Ringing cx={215} cy={450} r={58} b={b} />
        <text className="t-body" x="215" y="566" fontSize="32">
          {CALLER.name}
        </text>
      </g>
      <g {...b("out", 10.6, { len: 0.3 })}>
        <text x="215" y="602" fontSize="22" {...b("fade", 9.6, { cls: "t-faint" })}>
          Incoming call
        </text>
        <circle fill="none" cx="160" cy="700" r="36" {...b("fade", 9.6, { cls: "s-paper-soft" })} />
        <path d="M 148 688 l 24 24 M 172 688 l -24 24" {...b("fade", 9.6, { cls: "s-paper-soft" })} />
        <g {...b("press", 10.3, { len: 0.4 })}>
          <g {...b("fade", 9.6)}>
            <circle className="f-gold-v" cx="270" cy="700" r="36" />
            <Handset cx={270} cy={702} k={0.42} />
          </g>
        </g>
      </g>
      <g {...b("pop", 10.7, { len: 0.6 })}>
        <text className="t-faint" x="215" y="602" fontSize="22">
          On the call · 0:04
        </text>
        <rect className="f-gold-v" x="110" y="668" width="210" height="64" rx="32" />
        <text className="t-ink t-caps" x="215" y="709" fontSize="22">
          Answered
        </text>
      </g>
      {/* Thursday fills in. */}
      <g {...b("rise", 11, { len: 0.9 })}>
        <rect className="card card--deep s-paper-soft" x="410" y="230" width="520" height="320" rx="20" />
        <text className="t-small t-gold-text t-left" x="444" y="292" fontSize="28">
          Thursday
        </text>
        <path className="s-soft" d="M 444 330 H 896 M 444 412 H 896 M 444 494 H 896" />
      </g>
      <g {...b("grow", 11.6, { len: 0.7 })}>
        <rect className="f-gold-v" x="444" y="344" width="452" height="58" rx="8" />
      </g>
      <text x="464" y="382" fontSize="26" {...b("fade", 12, { cls: "t-ink t-left" })}>
        Consult · 10am · {CALLER.name}
      </text>
      {/* And the follow-up goes out. */}
      <g {...b("slide-in", 12.6, { len: 0.9, dx: 80 })}>
        <path className="page" d="M 430 600 h 480 a 22 22 0 0 1 22 22 v 120 a 22 22 0 0 1 -22 22 h -420 l -34 34 v -34 h -26 a 22 22 0 0 1 -22 -22 v -120 a 22 22 0 0 1 22 -22 z" />
        <text className="t-ink t-left" x="442" y="672" fontSize="34">
          Thanks, see you Thursday.
        </text>
        <text className="t-ink-soft t-left" x="442" y="724" fontSize="28">
          Follow-up · sent
        </text>
      </g>
      <g {...b("pop", 13.4, { len: 0.5 })}>
        <circle className="f-gold" cx="914" cy="600" r="28" />
        <path className="s-ink" d="M 901 601 l 9 9 l 17 -18" />
      </g>
    </Art>
  );
}

/** On a phone upright: the call across the top, the Thursday card under it, the follow-up under that. */
function PhonesTall({ b }: { b: Beats }) {
  return (
    <Art tall>
      <text x="500" y="112" fontSize="84" {...b("rise", 9.2, { len: 1.2, cls: "t-disp" })}>
        Phones &amp; booking
      </text>
      <g {...b("rise", 9.4, { len: 0.8 })}>
        <rect className="card s-paper-soft" x="40" y="170" width="920" height="230" rx="60" />
        <Ringing cx={156} cy={285} r={64} b={b} />
        <text className="t-small t-gold-text t-left" x="256" y="256" fontSize="26">
          Front desk
        </text>
        <text className="t-body t-left" x="256" y="312" fontSize="46">
          {CALLER.name}
        </text>
      </g>
      <g {...b("out", 10.6, { len: 0.3 })}>
        <text x="256" y="356" fontSize="28" {...b("fade", 9.6, { cls: "t-faint t-left" })}>
          Incoming call
        </text>
        <circle fill="none" cx="766" cy="285" r="46" {...b("fade", 9.6, { cls: "s-paper-soft" })} />
        <path d="M 751 270 l 30 30 M 781 270 l -30 30" {...b("fade", 9.6, { cls: "s-paper-soft" })} />
        <g {...b("press", 10.3, { len: 0.4 })}>
          <g {...b("fade", 9.6)}>
            <circle className="f-gold-v" cx="884" cy="285" r="46" />
            <Handset cx={884} cy={287} k={0.54} />
          </g>
        </g>
      </g>
      <g {...b("pop", 10.7, { len: 0.6 })}>
        <text className="t-faint t-left" x="256" y="356" fontSize="28">
          On the call · 0:04
        </text>
        <rect className="f-gold-v" x="660" y="249" width="270" height="72" rx="36" />
        <text className="t-ink t-caps" x="795" y="295" fontSize="26">
          Answered
        </text>
      </g>
      <g {...b("rise", 11, { len: 0.9 })}>
        <rect className="card card--deep s-paper-soft" x="40" y="440" width="920" height="330" rx="22" />
        <text className="t-small t-gold-text t-left" x="84" y="506" fontSize="34">
          Thursday
        </text>
        <path className="s-soft" d="M 84 548 H 916 M 84 646 H 916 M 84 734 H 916" />
      </g>
      <g {...b("grow", 11.6, { len: 0.7 })}>
        <rect className="f-gold-v" x="84" y="562" width="832" height="72" rx="10" />
      </g>
      <text x="112" y="611" fontSize="36" {...b("fade", 12, { cls: "t-ink t-left" })}>
        Consult · 10am · {CALLER.name}
      </text>
      <g {...b("slide-in", 12.6, { len: 0.9, dx: 80 })}>
        <path className="page" d="M 62 810 h 876 a 22 22 0 0 1 22 22 v 130 a 22 22 0 0 1 -22 22 h -800 l -34 34 v -34 h -42 a 22 22 0 0 1 -22 -22 v -130 a 22 22 0 0 1 22 -22 z" />
        <text className="t-ink t-left" x="80" y="882" fontSize="44">
          Thanks, see you Thursday.
        </text>
        <text className="t-ink-soft t-left" x="80" y="944" fontSize="32">
          Follow-up · sent
        </text>
      </g>
      <g {...b("pop", 13.4, { len: 0.5 })}>
        <circle className="f-gold" cx="928" cy="812" r="34" />
        <path className="s-ink" d="M 912 813 l 11 11 l 21 -22" />
      </g>
    </Art>
  );
}

/* ── 6. One plan ───────────────────────────────────────────────────────── */

function Close(tall: boolean): SceneArt {
  const D = DESIGN.close;
  const b = beats(D);
  const ry = tall ? 540 : 470;
  const rx = tall ? 240 : 200;
  return {
    far: (
      <Far>
        <defs>
          <radialGradient id="far-close-glow" cx="50%" cy="44%" r="50%">
            <stop offset="0" stopColor="#E8C27A" stopOpacity=".3" />
            <stop offset=".5" stopColor="#A8802F" stopOpacity=".08" />
            <stop offset="1" stopColor="#0C0A08" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1600" height="1000" fill="url(#far-close-glow)" />
      </Far>
    ),
    mid: (
      <>
        <Word x={50} y={tall ? 34 : 33} size={tall ? 0.27 : 0.22} tone="paper" rise={0.2} shine={0.9} D={D}>
          A <span className="film-amp">&amp;</span> J
        </Word>
        <Art tall={tall}>
          <Gold d={`M 500 ${ry} H ${500 - rx}`} fx={b("draw", 0.9, { len: 1.4 })} />
          <Gold d={`M 500 ${ry} H ${500 + rx}`} fx={b("draw", 0.9, { len: 1.4 })} />
        </Art>
        <Word x={50} y={tall ? 58.5 : 58} size={tall ? 0.14 : 0.115} rise={1.1} shine={2} D={D}>
          One plan.
        </Word>
        <Word x={50} y={tall ? 67.5 : 67} size={tall ? 0.042 : 0.04} tone="note" rise={3.7} D={D}>
          Built and looked after by the two of them
        </Word>
      </>
    ),
    near: (
      <>
        <Bokeh dots={NEAR_A} />
        <i {...b("sweep", 1.4, { len: 2, cls: "film-sweep" })} />
      </>
    ),
  };
}

/** Each scene's pictures: tall for a phone upright, calm under reduced motion (where only Plan differs: its threads are only ever straight). */
export const SCENE_ART: Record<SceneId, (tall: boolean, calm: boolean) => SceneArt> = {
  elora: Elora,
  call: Call,
  problem: Problem,
  plan: Plan,
  web: Web,
  more: More,
  close: Close,
};

/**
 * How the camera moves through each scene: the set's drift (x, y, a share of
 * it), its push (scale from, to) and its turn; the out-of-focus lights in
 * front drift further (nx, ny, in screen units), the backdrop less. On a
 * phone upright the push is halved (film.css, --zk), so the set's edges stay
 * on screen.
 */
export const CAMERA: Record<SceneId, { px: string; py: string; z0: number; z1: number; ry: string; nx: string; ny: string }> = {
  elora: { px: "0%", py: "-1.2%", z0: 1.02, z1: 1.1, ry: "0deg", nx: "0vw", ny: "-5vh" },
  call: { px: "-1.6%", py: "0%", z0: 1.02, z1: 1.07, ry: "5deg", nx: "-7vw", ny: "0vh" },
  problem: { px: "1.2%", py: "0.8%", z0: 1.02, z1: 1.06, ry: "-3deg", nx: "6vw", ny: "2vh" },
  plan: { px: "0%", py: "-1.6%", z0: 1.1, z1: 1, ry: "0deg", nx: "0vw", ny: "-6vh" },
  web: { px: "-1.6%", py: "-1%", z0: 1, z1: 1.07, ry: "4deg", nx: "-6vw", ny: "-2vh" },
  more: { px: "0%", py: "0%", z0: 1.02, z1: 1.05, ry: "0deg", nx: "-9vw", ny: "0vh" },
  close: { px: "0%", py: "-2%", z0: 1.1, z1: 1, ry: "0deg", nx: "0vw", ny: "-7vh" },
};
