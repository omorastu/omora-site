import type { CSSProperties, ReactNode } from "react";
import type { SceneId } from "@/components/elorro/film/script";

/**
 * The film's pictures. Each scene fills the frame in three layers, which the
 * camera moves at different speeds (film.css, "camera"), so they read as
 * depth:
 * - far: the backdrop, edge to edge, all soft light: gradients only, no blur
 *   filters (they're costly on a phone);
 * - mid: the scene itself, on a square set as big as the screen's short side,
 *   its big words in HTML so a shine can cross them like the logo's;
 * - near: out-of-focus gold, drifting past.
 *
 * Every move is a CSS animation on the film's one clock (film.tsx): a beat is
 * an effect starting a share of the way into its scene, worked out from the
 * scene's designed length (DESIGN), so a scene timed longer or shorter in
 * script.ts keeps its choreography in step. A thing that moves never carries
 * a transform attribute of its own: its effect goes on a wrapping <g>.
 *
 * A gold thread runs through it: the rule under the logo, the call, the
 * tangle pulled straight into the plan, the rule under the two of them.
 * The two businesses are the ones Elorro works for: a winery and an
 * orthodontist. The winery is the one followed onto its website.
 */

/** Each scene's length as designed, in seconds: its beats are shares of it. */
export const DESIGN: Record<SceneId, number> = { elora: 9, call: 9.5, problem: 16, plan: 9.5, web: 14.5, more: 15.5, close: 10.5 };

type Vars = CSSProperties & Record<`--${string}`, string | number>;
type Opts = { len?: number; n?: number; dx?: number; dy?: number; cls?: string };
type Beat = { className: string; style: Vars };
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
/** A circle as a path, so it can be drawn on (pathLength 1). */
const ring = (cx: number, cy: number, r: number) => `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`;
const HANDSET = "q 10 -18 22 -6 l 8 8 q 6 8 -2 16 q 10 18 26 26 q 8 -8 16 -2 l 8 8 q 12 12 -6 22 q -38 6 -72 -72 z";
const STAR = "l 5.5 11 l 12 1.6 l -8.8 8.6 l 2.4 12 l -11.1 -5.6 l -11.1 5.6 l 2.4 -12 l -8.8 -8.6 l 12 -1.6 z";

