import { createContext, useContext, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import type { SceneId } from "@/components/elorro/film/script";

/**
 * The film's pictures. Each scene fills the frame in layers, which the camera
 * moves at different speeds (film.css, "camera"), so they read as depth:
 * - far: the backdrop, edge to edge, soft light only: gradients, no blur
 *   filters (they're costly on a phone), and nothing floating in it;
 * - mid: the scene itself, on a set as big as the screen allows, its big
 *   words in HTML so a shine can cross them like the logo's;
 * - near (Elora's scene and the close only): a sweep of light, once.
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
 * The story runs outside in, the way a customer meets a business: being
 * found, the website, booking, a call; then behind the scenes, the office and
 * the photos; then the plan they'd get. Each is a problem, then the fix,
 * quickly: a scene's stages (Stage) give way to one another on the set, the
 * problem in paper and grey, the fix arriving in gold. The winery is the
 * business for being found, its website and its bookings; the orthodontist
 * for calls and the office. Three scenes play Elorro's real work (Clip):
 * Prosperando's site, Clinical Scribe and the Pearls drone footage.
 */

/** Each scene's length as designed, in seconds: its beats are shares of it. */
export const DESIGN: Record<SceneId, number> = {
  elora: 9,
  call: 8.5,
  found: 12.5,
  site: 9.5,
  booking: 8.5,
  calls: 9.5,
  office: 12,
  photo: 5.5,
  plan: 9,
  close: 10.5,
};

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
/** A magnifying glass at (cx, cy), its lens r. */
const lens = (cx: number, cy: number, r: number) => `${ring(cx, cy, r)} M ${cx + r * 0.75} ${cy + r * 0.8} L ${cx + r * 1.75} ${cy + r * 1.8}`;
/** A four-pointed sparkle at (cx, cy), r to its points: the usual sign of an AI answer. */
const sparkle = (cx: number, cy: number, r: number) =>
  `M ${cx} ${cy - r} Q ${cx} ${cy} ${cx + r} ${cy} Q ${cx} ${cy} ${cx} ${cy + r} Q ${cx} ${cy} ${cx - r} ${cy} Q ${cx} ${cy} ${cx} ${cy - r} Z`;
const HANDSET = "q 10 -18 22 -6 l 8 8 q 6 8 -2 16 q 10 18 26 26 q 8 -8 16 -2 l 8 8 q 12 12 -6 22 q -38 6 -72 -72 z";
const STAR = "l 5.5 11 l 12 1.6 l -8.8 8.6 l 2.4 12 l -11.1 -5.6 l -11.1 5.6 l 2.4 -12 l -8.8 -8.6 l 12 -1.6 z";
const sec = (t: number) => `${t.toFixed(3)}s`;

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

/** A big word, in HTML on the set: `x`, `y` in % of the set, `size` a share of its width; `tracked`, its letters spaced like the wordmark's. */
function Word({
  x,
  y,
  size,
  tone = "gold",
  tracked,
  rise,
  shine,
  D,
  children,
}: {
  x: number;
  y: number;
  size: number;
  tone?: "gold" | "paper" | "label" | "note";
  tracked?: boolean;
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
    <p className={`film-word film-word--${tone}${tracked ? " film-word--tracked" : ""}`} style={style}>
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

export type ClipId = "prosperando" | "clinical" | "pearls";
type Cuts = { desktop: string; mobile: string; desktopSd: string; mobileSd: string };
const cuts = (name: string): Cuts => ({
  desktop: `/m/work/${name}-d.mp4`,
  mobile: `/m/work/${name}-m.mp4`,
  desktopSd: `/m/work/${name}-d-sd.mp4`,
  mobileSd: `/m/work/${name}-m-sd.mp4`,
});
const posters = (name: string) => ({ desktop: `/m/work/${name}-d-poster.jpg`, mobile: `/m/work/${name}-m-poster.jpg` });
/**
 * Three of Elorro's own loops (the Work page's), each in its scene: its still
 * first, the loop over it once it plays. `at` and `until` are when it plays,
 * in seconds into its scene as designed; `offset`, where in the loop it
 * starts. The tall layout plays the phone cut, the wide one the desktop cut.
 * film.tsx loads each shortly before (never at the film's start), plays it in
 * step with the film, and leaves it on its still under reduced motion or on a
 * connection too slow for it.
 */
export const CLIPS: Record<ClipId, { scene: SceneId; at: number; until: number; offset: number; cuts: Cuts; poster: { desktop: string; mobile: string } }> = {
  // Prosperando's site, which Elorro built: its opening (the crest over the vines), then on down to a vineyard's page; on a phone, the phone opening.
  prosperando: { scene: "site", at: 3.9, until: 10.1, offset: 0, cuts: cuts("prosperando"), poster: posters("prosperando") },
  // Clinical Scribe: a consult recorded, then written up. Made-up demo data.
  clinical: { scene: "office", at: 8.2, until: 12.6, offset: 1.8, cuts: cuts("clinical"), poster: posters("clinical") },
  // Pearls: the drone over the vines.
  pearls: { scene: "photo", at: 1.2, until: 6.1, offset: 0, cuts: cuts("pearls-drone"), poster: posters("pearls-drone") },
};

/** Where film.tsx puts a loop's video once its scene is in the page (null as it leaves). */
export const ClipContext = createContext<((id: ClipId, slot: HTMLElement | null) => void) | null>(null);

/** A loop on the set, in its box (set units): its still, and a place for its video, fading in at `fx`. `clean`: no darkening at its edges. */
function Clip({ id, tall, box: [x, y, w, h], fx, top, clean }: { id: ClipId; tall: boolean; box: Box; fx: Beat; top?: boolean; clean?: boolean }) {
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
    <div className={`${fx.className} film-clip${top ? " film-clip--top" : ""}${clean ? " film-clip--clean" : ""}`} style={style}>
      <picture>
        <img src={tall ? c.poster.mobile : c.poster.desktop} alt="" decoding="async" />
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

/* ── Elora ─────────────────────────────────────────────────────────────── */

function Elora(tall: boolean): SceneArt {
  const D = DESIGN.elora;
  const b = beats(D);
  const ry = tall ? 600 : 590;
  const rx = tall ? 400 : 250;
  return {
    far: (
      <Far>
        <Glow id="far-elora-spot" cx={50} cy={34} r={58} o={0.24} color="#E8C27A" />
        <Glow id="far-elora-floor" cx={50} cy={100} r={60} o={0.12} color="#BE9645" />
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
          <Word x={50} y={tall ? 72 : 71} size={tall ? 0.13 : 0.11} tracked rise={1.9} shine={2.6} D={D}>
            Elora
          </Word>
          <Word x={50} y={tall ? 81 : 78.5} size={tall ? 0.036 : 0.03} tone="label" rise={2.6} D={D}>
            Ashan &amp; Jordan’s assistant
          </Word>
        </div>
      </>
    ),
    near: <i {...b("sweep", 0.7, { len: 1.8, cls: "film-sweep" })} />,
  };
}

/* ── The call ──────────────────────────────────────────────────────────── */

/** The owners, side by side in the film's line: a woman and a man, head and shoulders, centred on (0, 0). */
function Owners() {
  return (
    <>
      {/* Her: hair to her shoulders, parted to one side. */}
      <g transform="translate(-62 4)">
        <path className="s-paper" d="M -21 -50 C -22 -24, -12 -11, 0 -11 C 12 -11, 22 -24, 21 -50" />
        <path className="s-paper" d="M -37 8 C -30 -6, -32 -26, -32 -46 C -32 -72, -17 -84, 0 -84 C 17 -84, 32 -72, 32 -46 C 32 -26, 30 -6, 37 8" />
        <path className="s-paper" d="M -21 -50 C -6 -52, 8 -60, 16 -74 M 21 -50 C 20 -60, 18 -68, 16 -74" />
        <path className="s-paper" d="M -58 66 C -56 34, -40 16, -14 9 M 14 9 C 40 16, 56 34, 58 66 M -9 -10 V 6 M 9 -10 V 6" />
      </g>
      {/* Him: short hair, an open collar. */}
      <g transform="translate(62 4)">
        <path className="s-paper" d="M -25 -48 C -26 -20, -14 -8, 0 -8 C 14 -8, 26 -20, 25 -48" />
        <path className="s-paper" d="M -25 -48 C -29 -72, -12 -82, 3 -80 C 19 -79, 30 -68, 25 -48 C 19 -58, 9 -62, -2 -58 C -10 -55, -18 -54, -25 -48 Z" />
        <path className="s-paper" d="M -62 66 C -60 30, -42 14, -16 8 L 0 26 L 16 8 C 42 14, 60 30, 62 66 M -10 -8 V 7 M 10 -8 V 7" />
      </g>
    </>
  );
}

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
          <linearGradient id="far-call-line" x1="0" x2="1">
            <stop offset="0" stopColor="#BE9645" stopOpacity="0" />
            <stop offset=".5" stopColor="#BE9645" stopOpacity=".22" />
            <stop offset="1" stopColor="#BE9645" stopOpacity="0" />
          </linearGradient>
        </defs>
        <Glow id="far-call-you" cx={34} cy={52} r={40} o={0.07} color="#F4F1EA" />
        <Glow id="far-call-us" cx={66} cy={52} r={44} o={0.2} />
        <rect x="0" y="719" width="1600" height="2" fill="url(#far-call-line)" />
      </Far>
    ),
    mid: (
      <>
        <Word x={50} y={tall ? 14 : 15} size={tall ? 0.13 : 0.11} rise={4.6} shine={5.3} D={D}>
          Listen.
        </Word>
        <Art tall={tall}>
          <defs>
            <clipPath id="film-call-line">
              <rect x={you + r + 2} y={cy - 60} width={us - you - 2 * r - 4} height="120" />
            </clipPath>
          </defs>
          {/* You, the owners, both of you: drawn on from the thread's end. */}
          <path pathLength={1} d={ringR(you, cy, r)} {...b("draw", 0.9, { len: 1.3, cls: "s-paper-soft" })} />
          <g {...b("fade", 1.5, { len: 1 })}>
            <g transform={`translate(${you} ${cy}) scale(${((r / 150) * 1.06).toFixed(3)})`}>
              <Owners />
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
            <g {...b("fade", 2.6, { len: 0.5 })}>
              <g {...b("out", 7, { len: 0.6 })}>
                <path d={wave(you, us - 90, cy, 30, 72)} {...b("flow", 2.6, { len: 0.75, n: 6, dx: 72, cls: "g-glow thin" })} />
                <path d={wave(you, us - 90, cy, 30, 72)} {...b("flow", 2.6, { len: 0.75, n: 6, dx: 72, cls: "g-core thin" })} />
              </g>
            </g>
          </g>
          {/* And they listen. */}
          <circle cx={us} cy={cy} r={r} {...b("ring", 3, { len: 1.6, n: 3, cls: "s-gold-thin" })} />
          <circle cx={us} cy={cy} r={r} {...b("ring", 3.5, { len: 1.6, n: 3, cls: "s-gold-thin" })} />
        </Art>
      </>
    ),
  };
}

/* ── Getting found: page two, the top, and the answer an AI gives ──────── */

/** The search, as laid out: its bar, the results, page two's divider, the winery's result, and how far each moves. */
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
const QUERY = "winery napa";

function Found(tall: boolean): SceneArt {
  const D = DESIGN.found;
  const b = beats(D);
  const S = tall ? FIND_TALL : FIND_WIDE;
  const [barY, barH] = S.bar;
  const [py, ps, pgap] = S.page;
  const Y = S.you;
  // The winery's result moves to the top as she says so; the others make way.
  const MOVE = 5.1;
  const AI = 7.4;
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
        Your winery
      </text>
      {stars(gold ? "f-gold" : "s-faint-star")}
      <text className="t-small t-left" x={S.x + Y.sub[0]} y={Y.y + Y.sub[1]} fontSize={Y.sub[2]}>
        Napa · Tastings daily
      </text>
    </>
  );
  return {
    far: (
      <Far>
        <Glow id="far-found-a" cx={50} cy={42} r={56} o={0.15} />
        <g {...b("fade", AI, { len: 1.2 })}>
          <Glow id="far-found-b" cx={50} cy={52} r={62} o={0.08} color="#F4F1EA" />
        </g>
      </Far>
    ),
    mid: (
      <>
        <Stage b={b} to={AI - 0.1}>
          <Art tall={tall}>
            {/* The search. */}
            <g {...b("rise", 0.15, { len: 1 })}>
              <rect className="card card--deep s-paper-soft" x={S.x} y={barY} width={S.w} height={barH} rx={barH / 2} />
              <path className="s-paper" d={lens(S.mag[0], S.mag[1], S.mag[2])} />
            </g>
            <text className="t-body t-left" x={S.q[0]} y={S.q[1]} fontSize={S.q[2]}>
              <Typed text={QUERY} at={0.5} b={b} step={0.07} />
            </text>
            {[0, 1, 2].map((i) => {
              const y = S.res.y + i * S.res.gap;
              return (
                <g key={i} {...b("moveto", MOVE, { len: 1.3, dy: S.res.gap })}>
                  <g {...b("rise", 1.4 + i * 0.15, { len: 0.8 })}>
                    <rect className="card card--deep" x={S.x} y={y} width={S.w} height={S.res.h} rx="16" />
                    <path className="s-dim thick" d={`M ${S.x + 34} ${y + S.res.l1} h ${S.res.w1 - i * 40}`} />
                    <path className="s-soft" d={`M ${S.x + 34} ${y + S.res.l2} h ${S.res.w2 - i * 30}`} />
                  </g>
                </g>
              );
            })}
            {/* Page two, where the winery is. */}
            <g {...b("out", MOVE - 0.2, { len: 0.4 })}>
              <g {...b("fade", 2.2, { len: 0.6 })}>
                <path className="s-soft" d={`M ${S.x} ${py} H ${500 - pgap} M ${500 + pgap} ${py} H ${S.x + S.w}`} />
                <text className="t-small" x="500" y={py + ps * 0.36} fontSize={ps}>
                  Page 2
                </text>
              </g>
            </g>
            <g {...b("moveto", MOVE, { len: 1.3, dy: S.res.y - Y.y })}>
              <g {...b("rise", 2.4, { len: 0.9 })}>{result(false)}</g>
              {/* At the top, in gold. */}
              <g {...b("fade", MOVE + 0.6, { len: 0.8 })}>{result(true)}</g>
            </g>
          </Art>
        </Stage>
        <Stage b={b}>{tall ? <AnswersTall b={b} at={AI} /> : <AnswersWide b={b} at={AI} />}</Stage>
      </>
    ),
  };
}