function Art({ children }: { children: ReactNode }) {
  return (
    <svg className="film-art" viewBox="0 0 1000 1000" aria-hidden="true" focusable="false">
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

/** A big word, in HTML on the set: `x`, `y` in % of the set, `size` a share of its side. */
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

/* ── 0. Elora ──────────────────────────────────────────────────────────── */

function Elora(): SceneArt {
  const D = DESIGN.elora;
  const b = beats(D);
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
        <Art>
          <g {...b("out", 1.6, { len: 1 })}>
            <Gold d="M 500 590 H 250" fx={b("draw", 0.8, { len: 1.3 })} />
            <Gold d="M 500 590 H 750" fx={b("draw", 0.8, { len: 1.3 })} />
          </g>
        </Art>
        <div {...b("out", 7.5, { len: 0.8, cls: "film-out" })}>
          <Word x={50} y={71} size={0.11} rise={1.9} shine={2.6} D={D}>
            Elora
          </Word>
          <Word x={50} y={78.5} size={0.03} tone="label" rise={2.6} D={D}>
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

function Call(): SceneArt {
  const D = DESIGN.call;
  const b = beats(D);
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
        <Word x={50} y={15} size={0.11} rise={5.0} shine={5.7} D={D}>
          Listen.
        </Word>
        <Art>
          <defs>
            <clipPath id="film-call-line">
              <rect x="402" y="440" width="196" height="120" />
            </clipPath>
          </defs>
          {/* You. */}
          <path pathLength={1} d={ring(250, 500, 150)} {...b("draw", 0.2, { len: 1.3, cls: "s-paper-soft" })} />
          <g {...b("fade", 0.6, { len: 1 })}>
            <g transform="translate(250 500) scale(1.7) translate(-250 -470)">
              <path className="s-paper" d="M 196 446 H 304 L 296 418 H 204 Z M 196 446 q 9 14 18 0 q 9 14 18 0 q 9 14 18 0 q 9 14 18 0 q 9 14 18 0 q 9 14 18 0" />
              <path className="s-paper" d="M 206 458 V 522 H 294 V 458 M 234 522 V 486 H 262 V 522" />
            </g>
          </g>
          <text x="250" y="720" fontSize="30" {...b("fade", 0.8, { cls: "t-small" })}>
            You
          </text>
          {/* The two of them. */}
          <Gold d={ring(750, 500, 150)} fx={b("draw", 0.5, { len: 1.4 })} />
          <g {...b("fade", 1, { len: 1 })}>
            <text className="t-disp" x="750" y="534" fontSize="104">
              A <tspan className="t-gold">&amp;</tspan> J
            </text>
          </g>
          <text x="750" y="720" fontSize="30" {...b("fade", 1.2, { cls: "t-small" })}>
            Ashan &amp; Jordan
          </text>
          {/* The call, and your voice coming down it. */}
          <Gold d="M 402 500 H 598" fx={b("draw", 0.9, { len: 1 })} />
          <g clipPath="url(#film-call-line)">
            <g {...b("fade", 2.9, { len: 0.5 })}>
              <g {...b("out", 7.6, { len: 0.6 })}>
                <path d={wave(250, 660, 500, 30, 72)} {...b("flow", 2.9, { len: 0.75, n: 6, dx: 72, cls: "g-glow thin" })} />
                <path d={wave(250, 660, 500, 30, 72)} {...b("flow", 2.9, { len: 0.75, n: 6, dx: 72, cls: "g-core thin" })} />
              </g>
            </g>
          </g>
          {/* And they listen. */}
          <circle cx="750" cy="500" r="150" {...b("ring", 3.3, { len: 1.6, n: 3, cls: "s-gold-thin" })} />
          <circle cx="750" cy="500" r="150" {...b("ring", 3.8, { len: 1.6, n: 3, cls: "s-gold-thin" })} />
        </Art>
      </>
    ),
    near: <Bokeh dots={NEAR_B} />,
  };
}

/* ── 2. What's really going on: three panels, the camera moving across ─── */

/** A day's bookings at one business, two of them in the same hour. */
function Booked({ x, title, hours, a, b2, fx, t0 }: { x: number; title: string; hours: string[]; a: string; b2: string; fx: Beats; t0: number }) {
  return (
    <g {...fx("rise", t0, { len: 1 })}>
      <g transform={`translate(${x} 180)`}>
        <rect className="card" width="400" height="540" rx="26" />
        <text className="t-small t-gold-text t-left" x="32" y="68" fontSize="26">
          {title}
        </text>
        {hours.map((h, i) => (
          <g key={h}>
            <text className="t-faint t-left" x="34" y={168 + i * 120} fontSize="28">
              {h}
            </text>
            <path className="s-soft" d={`M 112 ${178 + i * 120} H 372`} />
          </g>
        ))}
      </g>
      <g {...fx("rise", t0 + 1, { len: 0.8 })}>
        <g transform={`translate(${x} 180)`}>
          <rect className="chip" x="112" y="190" width="260" height="66" rx="12" />
          <text className="t-ink t-left" x="132" y="233" fontSize="28">
            {a}
          </text>
        </g>
      </g>
      <g {...fx("rise", t0 + 2.4, { len: 0.8 })}>
        <g transform={`translate(${x} 180)`}>
          <rect className="chip chip--clash" x="96" y="244" width="260" height="66" rx="12" />
          <text className="t-gold-text t-left" x="116" y="287" fontSize="28">
            {b2}
          </text>
        </g>
      </g>
      <g {...fx("pop", t0 + 3.2, { len: 0.6 })}>
        <g transform={`translate(${x} 180)`}>
          <circle className="f-gold" cx="366" cy="250" r="34" />
          <text className="t-ink t-strong" x="366" y="261" fontSize="30">
            ×2
          </text>
        </g>
      </g>
    </g>
  );
}

function Problem(): SceneArt {
  const D = DESIGN.problem;
  const b = beats(D);
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
        {/* A tasting and a consult, each booked twice. */}
        <div {...b("panelA1", 0, { cls: "film-panel" })}>
          <Art>
            <Booked x={70} title="Winery · Sat" hours={["1pm", "2pm", "3pm"]} a="Tasting · 6 guests" b2="Tasting · 4 guests" fx={b} t0={0.9} />
            <Booked x={530} title="Orthodontist · Tue" hours={["8am", "9am", "10am"]} a="Consult · Ana" b2="Consult · Ben" fx={b} t0={1.5} />
          </Art>
        </div>
        {/* The front desk, too busy to answer. */}
        <div {...b("panelA2", 0, { cls: "film-panel" })}>
          <Art>
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
          </Art>
        </div>
        {/* Two good businesses, on page two. */}
        <div {...b("panelA3", 0, { cls: "film-panel" })}>
          <Art>
            {[
              { y: 90, q: "winery napa", you: "Your winery", t: 10.6 },
              { y: 450, q: "orthodontist san ramon", you: "Your practice", t: 12.3 },
            ].map(({ y, q, you, t }) => (
              <g key={q}>
                <g {...b("rise", t - 0.2, { len: 0.8 })}>
                  <rect className="card s-paper-soft" x="70" y={y} width="860" height="88" rx="44" />
                  <path className="s-paper" d={`${ring(130, y + 42, 15)} M 141 ${y + 54} L 156 ${y + 69}`} />
                </g>
                <text className="t-body t-left" x="180" y={y + 58} fontSize="42">
                  {[...q].map((ch, i) => (
                    <tspan key={i} {...b("fade", t + i * 0.05, { len: 0.1 })}>
                      {ch}
                    </tspan>
                  ))}
                </text>
                {[0, 1].map((i) => (
                  <g key={i} {...b("rise", t + 1 + i * 0.15, { len: 0.7 })}>
                    <path className="s-dim thick" d={`M 90 ${y + 140 + i * 62} H ${520 - i * 60}`} />
                    <path className="s-soft" d={`M 90 ${y + 170 + i * 62} H ${840 - i * 40}`} />
                  </g>
                ))}
                <g {...b("fade", t + 1.5, { len: 1 })}>
                  <rect className="s-gold-faint" x="70" y={y + 240} width="860" height="66" rx="14" />
                  <text className="t-gold-text t-left" x="100" y={y + 284} fontSize="32">
                    {you}
                  </text>
                  <text className="t-small t-right" x="900" y={y + 284} fontSize="26">
                    Page 2
                  </text>
                </g>
              </g>
            ))}
          </Art>
        </div>
      </div>
    ),
    near: <Bokeh dots={NEAR_A} />,
  };
}