/**
 * The newer way to look: ask an AI. Two answer panels, side by side, both
 * naming the winery: an AI answer on a search page and a chat. Generic UI in
 * the film's own hand, the services' names in plain text, no logos.
 */
function AnswersWide({ b, at }: { b: Beats; at: number }) {
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
        <text className="t-ink-soft t-left" x="130" y="225" fontSize="19">
          winery tasting napa
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
          For a tasting near Napa, try
        </text>
      </g>
      <g {...b("fade", at + 1.45, { len: 0.6 })}>
        <text className="t-gold-deep t-left t-strong" x="104" y="454" fontSize="28">
          Your winery
        </text>
        <text className="t-ink-soft t-left" x="104" y="496" fontSize="19">
          Small-batch tastings, booked
        </text>
        <text className="t-ink-soft t-left" x="104" y="524" fontSize="19">
          online, open daily.
        </text>
      </g>
      <path pathLength={1} d="M 104 466 H 262" {...b("draw", at + 2.3, { len: 0.6, cls: "s-gold" })} />

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
          Best winery for a
        </text>
        <text className="t-ink t-left" x="654" y="274" fontSize="21">
          tasting near Napa?
        </text>
      </g>
      <g {...b("fade", at + 1.5, { len: 0.6 })}>
        <text className="t-ink t-left" x="542" y="364" fontSize="21">
          I’d go with
        </text>
      </g>
      <g {...b("fade", at + 1.75, { len: 0.6 })}>
        <text className="t-gold-deep t-left t-strong" x="542" y="408" fontSize="28">
          Your winery
        </text>
        {["Small-batch tastings", "Booked online", "Open daily"].map((t, i) => (
          <text key={t} className="t-ink-soft t-left" x="542" y={452 + i * 32} fontSize="19">
            •&#8194;{t}
          </text>
        ))}
      </g>
      <path pathLength={1} d="M 542 420 H 700" {...b("draw", at + 2.45, { len: 0.6, cls: "s-gold" })} />
    </Art>
  );
}