/* ── 3. Sorting it out ─────────────────────────────────────────────────── */

function Plan(): SceneArt {
  const D = DESIGN.plan;
  const b = beats(D);
  const small = (x: number, title: string, chip: string) => (
    <g transform={`translate(${x} 110)`}>
      <rect className="card" width="330" height="230" rx="20" />
      <text className="t-small t-gold-text t-left" x="26" y="52" fontSize="24">
        {title}
      </text>
      <rect className="chip" x="26" y="92" width="278" height="64" rx="10" />
      <text className="t-ink t-left" x="44" y="134" fontSize="26">
        {chip}
      </text>
    </g>
  );
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
        <g {...b("fade", 2.6, { len: 2.4 })}>
          {[260, 620, 980, 1300].map((x, i) => (
            <path key={x} d={`M ${x} -100 l 220 0 l ${-260 - i * 40} 1200 l -220 0 z`} fill="url(#far-plan-ray)" />
          ))}
          <rect width="1600" height="1000" fill="url(#far-plan-glow)" />
        </g>
      </Far>
    ),
    mid: (
      <Art>
        {/* Two calendars become one. */}
        <g {...b("out", 2.2, { len: 0.6 })}>
          <g {...b("moveto", 0.8, { len: 1.5, dx: 165 })}>{small(40, "Winery", "Tasting · Sat 2pm")}</g>
          <g {...b("moveto", 0.8, { len: 1.5, dx: -165 })}>{small(630, "Orthodontist", "Consult · Tue 9am")}</g>
        </g>
        <g {...b("out", 3.6, { len: 0.7 })}>
          <g {...b("pop", 2.1, { len: 0.8 })}>
            <g transform="translate(300 80)">
              <rect className="card s-gold-edge" width="400" height="300" rx="22" />
              <text className="t-small t-gold-text t-left" x="30" y="58" fontSize="26">
                One calendar
              </text>
              <rect className="chip" x="30" y="96" width="340" height="68" rx="10" />
              <text className="t-ink t-left" x="50" y="141" fontSize="28">
                Tasting · Sat 2pm
              </text>
              <rect className="chip chip--paper" x="30" y="184" width="340" height="68" rx="10" />
              <text className="t-ink t-left" x="50" y="229" fontSize="28">
                Consult · Tue 9am
              </text>
            </g>
          </g>
          <g {...b("pop", 2.7, { len: 0.6 })}>
            <circle className="f-gold" cx="690" cy="92" r="32" />
            <path className="s-ink" d="M 675 93 l 10 10 l 21 -22" />
          </g>
          {/* The tangle, pulled straight. */}
          <Gold
            d="M 120 560 C 200 420, 330 700, 400 520 S 600 400, 560 600 S 300 660, 420 480 S 760 520, 660 640 S 420 720, 520 520 S 760 440, 880 560"
            fx={b("undraw", 1.2, { len: 1.8 })}
          />
          <Gold d="M 500 580 H 130" fx={b("draw", 1.6, { len: 1.6 })} />
          <Gold d="M 500 580 H 870" fx={b("draw", 1.6, { len: 1.6 })} />
        </g>
        {/* The plan, on one page. */}
        <g {...b("rise", 3.9, { len: 1.3 })}>
          <rect className="page" x="200" y="110" width="600" height="700" rx="16" />
          <text className="t-disp t-ink" x="500" y="236" fontSize="80">
            The plan
          </text>
          <path className="s-ink-soft" d="M 260 280 H 740" />
        </g>
        {["One calendar", "Every call answered", "Found on Google"].map((item, i) => (
          <g key={item} {...b("rise", 4.7 + i * 0.6, { len: 0.9 })}>
            <text className="t-disp t-gold-deep t-left" x="262" y={404 + i * 128} fontSize="76">
              {i + 1}
            </text>
            <text className="t-ink t-left" x="330" y={394 + i * 128} fontSize="42">
              {item}
            </text>
          </g>
        ))}
      </Art>
    ),
    near: (
      <>
        <Bokeh dots={NEAR_B} />
        <i {...b("sweep", 2.4, { len: 1.8, cls: "film-sweep" })} />
      </>
    ),
  };
}