/** The same on a phone upright: the two answers one above the other. */
function AnswersTall({ b, at }: { b: Beats; at: number }) {
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
          winery tasting napa
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
          For a tasting near Napa, try
        </text>
      </g>
      <g {...b("fade", at + 1.45, { len: 0.6 })}>
        <text className="t-gold-deep t-left t-strong" x="114" y="432" fontSize="40">
          Your winery
        </text>
        <text className="t-ink-soft t-left" x="114" y="484" fontSize="28">
          Small-batch tastings, booked online, open daily.
        </text>
      </g>
      <path pathLength={1} d="M 114 446 H 340" {...b("draw", at + 2.3, { len: 0.6, cls: "s-gold" })} />

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
        <rect className="f-ink-soft" x="318" y="662" width="598" height="78" rx="39" />
        <text className="t-ink t-left" x="350" y="711" fontSize="28">
          Best winery for a tasting near Napa?
        </text>
      </g>
      <g {...b("fade", at + 1.5, { len: 0.6 })}>
        <text className="t-ink t-left" x="84" y="806" fontSize="32">
          I’d go with
        </text>
      </g>
      <g {...b("fade", at + 1.75, { len: 0.6 })}>
        <text className="t-gold-deep t-left t-strong" x="262" y="806" fontSize="40">
          Your winery
        </text>
        <text className="t-ink-soft t-left" x="84" y="866" fontSize="28">
          •&#8194;Small-batch tastings&#8194;•&#8194;Booked online
        </text>
        <text className="t-ink-soft t-left" x="84" y="910" fontSize="28">
          •&#8194;Open daily
        </text>
      </g>
      <path pathLength={1} d="M 262 820 H 488" {...b("draw", at + 2.45, { len: 0.6, cls: "s-gold" })} />
    </Art>
  );
}

/* ── The website: a dated one, then one they built ─────────────────────── */

const SITE_WIDE = { frame: [70, 100, 860, 596] as Box, bar: 56, url: 20, pill: [300, 110, 400, 36] as Box, body: [72, 158, 856, 536] as Box };
const SITE_TALL = { frame: [130, 40, 740, 1014] as Box, bar: 90, url: 26, pill: [190, 60, 620, 50] as Box, body: [132, 132, 736, 920] as Box };

function Site(tall: boolean): SceneArt {
  const D = DESIGN.site;
  const b = beats(D);
  const L = tall ? SITE_TALL : SITE_WIDE;
  const [fx, fy, fw, fh] = L.frame;
  const [px, py, pw, ph] = L.pill;
  const urlY = py + ph / 2 + L.url * 0.36;
  const NEW = 3.6;
  return {
    far: (
      <Far>
        <Glow id="far-site-a" cx={50} cy={46} r={58} o={0.13} color="#F4F1EA" />
        <g {...b("fade", NEW, { len: 1.4 })}>
          <Glow id="far-site-b" cx={50} cy={50} r={60} o={0.16} />
        </g>
      </Far>
    ),
    mid: (
      <div {...b("rise", 0.1, { len: 1, cls: "film-layer" })}>
        {/* A browser: the same frame for the old site and the new. */}
        <Art tall={tall}>
          <rect className="card card--site s-paper-soft" x={fx} y={fy} width={fw} height={fh} rx={tall ? 44 : 18} />
          {!tall && (
            <g className="f-dim">
              <circle cx={fx + 32} cy={fy + L.bar / 2} r="7" />
              <circle cx={fx + 56} cy={fy + L.bar / 2} r="7" />
              <circle cx={fx + 80} cy={fy + L.bar / 2} r="7" />
            </g>
          )}
          <rect className="f-url" x={px} y={py} width={pw} height={ph} rx={ph / 2} />
        </Art>
        {/* Prosperando's site, which they built, playing in it. */}
        <Clip id="prosperando" tall={tall} box={L.body} fx={b("fade", NEW + 0.2, { len: 0.6 })} clean />
        {/* Over it, until it gives way: the old one. */}
        <div {...b("pass", NEW, { len: 0.8, cls: "film-layer" })}>
          <Art tall={tall}>
            {tall ? <DatedTall b={b} body={L.body} /> : <DatedWide b={b} body={L.body} />}
            <text className="t-faint" x="500" y={urlY} fontSize={L.url}>
              yourwinery.com
            </text>
          </Art>
        </div>
        <Art tall={tall}>
          <text x="500" y={urlY} fontSize={L.url} {...b("fade", NEW + 0.3, { len: 0.6, cls: "t-body" })}>
            prosperandovineyards.com
          </text>
          <g {...b("fade", NEW + 0.9, { len: 1 })}>
            <rect className="s-gold-edge" fill="none" x={fx} y={fy} width={fw} height={fh} rx={tall ? 44 : 18} />
          </g>
        </Art>
      </div>
    ),
  };
}