/* ── 4. Websites & getting found: the winery ───────────────────────────── */

const QUERY = "winery napa";

function Web(): SceneArt {
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
    mid: (
      <Art>
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
    ),
    near: <Bokeh dots={NEAR_A} />,
  };
}

/* ── 5. And the rest: three panels, panned across ──────────────────────── */

const WAVE = [22, 48, 30, 70, 44, 90, 56, 34, 80, 62, 40, 96, 52, 28, 74, 58, 36, 86, 46, 64, 30, 78, 50, 38, 68, 26];

function More(): SceneArt {
  const D = DESIGN.more;
  const b = beats(D);
  const rows = [-300, -200, -100, 0, 100, 200, 300];
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
        {/* Custom tools: an orthodontist's consult, written up as it's spoken. */}
        <div {...b("panel1", 0, { cls: "film-panel" })}>
          <Art>
            <text x="500" y="150" fontSize="88" {...b("rise", 0.4, { len: 1.2, cls: "t-disp" })}>
              Custom tools
            </text>
            <g {...b("rise", 0.8, { len: 1.1 })}>
              <rect className="card card--deep s-paper-soft" x="70" y="210" width="860" height="600" rx="22" />
              <path className="s-soft" d="M 300 210 V 810" />
              <text className="t-small t-gold-text t-left" x="102" y="268" fontSize="24">
                Patients
              </text>
              <rect className="f-gold-dim" x="88" y="294" width="196" height="56" rx="8" />
              <path className="s-dim thick" d="M 108 322 H 250 M 108 398 H 230 M 108 466 H 254 M 108 534 H 214" />
              <text className="t-body t-left" x="334" y="268" fontSize="32">
                Consult notes
              </text>
            </g>
            {WAVE.map((h, i) => (
              <path key={i} d={`M ${340 + i * 21} ${350 - h / 2} V ${350 + h / 2}`} {...b("tall", 1.3 + i * 0.045, { len: 0.4, cls: "g-core thin" })} />
            ))}
            {[0, 1, 2, 3].map((i) => (
              <path key={i} d={`M 340 ${450 + i * 54} H ${880 - i * 80}`} {...b("grow", 2.6 + i * 0.3, { len: 0.6, cls: "s-gold thick" })} />
            ))}
            <g {...b("pop", 4, { len: 0.7 })}>
              <rect className="f-gold-v" x="340" y="696" width="320" height="76" rx="10" />
              <text className="t-ink t-caps" x="500" y="744" fontSize="24">
                Letter drafted
              </text>
              <circle className="f-paper" cx="690" cy="734" r="28" />
              <path className="s-ink" d="M 676 735 l 9 9 l 19 -20" />
            </g>
          </Art>
        </div>
        {/* Photo & video: the vineyard at dawn, through the viewfinder. */}
        <div {...b("panel2", 0, { cls: "film-panel" })}>
          <Art>
            <text x="500" y="150" fontSize="88" {...b("rise", 5.6, { len: 1.2, cls: "t-disp" })}>
              Photo &amp; video
            </text>
            <path d="M 70 270 V 210 H 140 M 860 210 H 930 V 270 M 930 760 V 820 H 860 M 140 820 H 70 V 760" {...b("fade", 5.6, { cls: "s-paper thick-ish" })} />
            <g {...b("blink", 6, { len: 0.8, n: 4 })}>
              <circle className="f-gold" cx="132" cy="272" r="12" />
            </g>
            <text x="156" y="282" fontSize="28" {...b("fade", 6, { cls: "t-small t-left" })}>
              Rec
            </text>
            <path pathLength={1} d="M 90 560 C 260 450, 400 510, 520 480 S 800 420, 910 500" {...b("draw", 5.7, { len: 1.4, cls: "s-paper-soft" })} />
            <Gold d={ring(720, 380, 58)} fx={b("draw", 5.9, { len: 1.2 })} />
            {rows.map((dx, i) => (
              <Gold key={dx} d={`M ${500 + dx * 0.12} 560 L ${500 + dx * 1.45} 800`} fx={b("draw", 6 + i * 0.12, { len: 1 })} thin />
            ))}
            <g {...b("focus", 6.8, { len: 0.9 })}>
              <rect className="s-paper" x="420" y="600" width="160" height="120" />
            </g>
          </Art>
        </div>
        {/* Phones, booking and follow-up: the orthodontist's front desk, handled. */}
        <div {...b("panel3", 0, { cls: "film-panel" })}>
          <Art>
            <text x="500" y="150" fontSize="80" {...b("rise", 9.2, { len: 1.2, cls: "t-disp" })}>
              Phones &amp; booking
            </text>
            <g {...b("shake", 9.5, { len: 0.6, n: 2 })}>
              <rect className="card s-paper-soft" x="70" y="230" width="290" height="560" rx="44" />
              <g transform="translate(215 470) scale(1.9) translate(-300 -486)">
                <path className="s-paper" d={`M 262 450 ${HANDSET}`} />
              </g>
            </g>
            <g {...b("pop", 10.5, { len: 0.6 })}>
              <rect className="f-gold-v" x="94" y="660" width="242" height="70" rx="35" />
              <text className="t-ink t-caps" x="215" y="705" fontSize="24">
                Answered
              </text>
            </g>
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
            <text x="464" y="383" fontSize="30" {...b("fade", 12, { cls: "t-ink t-left" })}>
              Consult · 10am
            </text>
            <g {...b("rise", 12.6, { len: 0.9 })}>
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
        </div>
      </div>
    ),
    near: <Bokeh dots={NEAR_B} />,
  };
}

/* ── 6. One plan ───────────────────────────────────────────────────────── */

function Close(): SceneArt {
  const D = DESIGN.close;
  const b = beats(D);
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
        <Word x={50} y={37} size={0.22} tone="paper" rise={0.2} shine={0.9} D={D}>
          A <span className="film-amp">&amp;</span> J
        </Word>
        <Art>
          <Gold d="M 500 510 H 300" fx={b("draw", 0.9, { len: 1.4 })} />
          <Gold d="M 500 510 H 700" fx={b("draw", 0.9, { len: 1.4 })} />
        </Art>
        <Word x={50} y={63} size={0.115} rise={1.1} shine={2} D={D}>
          One plan.
        </Word>
        <Word x={50} y={72.5} size={0.04} tone="note" rise={3.7} D={D}>
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

export const SCENE_ART: Record<SceneId, () => SceneArt> = {
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
 * front drift further (nx, ny, in screen units), the backdrop less.
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