/** A dated, cluttered winery site, in its box: a shouting banner, a wall of links, a broken picture, a visitor counter. */
function DatedWide({ b, body: [x, y, w, h] }: { b: Beats; body: Box }) {
  const bar = (bx: number, by: number, bw: number) => <rect className="f-old-text" x={bx} y={by} width={bw} height="8" rx="2" />;
  return (
    <>
      <rect className="f-old-page" x={x} y={y} width={w} height={h} />
      <g {...b("pop", 0.2, { len: 0.4 })}>
        <rect className="f-old-banner" x={x + 16} y={y + 14} width={w - 32} height="70" />
        <text className="t-old t-old-yellow t-strong" x="500" y={y + 61} fontSize="32">
          WELCOME TO OUR WINERY!!!
        </text>
      </g>
      <text x="500" y={y + 112} fontSize="16" {...b("fade", 0.35, { len: 0.2, cls: "t-old t-old-link" })}>
        Home | About Us | Our Wines | Events | Gift Shop | Guestbook | Links
      </text>
      <g {...b("pop", 0.5, { len: 0.4 })}>
        <rect className="f-old-box" x={x + 16} y={y + 130} width="170" height="380" />
        {["» Specials", "» Wine Club", "» Gift Shop", "» Directions", "» Guestbook", "» Newsletter", "» Awards", "» Photos", "» Links"].map((t, i) => (
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
          Click HERE to book a tasting!!
        </text>
        <path className="s-old-link" d={`M ${x + 202} ${y + 497} H ${x + 478}`} />
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
function DatedTall({ b, body: [x, y, w] }: { b: Beats; body: Box }) {
  const bar = (bx: number, by: number, bw: number) => <rect className="f-old-text" x={bx} y={by} width={bw} height="11" rx="3" />;
  return (
    <>
      <rect className="f-old-page" x={x} y={y} width={w} height="920" />
      <g {...b("pop", 0.2, { len: 0.4 })}>
        <rect className="f-old-banner" x={x + 14} y={y + 14} width={w - 28} height="116" />
        <text className="t-old t-old-yellow t-strong" x="500" y={y + 64} fontSize="38">
          WELCOME TO OUR
        </text>
        <text className="t-old t-old-yellow t-strong" x="500" y={y + 110} fontSize="38">
          WINERY!!!
        </text>
      </g>
      <g {...b("fade", 0.35, { len: 0.2 })}>
        <text className="t-old t-old-link" x="500" y={y + 170} fontSize="24">
          Home | About Us | Our Wines | Events
        </text>
        <text className="t-old t-old-link" x="500" y={y + 204} fontSize="24">
          Gift Shop | Guestbook | Links
        </text>
      </g>
      <g {...b("pop", 0.5, { len: 0.4 })}>
        <rect className="f-old-box" x={x + 14} y={y + 228} width="220" height="440" />
        {["» Specials", "» Wine Club", "» Gift Shop", "» Directions", "» Guestbook", "» Newsletter", "» Awards", "» Photos"].map((t, i) => (
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
          Click HERE to book!!
        </text>
        <path className="s-old-link" d={`M ${x + 14} ${y + 878} H ${x + 254}`} />
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

/* ── Booking: an inbox of requests, then a click ───────────────────────── */

const TEXTS = ["Can I book Saturday at 2?", "Is 4 still open?", "Any room for 6 on Sunday?", "Did you get my text?", "Can we do 3 instead?"];
const MAILS: [string, string][] = [
  ["Booking request", "Hi, is Saturday at 2 free?"],
  ["Re: Tasting for 6", "Following up on my email…"],
  ["Fwd: Saturday?", "Can you fit us in…"],
  ["Group of 8", "Any time this weekend?"],
  ["Re: Re: Booking", "Just checking again…"],
];

function Booking(tall: boolean): SceneArt {
  const D = DESIGN.booking;
  const b = beats(D);
  const FIX = 3.9;
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
        <Stage b={b} to={FIX - 0.1}>{tall ? <InboxTall b={b} /> : <InboxWide b={b} />}</Stage>
        <Stage b={b} from={FIX}>{tall ? <BookTall b={b} /> : <BookWide b={b} />}</Stage>
      </>
    ),
  };
}

function InboxWide({ b }: { b: Beats }) {
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
      {TEXTS.map((t, i) => (
        <g key={t} {...b("pop", 0.35 + i * 0.5, { len: 0.5 })}>
          <rect className="bubble" x="96" y={222 + i * 98} width={Math.min(348, t.length * 11.6 + 46)} height="72" rx="26" />
          <text className="t-body t-left" x="120" y={266 + i * 98} fontSize="23">
            {t}
          </text>
        </g>
      ))}
      {/* And emails, piling up. */}
      <g {...b("rise", 0.25, { len: 0.9 })}>
        <rect className="card" x="510" y="110" width="420" height="640" rx="26" />
        <text className="t-small t-left" x="546" y="170" fontSize="20">
          Inbox
        </text>
        <path className="s-soft" d="M 510 196 H 930" />
        <circle className="f-paper" cx="886" cy="162" r="24" />
      </g>
      <Count values={["3", "8", "14"]} at={[0.6, 1.5, 2.4]} x={886} y={170} size={22} cls="t-ink t-strong" b={b} />
      {MAILS.map(([from, subject], i) => (
        <g key={from} {...b("rise", 0.6 + i * 0.45, { len: 0.6 })}>
          <circle className="f-paper" cx="544" cy={240 + i * 100} r="6" />
          <text className="t-body t-left t-strong" x="564" y={248 + i * 100} fontSize="24">
            {from}
          </text>
          <text className="t-faint t-left" x="564" y={282 + i * 100} fontSize="20">
            {subject}
          </text>
          {i < MAILS.length - 1 && <path className="s-soft" d={`M 544 ${308 + i * 100} H 900`} />}
        </g>
      ))}
    </Art>
  );
}

function InboxTall({ b }: { b: Beats }) {
  return (
    <Art tall>
      <g {...b("rise", 0.1, { len: 0.9 })}>
        <rect className="card" x="40" y="30" width="920" height="500" rx="44" />
        <text className="t-small t-left" x="84" y="94" fontSize="28">
          Messages
        </text>
        <path className="s-soft" d="M 40 124 H 960" />
      </g>
      {TEXTS.slice(0, 4).map((t, i) => (
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
          Inbox
        </text>
        <path className="s-soft" d="M 40 654 H 960" />
        <circle className="f-paper" cx="900" cy="614" r="32" />
      </g>
      <Count values={["3", "8", "14"]} at={[0.6, 1.5, 2.4]} x={900} y={624} size={30} cls="t-ink t-strong" b={b} />
      {MAILS.slice(0, 4).map(([from, subject], i) => (
        <g key={from} {...b("rise", 0.6 + i * 0.5, { len: 0.6 })}>
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
function Choice({ x, y, w, h, size, text, pick, b }: { x: number; y: number; w: number; h: number; size: number; text: string; pick?: number; b: Beats }) {
  return (
    <>
      <rect className="card s-paper-soft" x={x} y={y} width={w} height={h} rx="10" />
      <text className="t-body" x={x + w / 2} y={y + h / 2 + size * 0.36} fontSize={size}>
        {text}
      </text>
      {pick !== undefined && (
        <g {...b("pop", pick, { len: 0.4 })}>
          <rect className="f-gold-v" x={x} y={y} width={w} height={h} rx="10" />
          <text className="t-ink t-strong" x={x + w / 2} y={y + h / 2 + size * 0.36} fontSize={size}>
            {text}
          </text>
        </g>
      )}
    </>
  );
}

function BookWide({ b }: { b: Beats }) {
  return (
    <Art tall={false}>
      {/* The winery's own booking, on its site. */}
      <rect className="card card--deep s-paper-soft" x="250" y="96" width="500" height="490" rx="24" />
      <text className="t-disp t-gold t-left" x="290" y="168" fontSize="48">
        Your winery
      </text>
      <text className="t-small t-left" x="292" y="210" fontSize="19">
        Book a tasting · Saturday
      </text>
      {["Fri", "Sat", "Sun"].map((d, i) => (
        <Choice key={d} x={290 + i * 145} y={238} w={130} h={64} size={24} text={d} pick={i === 1 ? 4.4 : undefined} b={b} />
      ))}
      {["12pm", "2pm", "4pm"].map((t, i) => (
        <Choice key={t} x={290 + i * 145} y={318} w={130} h={64} size={24} text={t} pick={i === 1 ? 4.7 : undefined} b={b} />
      ))}
      <text className="t-faint t-left" x="290" y="428" fontSize="22">
        Guests
      </text>
      <text className="t-body t-right" x="710" y="428" fontSize="26">
        4
      </text>
      <path className="s-soft" d="M 290 448 H 710" />
      <g {...b("press", 5.2, { len: 0.5 })}>
        <rect className="f-gold-v" x="290" y="478" width="420" height="76" rx="8" />
        <text className="t-ink t-caps" x="500" y="525" fontSize="24">
          Book a tasting
        </text>
      </g>
      <circle cx="500" cy="516" r="44" {...b("ring", 5.2, { len: 0.9, n: 1, cls: "s-gold-thin" })} />
      {/* It comes in, confirmed, with nobody sorting it. */}
      <g {...b("slide-in", 5.8, { len: 0.9, dx: 80 })}>
        <rect className="page" x="250" y="620" width="500" height="160" rx="18" />
        <circle className="f-gold" cx="290" cy="668" r="12" />
        <text className="t-ink t-left t-strong" x="314" y="680" fontSize="32">
          New booking
        </text>
        <text className="t-ink-soft t-left" x="290" y="740" fontSize="26">
          Tasting for 4 · Sat 2pm
        </text>
      </g>
      <g {...b("pop", 6.6, { len: 0.5 })}>
        <text className="t-gold-deep t-right t-strong t-caps" x="674" y="676" fontSize="17">
          Confirmed
        </text>
        <Tick cx={708} cy={670} r={22} />
      </g>
    </Art>
  );
}

function BookTall({ b }: { b: Beats }) {
  return (
    <Art tall>
      <rect className="card card--deep s-paper-soft" x="40" y="30" width="920" height="600" rx="30" />
      <text className="t-disp t-gold t-left" x="84" y="120" fontSize="62">
        Your winery
      </text>
      <text className="t-small t-left" x="86" y="174" fontSize="27">
        Book a tasting · Saturday
      </text>
      {["Fri", "Sat", "Sun"].map((d, i) => (
        <Choice key={d} x={84 + i * 284} y={210} w={264} h={84} size={34} text={d} pick={i === 1 ? 4.4 : undefined} b={b} />
      ))}
      {["12pm", "2pm", "4pm"].map((t, i) => (
        <Choice key={t} x={84 + i * 284} y={312} w={264} h={84} size={34} text={t} pick={i === 1 ? 4.7 : undefined} b={b} />
      ))}
      <text className="t-faint t-left" x="84" y="448" fontSize="30">
        Guests
      </text>
      <text className="t-body t-right" x="916" y="448" fontSize="36">
        4
      </text>
      <path className="s-soft" d="M 84 472 H 916" />
      <g {...b("press", 5.2, { len: 0.5 })}>
        <rect className="f-gold-v" x="84" y="500" width="832" height="96" rx="10" />
        <text className="t-ink t-caps" x="500" y="560" fontSize="34">
          Book a tasting
        </text>
      </g>
      <circle cx="500" cy="548" r="58" {...b("ring", 5.2, { len: 0.9, n: 1, cls: "s-gold-thin" })} />
      <g {...b("slide-in", 5.8, { len: 0.9, dx: 80 })}>
        <rect className="page" x="40" y="680" width="920" height="230" rx="24" />
        <circle className="f-gold" cx="96" cy="750" r="16" />
        <text className="t-ink t-left t-strong" x="128" y="766" fontSize="46">
          New booking
        </text>
        <text className="t-ink-soft t-left" x="84" y="850" fontSize="38">
          Tasting for 4 · Sat 2pm
        </text>
      </g>
      <g {...b("pop", 6.6, { len: 0.5 })}>
        <text className="t-gold-deep t-right t-strong t-caps" x="836" y="760" fontSize="26">
          Confirmed
        </text>
        <Tick cx={884} cy={750} r={34} />
      </g>
    </Art>
  );
}

/* ── Calls: the front desk, too busy; then every call answered ─────────── */

/** The caller, the same on both layouts: a made-up patient of the orthodontist's (and, later, in its office). */
const CALLER = { name: "Sofia Park", initials: "SP" };

/** The answer button's handset, in ink, at (cx, cy). */
const Handset = ({ cx, cy, k, cls = "s-ink" }: { cx: number; cy: number; k: number; cls?: string }) => (
  <g transform={`translate(${cx} ${cy}) scale(${k}) translate(-300 -486)`}>
    <path className={cls} d={`M 262 450 ${HANDSET}`} />
  </g>
);

/** A call coming in to the front desk, at (cx, cy): the caller's circle, ringing from `at`, until it's answered. */
function Ringing({ cx, cy, r, at, b }: { cx: number; cy: number; r: number; at: number; b: Beats }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} {...b("ring", at, { len: 1, n: 1, cls: "s-gold-thin" })} />
      <circle cx={cx} cy={cy} r={r} {...b("ring", at + 0.45, { len: 1, n: 1, cls: "s-gold-thin" })} />
      <circle className="f-gold-dim s-gold-edge" cx={cx} cy={cy} r={r} />
      <text className="t-disp" x={cx} y={cy + r * 0.27} fontSize={r * 0.78}>
        {CALLER.initials}
      </text>
    </>
  );
}

function Calls(tall: boolean): SceneArt {
  const D = DESIGN.calls;
  const b = beats(D);
  const FIX = 4.5;
  return {
    far: (
      <Far>
        <Glow id="far-calls-a" cx={50} cy={48} r={54} o={0.1} color="#F4F1EA" />
        <g {...b("fade", FIX, { len: 1.4 })}>
          <Glow id="far-calls-b" cx={40} cy={46} r={60} o={0.17} />
        </g>
      </Far>
    ),
    mid: (
      <>
        {/* The front desk's phone, ringing and ringing, the missed calls counting up. */}
        <Stage b={b} to={FIX - 0.1}>
          <Art tall={tall}>
            <g transform={tall ? "translate(500 560) scale(1.3) translate(-500 -440)" : "translate(500 430) scale(.97) translate(-500 -460)"}>
              <g {...b("rise", 0.15, { len: 0.9 })}>
                <rect className="s-paper-soft card" x="330" y="120" width="340" height="680" rx="56" />
                <text className="t-small" x="500" y="236" fontSize="30">
                  Front desk
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
        {/* Then a call comes in, and it's answered, booked and followed up. */}
        <Stage b={b} from={FIX}>{tall ? <AnsweredTall b={b} /> : <AnsweredWide b={b} />}</Stage>
      </>
    ),
  };
}

function AnsweredWide({ b }: { b: Beats }) {
  return (
    <Art tall={false}>
      {/* The front desk's phone: a call coming in, then answered. */}
      <g {...b("rise", 4.6, { len: 0.8 })}>
        <rect className="card s-paper-soft" x="70" y="230" width="290" height="560" rx="44" />
        <path className="s-soft thick" d="M 190 262 H 240" />
        <text className="t-small t-gold-text" x="215" y="322" fontSize="22">
          Front desk
        </text>
        <Ringing cx={215} cy={450} r={58} at={4.8} b={b} />
        <text className="t-body" x="215" y="566" fontSize="32">
          {CALLER.name}
        </text>
      </g>
      <g {...b("out", 5.8, { len: 0.3 })}>
        <text x="215" y="602" fontSize="22" {...b("fade", 4.8, { cls: "t-faint" })}>
          Incoming call
        </text>
        <circle fill="none" cx="160" cy="700" r="36" {...b("fade", 4.8, { cls: "s-paper-soft" })} />
        <path d="M 148 688 l 24 24 M 172 688 l -24 24" {...b("fade", 4.8, { cls: "s-paper-soft" })} />
        <g {...b("press", 5.5, { len: 0.4 })}>
          <g {...b("fade", 4.8)}>
            <circle className="f-gold-v" cx="270" cy="700" r="36" />
            <Handset cx={270} cy={702} k={0.42} />
          </g>
        </g>
      </g>
      <g {...b("pop", 5.9, { len: 0.6 })}>
        <text className="t-faint" x="215" y="602" fontSize="22">
          On the call · 0:04
        </text>
        <rect className="f-gold-v" x="110" y="668" width="210" height="64" rx="32" />
        <text className="t-ink t-caps" x="215" y="709" fontSize="22">
          Answered
        </text>
      </g>
      {/* Thursday fills in. */}
      <g {...b("rise", 6.2, { len: 0.9 })}>
        <rect className="card card--deep s-paper-soft" x="410" y="230" width="520" height="320" rx="20" />
        <text className="t-small t-gold-text t-left" x="444" y="292" fontSize="28">
          Thursday
        </text>
        <path className="s-soft" d="M 444 330 H 896 M 444 412 H 896 M 444 494 H 896" />
      </g>
      <g {...b("grow", 6.8, { len: 0.7 })}>
        <rect className="f-gold-v" x="444" y="344" width="452" height="58" rx="8" />
      </g>
      <text x="464" y="382" fontSize="26" {...b("fade", 7.2, { cls: "t-ink t-left" })}>
        Consult · 10am · {CALLER.name}
      </text>
      {/* And the follow-up goes out. */}
      <g {...b("slide-in", 7.8, { len: 0.9, dx: 80 })}>
        <path className="page" d="M 430 600 h 480 a 22 22 0 0 1 22 22 v 120 a 22 22 0 0 1 -22 22 h -420 l -34 34 v -34 h -26 a 22 22 0 0 1 -22 -22 v -120 a 22 22 0 0 1 22 -22 z" />
        <text className="t-ink t-left" x="442" y="672" fontSize="34">
          Thanks, see you Thursday.
        </text>
        <text className="t-ink-soft t-left" x="442" y="724" fontSize="28">
          Follow-up · sent
        </text>
      </g>
      <g {...b("pop", 8.6, { len: 0.5 })}>
        <circle className="f-gold" cx="914" cy="600" r="28" />
        <path className="s-ink" d="M 901 601 l 9 9 l 17 -18" />
      </g>
    </Art>
  );
}

/** On a phone upright: the call across the top, the Thursday card under it, the follow-up under that. */
function AnsweredTall({ b }: { b: Beats }) {
  return (
    <Art tall>
      <g {...b("rise", 4.6, { len: 0.8 })}>
        <rect className="card s-paper-soft" x="40" y="130" width="920" height="230" rx="60" />
        <Ringing cx={156} cy={245} r={64} at={4.8} b={b} />
        <text className="t-small t-gold-text t-left" x="256" y="216" fontSize="26">
          Front desk
        </text>
        <text className="t-body t-left" x="256" y="272" fontSize="46">
          {CALLER.name}
        </text>
      </g>
      <g {...b("out", 5.8, { len: 0.3 })}>
        <text x="256" y="316" fontSize="28" {...b("fade", 4.8, { cls: "t-faint t-left" })}>
          Incoming call
        </text>
        <circle fill="none" cx="766" cy="245" r="46" {...b("fade", 4.8, { cls: "s-paper-soft" })} />
        <path d="M 751 230 l 30 30 M 781 230 l -30 30" {...b("fade", 4.8, { cls: "s-paper-soft" })} />
        <g {...b("press", 5.5, { len: 0.4 })}>
          <g {...b("fade", 4.8)}>
            <circle className="f-gold-v" cx="884" cy="245" r="46" />
            <Handset cx={884} cy={247} k={0.54} />
          </g>
        </g>
      </g>
      <g {...b("pop", 5.9, { len: 0.6 })}>
        <text className="t-faint t-left" x="256" y="316" fontSize="28">
          On the call · 0:04
        </text>
        <rect className="f-gold-v" x="660" y="209" width="270" height="72" rx="36" />
        <text className="t-ink t-caps" x="795" y="255" fontSize="26">
          Answered
        </text>
      </g>
      <g {...b("rise", 6.2, { len: 0.9 })}>
        <rect className="card card--deep s-paper-soft" x="40" y="400" width="920" height="330" rx="22" />
        <text className="t-small t-gold-text t-left" x="84" y="466" fontSize="34">
          Thursday
        </text>
        <path className="s-soft" d="M 84 508 H 916 M 84 606 H 916 M 84 694 H 916" />
      </g>
      <g {...b("grow", 6.8, { len: 0.7 })}>
        <rect className="f-gold-v" x="84" y="522" width="832" height="72" rx="10" />
      </g>
      <text x="112" y="571" fontSize="36" {...b("fade", 7.2, { cls: "t-ink t-left" })}>
        Consult · 10am · {CALLER.name}
      </text>
      <g {...b("slide-in", 7.8, { len: 0.9, dx: 80 })}>
        <path className="page" d="M 62 770 h 876 a 22 22 0 0 1 22 22 v 130 a 22 22 0 0 1 -22 22 h -800 l -34 34 v -34 h -42 a 22 22 0 0 1 -22 -22 v -130 a 22 22 0 0 1 22 -22 z" />
        <text className="t-ink t-left" x="80" y="842" fontSize="44">
          Thanks, see you Thursday.
        </text>
        <text className="t-ink-soft t-left" x="80" y="904" fontSize="32">
          Follow-up · sent
        </text>
      </g>
      <g {...b("pop", 8.6, { len: 0.5 })}>
        <circle className="f-gold" cx="928" cy="772" r="34" />
        <path className="s-ink" d="M 912 773 l 11 11 l 21 -22" />
      </g>
    </Art>
  );
}

/* ── Behind the scenes: the same details three times, then once; then a tool of their own ── */

type Win = { x: number; w: number; h: number; bar: number; ys: number[]; title: number; label: number; value: number; k: number };
const DESK_WIDE: Win = { x: 330, w: 600, h: 200, bar: 50, ys: [110, 330, 550], title: 17, label: 20, value: 26, k: 1 };
const DESK_TALL: Win = { x: 90, w: 870, h: 270, bar: 64, ys: [210, 500, 790], title: 26, label: 28, value: 36, k: 1.4 };
const APPS = ["Booking system", "Spreadsheet", "Email"];
/** When each app gets the patient typed in by hand; and, once there's one entry, filled in on its own. */
const TYPE_AT = [0.7, 1.8, 2.9];
const FILL_AT = 5.55;

/**
 * One of the office's apps with the patient in it: typed by hand (`typed`,
 * from its time), or filled in on its own from the one entry.
 */
function AppFields({ i, W, wy, b, typed }: { i: number; W: Win; wy: number; b: Beats; typed: boolean }) {
  const x = W.x;
  const k = W.k;
  const name = (cls: string, nx: number, ny: number, size: number) => (
    <text className={`${cls} t-left`} x={nx} y={ny} fontSize={size}>
      {typed ? <Typed text={CALLER.name} at={TYPE_AT[i]} b={b} /> : CALLER.name}
    </text>
  );
  const rest = (node: ReactNode) => (typed ? <g {...b("fade", TYPE_AT[i] + 0.65, { len: 0.3 })}>{node}</g> : node);
  const val = typed ? "t-body" : "t-gold-text";
  if (i === 0)
    return (
      <>
        {name(val, x + 170 * k, wy + 104 * k, W.value)}
        {rest(
          <text className={`${val} t-left`} x={x + 170 * k} y={wy + 158 * k} fontSize={W.value}>
            Consult · Thu 10am
          </text>
        )}
      </>
    );
  if (i === 1)
    return (
      <>
        {name(val, x + 32 * k, wy + 154 * k, W.value - 2)}
        {rest(
          <>
            <text className={`${val} t-left`} x={x + 226 * k} y={wy + 154 * k} fontSize={W.value - 4}>
              415 555 0142
            </text>
            <text className={`${val} t-left`} x={x + 420 * k} y={wy + 154 * k} fontSize={W.value - 4}>
              Thu 10am
            </text>
          </>
        )}
      </>
    );
  return (
    <>
      {name(val, x + 92 * k, wy + 104 * k, W.value)}
      {rest(
        <text className={`${val} t-left`} x={x + 92 * k} y={wy + 158 * k} fontSize={W.value - 2}>
          Your consult, Thu 10am
        </text>
      )}
    </>
  );
}

/** An app's window, its labels and lines, empty. */
function AppWindow({ i, W, wy }: { i: number; W: Win; wy: number }) {
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
          {label("Patient", x + 32 * k, wy + 104 * k)}
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

function Office(tall: boolean): SceneArt {
  const D = DESIGN.office;
  const b = beats(D);
  const W = tall ? DESK_TALL : DESK_WIDE;
  const ONE = 4.4;
  const TOOL = 6.9;
  // The card beside them: hours lost to typing, then the one entry.
  const side = tall ? ([40, 30, 920, 150] as Box) : ([70, 300, 200, 260] as Box);
  const [sx, sy, sw, sh] = side;
  const mid = (wy: number) => wy + W.h / 2;
  // From the one entry into each app: down the left of them on a phone; across, then up or down, on a wide screen.
  const feed = (wy: number) => {
    const m = mid(wy);
    if (tall) return `M 56 ${sy + sh} V ${m - 10} Q 56 ${m} 66 ${m} H ${W.x}`;
    const from = sy + sh / 2;
    if (m === from) return `M ${sx + sw} ${from} H ${W.x}`;
    const s = m > from ? 1 : -1;
    return `M ${sx + sw} ${from} H 292 Q 300 ${from} 300 ${from + 8 * s} V ${m - 8 * s} Q 300 ${m} 308 ${m} H ${W.x}`;
  };
  // Custom tools: the consult-notes window, its title bar, and its body, where the gold sketch turns into the real thing.
  const T = tall ? { win: [40, 190, 920, 850] as Box, bar: 70, title: 122, size: 92, rec: 236 } : { win: [70, 210, 860, 600] as Box, bar: 74, title: 150, size: 88, rec: 210 };
  const [wx, wy, ww, wh] = T.win;
  const body: Box = [wx + 2, wy + T.bar + 2, ww - 4, wh - T.bar - 4];
  const waveY = tall ? 470 : 420;
  const waveX = (i: number) => (tall ? 92 + i * 32 : 124 + i * 29);
  const waveK = tall ? 1.9 : 1.4;
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
        <Stage b={b} to={TOOL}>
          <Art tall={tall}>
            {W.ys.map((y, i) => (
              <g key={y} {...b("rise", 0.2 + i * 0.2, { len: 0.8 })}>
                <AppWindow i={i} W={W} wy={y} />
              </g>
            ))}
            {/* Typed by hand, one app after another, the hours adding up. */}
            <g {...b("out", ONE, { len: 0.35 })}>
              {W.ys.map((y, i) => (
                <AppFields key={y} i={i} W={W} wy={y} b={b} typed />
              ))}
              <g {...b("rise", 0.4, { len: 0.8 })}>
                <rect className="card s-paper-soft" x={sx} y={sy} width={sw} height={sh} rx="20" />
                <text className="t-small t-left" x={tall ? 84 : sx + 28} y={tall ? sy + 62 : sy + 50} fontSize={tall ? 26 : 18}>
                  By hand
                </text>
                <text className="t-faint t-left" x={tall ? 84 : sx + 28} y={tall ? sy + 114 : sy + 222} fontSize={tall ? 30 : 20}>
                  hours a week
                </text>
              </g>
              <Count
                values={["2", "4", "6"]}
                at={TYPE_AT.map((t) => t + 0.7)}
                x={tall ? 916 : sx + 26}
                y={tall ? sy + 122 : sy + 178}
                size={tall ? 120 : 112}
                cls={`t-disp ${tall ? "t-right" : "t-left"}`}
                b={b}
              />
            </g>
            {/* Then once: one entry, and all three fill in on their own. */}
            <g {...b("fade", ONE + 0.2, { len: 0.6 })}>
              <rect className="card card--deep s-gold-edge" x={sx} y={sy} width={sw} height={sh} rx="20" />
              <text className="t-small t-gold-text t-left" x={tall ? 84 : sx + 28} y={tall ? sy + 62 : sy + 50} fontSize={tall ? 26 : 18}>
                One entry
              </text>
              {!tall && (
                <text className="t-faint t-left" x={sx + 28} y={sy + 196} fontSize={20}>
                  Thu 10am
                </text>
              )}
            </g>
            <text className="t-disp t-gold t-left" x={tall ? 84 : sx + 26} y={tall ? sy + 122 : sy + 150} fontSize={tall ? 52 : 36}>
              <Typed text={tall ? `${CALLER.name} · Thu 10am` : CALLER.name} at={ONE + 0.45} b={b} step={0.04} />
            </text>
            {W.ys.map((y) => (
              <Gold key={y} d={feed(y)} fx={b("draw", 5.1, { len: 0.5 })} thin />
            ))}
            {W.ys.map((y, i) => (
              <g key={y}>
                <g {...b("fade", FILL_AT + i * 0.1, { len: 0.3 })}>
                  <AppFields i={i} W={W} wy={y} b={b} typed={false} />
                </g>
                <g {...b("pop", FILL_AT + 0.3 + i * 0.1, { len: 0.4 })}>
                  <Tick cx={W.x + W.w - 30 * W.k} cy={y + W.bar / 2} r={15 * W.k} />
                </g>
              </g>
            ))}
          </Art>
        </Stage>

        {/* And a tool built around how they work: an orthodontist's consult, recorded and written up. The gold sketch of it gives way to the real tool, Clinical Scribe. */}
        <Stage b={b} from={TOOL}>
          <Art tall={tall}>
            <text x="500" y={T.title} fontSize={T.size} {...b("rise", TOOL, { len: 1.2, cls: "t-disp" })}>
              Custom tools
            </text>
          </Art>
          <div {...b("rise", 7.2, { len: 1.1, cls: "film-layer" })}>
            <Art tall={tall}>
              <rect className="card card--deep" x={wx} y={wy} width={ww} height={wh} rx="22" />
              <path className="s-soft" d={`M ${wx} ${wy + T.bar} H ${wx + ww}`} />
              <text className="t-body t-left" x={wx + 36} y={wy + T.bar * 0.66} fontSize={tall ? 34 : 30}>
                Consult notes
              </text>
              <g {...b("blink", 7.5, { len: 1.2, n: 4 })}>
                <circle className="f-gold" cx={wx + ww - T.rec} cy={wy + T.bar / 2} r="9" />
              </g>
              <text className="t-small t-left" x={wx + ww - T.rec + 22} y={wy + T.bar * 0.62} fontSize={tall ? 26 : 22}>
                Recording
              </text>
              <g {...b("out", 8.2, { len: 0.8 })}>
                {WAVE.map((h, i) => (
                  <path key={i} d={`M ${waveX(i)} ${waveY - (h * waveK) / 2} V ${waveY + (h * waveK) / 2}`} {...b("tall", 7.4 + i * 0.022, { len: 0.4, cls: "g-core thin" })} />
                ))}
                {[0, 1, 2, 3].map((i) => (
                  <path
                    key={i}
                    d={`M ${wx + 70} ${waveY + (tall ? 170 : 130) + i * (tall ? 70 : 52)} H ${wx + ww - 70 - i * 80}`}
                    {...b("grow", 7.65 + i * 0.12, { len: 0.5, cls: "s-gold thick" })}
                  />
                ))}
              </g>
            </Art>
            <Clip id="clinical" tall={tall} box={body} fx={b("fade", 8.2, { len: 0.8 })} top />
            <Art tall={tall}>
              <rect className="s-gold-edge" fill="none" x={wx} y={wy} width={ww} height={wh} rx="22" />
              <g {...b("pop", 10.5, { len: 0.7 })}>
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
        </Stage>
      </>
    ),
  };
}

const WAVE = [22, 48, 30, 70, 44, 90, 56, 34, 80, 62, 40, 96, 52, 28, 74, 58, 36, 86, 46, 64, 30, 78, 50, 38, 68, 26];

/* ── Photo & video: the vineyard drawn in gold, then filmed ────────────── */

function Photo(tall: boolean): SceneArt {
  const D = DESIGN.photo;
  const b = beats(D);
  const rows = [-300, -200, -100, 0, 100, 200, 300];
  const T = tall ? { title: 122, size: 92 } : { title: 150, size: 88 };
  // The viewfinder, and the footage inside it: our drone footage for Pearls.
  const V = tall
    ? { c: [40, 190, 960, 1030], clip: [60, 210, 880, 800] as Box, rec: [100, 262], hill: "M 60 640 C 260 520, 420 590, 540 560 S 800 500, 940 580", sun: [720, 430, 66], row: [640, 1000], focus: [410, 690, 180, 140] }
    : { c: [70, 210, 930, 820], clip: [90, 230, 820, 570] as Box, rec: [132, 272], hill: "M 90 560 C 260 450, 400 510, 520 480 S 800 420, 910 500", sun: [720, 380, 58], row: [560, 800], focus: [420, 600, 160, 120] };
  const [c0, c1, c2, c3] = V.c;
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
          <g {...b("out", 1.2, { len: 0.8 })}>
            <path pathLength={1} d={V.hill} {...b("draw", 0.2, { len: 1, cls: "s-paper-soft" })} />
            <Gold d={ring(V.sun[0], V.sun[1], V.sun[2])} fx={b("draw", 0.3, { len: 0.9 })} />
            {rows.map((dx, i) => (
              <Gold key={dx} d={`M ${500 + dx * 0.12} ${V.row[0]} L ${500 + dx * 1.45} ${V.row[1]}`} fx={b("draw", 0.35 + i * 0.07, { len: 0.8 })} thin />
            ))}
          </g>
        </Art>
        <Clip id="pearls" tall={tall} box={V.clip} fx={b("fade", 1.2, { len: 0.8 })} />
        <Art tall={tall}>
          <path d={`M ${c0} ${c1 + 60} V ${c1} H ${c0 + 70} M ${c2 - 70} ${c1} H ${c2} V ${c1 + 60} M ${c2} ${c3 - 60} V ${c3} H ${c2 - 70} M ${c0 + 70} ${c3} H ${c0} V ${c3 - 60}`} {...b("fade", 0.2, { cls: "s-paper thick-ish" })} />
          <g {...b("blink", 0.6, { len: 0.8, n: 4 })}>
            <circle className="f-gold" cx={V.rec[0]} cy={V.rec[1]} r={tall ? 13 : 12} />
          </g>
          <text x={V.rec[0] + 24} y={V.rec[1] + 10} fontSize={tall ? 32 : 28} {...b("fade", 0.6, { cls: "t-small t-left t-on-film" })}>
            Rec
          </text>
          <g {...b("focus", 1.7, { len: 0.9 })}>
            <rect className="s-paper" x={V.focus[0]} y={V.focus[1]} width={V.focus[2]} height={V.focus[3]} />
          </g>
        </Art>
      </>
    ),
  };
}

/* ── The plan: the page they'd get after the first call ────────────────── */

/** The five things from the film, as the plan has them: what, and a line of what that means. */
const PLAN = [
  ["Get found on Google and in AI search", "At the top of search, and in AI answers"],
  ["A new site", "Clear, quick and easy to use"],
  ["Book online", "Tastings booked in a click, confirmed"],
  ["Every call answered", "Booked in and followed up"],
  ["One entry, no double work", "Typed once, filled in everywhere"],
];
const PAGE_WIDE = {
  page: [190, 40, 620, 790] as Box, m: 52, mark: [104, 24], date: 16, rule: 128, title: [196, 46], by: [228, 17],
  items: [290, 84], indent: 48, num: 24, what: 21, why: [17, 27], tick: [-16, -7, 15], line: 46, sep: 684,
  field: { label: 718, size: 13, y: 732, h: 24, w: 230, dx: 286 }, foot: [802, 14],
};
const PAGE_TALL = {
  page: [50, 30, 900, 1040] as Box, m: 60, mark: [106, 34], date: 24, rule: 140, title: [220, 62], by: [262, 26],
  items: [350, 118], indent: 66, num: 34, what: 31, why: [28, 40], tick: [-24, -10, 22], line: 70, sep: 914,
  field: { label: 956, size: 22, y: 974, h: 34, w: 370, dx: 410 }, foot: [1050, 22],
};

function Plan(tall: boolean): SceneArt {
  const D = DESIGN.plan;
  const b = beats(D);
  const P = tall ? PAGE_TALL : PAGE_WIDE;
  const [x, y, w, h] = P.page;
  const l = x + P.m;
  const r = x + w - P.m;
  const F = P.field;
  const itemY = (i: number) => P.items[0] + i * P.items[1];
  const tick = (i: number) => ({ cx: r + P.tick[0], cy: itemY(i) + P.tick[1], r: P.tick[2] });
  // Ticked in turn, as she runs through it.
  const TICK = [2, 2.75, 3.5, 4.25, 5];
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
              Plan for Your winery
            </text>
            <text className="t-ink-soft t-left" x={l} y={P.by[0]} fontSize={P.by[1]}>
              Prepared by Ashan &amp; Jordan, after your first call
            </text>
            {/* The five things, in order. */}
            {PLAN.map(([what, why], i) => (
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
                {i < PLAN.length - 1 && <path className="s-ink-line" d={`M ${l} ${itemY(i) + P.line} H ${r}`} />}
                <circle className="s-ink-line" fill="none" {...tick(i)} />
              </g>
            ))}
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
          {PLAN.map(([what], i) => (
            <g key={what} {...b("pop", TICK[i], { len: 0.5 })}>
              <Tick {...tick(i)} />
            </g>
          ))}
          {/* The two fields, lit as she says how long it takes. */}
          <g {...b("fade", 6.2, { len: 0.8 })}>
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

function Close(tall: boolean): SceneArt {
  const D = DESIGN.close;
  const b = beats(D);
  const ry = tall ? 540 : 470;
  const rx = tall ? 240 : 200;
  return {
    far: (
      <Far>
        <Glow id="far-close-glow" cx={50} cy={44} r={50} o={0.22} color="#E8C27A" />
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
    near: <i {...b("sweep", 1.4, { len: 2, cls: "film-sweep" })} />,
  };
}

/** Each scene's pictures, tall for a phone upright. */
export const SCENE_ART: Record<SceneId, (tall: boolean) => SceneArt> = {
  elora: Elora,
  call: Call,
  found: Found,
  site: Site,
  booking: Booking,
  calls: Calls,
  office: Office,
  photo: Photo,
  plan: Plan,
  close: Close,
};

/**
 * How the camera moves through each scene: the set's drift (x, y, a share of
 * it), its push (scale from, to) and its turn; the backdrop drifts less. On a
 * phone upright the push is halved (film.css, --zk), so the set's edges stay
 * on screen.
 */
export const CAMERA: Record<SceneId, { px: string; py: string; z0: number; z1: number; ry: string }> = {
  elora: { px: "0%", py: "-1.2%", z0: 1.02, z1: 1.1, ry: "0deg" },
  call: { px: "-1.6%", py: "0%", z0: 1.02, z1: 1.07, ry: "5deg" },
  found: { px: "-1%", py: "0%", z0: 1.02, z1: 1.06, ry: "2deg" },
  site: { px: "0%", py: "-0.8%", z0: 1, z1: 1.05, ry: "0deg" },
  booking: { px: "1%", py: "0%", z0: 1.02, z1: 1.06, ry: "-2deg" },
  calls: { px: "-1%", py: "0.5%", z0: 1.02, z1: 1.06, ry: "2deg" },
  office: { px: "1%", py: "0%", z0: 1.02, z1: 1.05, ry: "-2deg" },
  photo: { px: "0%", py: "0%", z0: 1.02, z1: 1.06, ry: "0deg" },
  plan: { px: "0%", py: "-1.2%", z0: 1.06, z1: 1, ry: "0deg" },
  close: { px: "0%", py: "-2%", z0: 1.1, z1: 1, ry: "0deg" },
};
