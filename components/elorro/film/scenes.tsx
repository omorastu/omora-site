import type { CSSProperties } from "react";
import type { SceneId } from "@/components/elorro/film/script";

/**
 * The film's pictures, one per scene, each drawn on a 1000 × 1000 set that
 * scales with the screen (film.css, "the set"). Everything moves by CSS
 * animations on the film's one clock (film.tsx): a beat is an effect (film.css,
 * "effects") starting a share of the way into its scene, so a scene made
 * longer or shorter in script.ts keeps its choreography in step. The shares
 * are worked out from the lengths each scene was designed at (DESIGN).
 *
 * A gold thread runs through it: Elora's rule under the logo, the call, the
 * tangle that pulls straight into the plan, the rule under the two of them.
 *
 * Each picture's resting state, with every effect done, is the scene as it
 * should read: under reduced motion that's what fades in (film.css).
 * An element that moves never carries a transform attribute of its own: its
 * effect goes on a wrapping <g>, its place on one inside.
 */

/** Each scene's length as designed, in seconds: its beats are shares of it. */
export const DESIGN: Record<SceneId, number> = { elora: 9, call: 9.5, problem: 14, plan: 9.5, web: 14.5, more: 15.5, close: 10.5 };

type Vars = CSSProperties & Record<`--${string}`, string | number>;
type Opts = { len?: number; n?: number; dx?: number; dy?: number; cls?: string };

/** An effect, `at` seconds into a scene designed `D` seconds long. */
const beats = (D: number) => (kind: string, at: number, o: Opts = {}) => {
  const style: Vars = { "--at": +(at / D).toFixed(4) };
  if (o.len) style["--len"] = `${o.len}s`;
  if (o.n) style["--n"] = o.n;
  if (o.dx !== undefined) style["--dx"] = `${o.dx}px`;
  if (o.dy !== undefined) style["--dy"] = `${o.dy}px`;
  return { className: `fx fx-${kind}${o.cls ? ` ${o.cls}` : ""}`, style };
};

/** A wave along y, from x0 to x1: `amp` high, one crest every `len`. */
const wave = (x0: number, x1: number, y: number, amp: number, len: number) => {
  let d = `M ${x0} ${y} Q ${x0 + len / 4} ${y - amp} ${x0 + len / 2} ${y}`;
  for (let x = x0 + len; x <= x1; x += len / 2) d += ` T ${x} ${y}`;
  return d;
};

/** A circle as a path, so it can be drawn on (pathLength 1). */
const ring = (cx: number, cy: number, r: number) => `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`;

function Art({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg className={`film-art${className ? ` ${className}` : ""}`} viewBox="0 0 1000 1000" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

/* ── 0. Elora ──────────────────────────────────────────────────────────── */

function Elora() {
  const b = beats(DESIGN.elora);
  return (
    <Art>
      <g {...b("rise", 0.4, { len: 1.8 })}>
        <g {...b("out", 7.9, { len: 1 })}>
          <image href="/m/brand/elorro-logo.png" x="220" y="290" width="560" height="95" />
        </g>
      </g>
      {/* The thread, drawn out from the middle. */}
      <path pathLength={1} d="M 500 470 H 290" {...b("draw", 1.3, { cls: "s-gold", len: 1.5 })} />
      <path pathLength={1} d="M 500 470 H 710" {...b("draw", 1.3, { cls: "s-gold", len: 1.5 })} />
      <g {...b("out", 7.9, { len: 1 })}>
        <text x="500" y="620" fontSize="112" {...b("rise", 1.8, { cls: "t-disp", len: 1.4 })}>
          Elora
        </text>
        <text x="500" y="690" fontSize="30" {...b("fade", 2.6, { cls: "t-small", len: 1.2 })}>
          Ashan &amp; Jordan’s assistant
        </text>
        {/* Her voice: a gold point that breathes while she speaks. */}
        <circle cx="500" cy="770" r="7" {...b("fade", 1.8, { cls: "f-gold" })} />
        <circle cx="500" cy="770" r="16" {...b("ring", 1.8, { cls: "s-gold-thin", len: 1.05, n: 3 })} />
        <circle cx="500" cy="770" r="16" {...b("ring", 5.6, { cls: "s-gold-thin", len: 0.85, n: 2 })} />
      </g>
    </Art>
  );
}

/* ── 1. The call ───────────────────────────────────────────────────────── */

function Call() {
  const b = beats(DESIGN.call);
  return (
    <Art>
      <defs>
        <clipPath id="film-call-line">
          <rect x="350" y="430" width="226" height="80" />
        </clipPath>
      </defs>
      <text x="500" y="200" fontSize="104" {...b("rise", 5.1, { cls: "t-disp", len: 1.6 })}>
        Listen.
      </text>
      {/* You: a shop front. */}
      <path pathLength={1} d={ring(250, 470, 98)} {...b("draw", 0.2, { cls: "s-line", len: 1.2 })} />
      <g {...b("fade", 0.6, { len: 1 })}>
        <path className="s-paper" d="M 196 446 H 304 L 296 418 H 204 Z M 196 446 q 9 14 18 0 q 9 14 18 0 q 9 14 18 0 q 9 14 18 0 q 9 14 18 0 q 9 14 18 0" />
        <path className="s-paper" d="M 206 458 V 522 H 294 V 458 M 234 522 V 486 H 262 V 522" />
      </g>
      <text x="250" y="625" fontSize="32" {...b("fade", 0.8, { cls: "t-small" })}>
        You
      </text>
      {/* The two of them. */}
      <path pathLength={1} d={ring(655, 470, 76)} {...b("draw", 0.5, { cls: "s-gold", len: 1.2 })} />
      <path pathLength={1} d={ring(812, 470, 76)} {...b("draw", 0.7, { cls: "s-gold", len: 1.2 })} />
      <g {...b("fade", 1, { len: 1 })}>
        <text className="t-disp" x="655" y="497" fontSize="80">A</text>
        <text className="t-disp" x="812" y="497" fontSize="80">J</text>
      </g>
      <text x="733" y="625" fontSize="32" {...b("fade", 1.2, { cls: "t-small" })}>
        Ashan &amp; Jordan
      </text>
      {/* The call, and your voice coming down it. */}
      <path pathLength={1} d="M 350 470 H 576" {...b("draw", 0.9, { cls: "s-gold", len: 1 })} />
      <g clipPath="url(#film-call-line)">
        <g {...b("fade", 2.9, { len: 0.5 })}>
          <g {...b("out", 7.6, { len: 0.6 })}>
            <path d={wave(250, 620, 470, 22, 60)} {...b("flow", 2.9, { cls: "s-gold-thin", len: 0.75, n: 6, dx: 60 })} />
          </g>
        </g>
      </g>
      {/* And they listen. */}
      <circle cx="655" cy="470" r="76" {...b("ring", 3.3, { cls: "s-gold-thin", len: 1.5, n: 3 })} />
      <circle cx="812" cy="470" r="76" {...b("ring", 3.6, { cls: "s-gold-thin", len: 1.5, n: 3 })} />
    </Art>
  );
}

/* ── 2. What's really going on ─────────────────────────────────────────── */

/** A calendar card with the one job on it, at its top left (x, y). */
function Card({ x, y, w, title }: { x: number; y: number; w: number; title: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect className="s-line f-card" width={w} height="250" rx="18" />
      <text className="t-small t-left" x="26" y="52" fontSize="26">
        {title}
      </text>
      <path className="s-soft" d={`M 26 82 H ${w - 26} M 26 146 H ${w - 26} M 26 210 H ${w - 26}`} />
      <rect className="f-gold" x="26" y="98" width={w - 52} height="56" rx="8" />
      <text className="t-ink t-left" x="44" y="136" fontSize="28">
        Kitchen · Tue 9am
      </text>
    </g>
  );
}

function Problem() {
  const b = beats(DESIGN.problem);
  return (
    <Art>
      {/* The same job, on two calendars. */}
      <g {...b("rise", 3.2, { len: 1 })}>
        <Card x={130} y={150} w={330} title="Calendar" />
      </g>
      <g {...b("rise", 3.6, { len: 1 })}>
        <Card x={540} y={150} w={330} title="Job sheet" />
      </g>
      <path d="M 430 276 C 470 236, 530 236, 570 276" {...b("fade", 4.6, { cls: "s-gold dashed", len: 0.8 })} />
      <g {...b("pop", 4.9, { len: 0.7 })}>
        <text className="t-gold" x="500" y="232" fontSize="44">×2</text>
      </g>

      {/* Calls nobody could answer. */}
      <g {...b("rise", 6.8, { len: 0.9 })}>
        <g {...b("shake", 7.1, { len: 0.7, n: 3 })}>
          <rect className="s-line" x="200" y="520" width="170" height="320" rx="28" />
          <path className="s-soft" d="M 250 548 H 320 M 228 590 H 342 M 228 760 H 342" />
          <path className="s-paper" d="M 262 650 q 10 -18 22 -6 l 8 8 q 6 8 -2 16 q 10 18 26 26 q 8 -8 16 -2 l 8 8 q 12 12 -6 22 q -38 6 -72 -72 z" />
        </g>
      </g>
      <g {...b("fade", 7, { len: 0.3 })}>
        <path d="M 398 590 q 20 30 0 60 M 420 572 q 34 48 0 96" {...b("blink", 7.1, { cls: "s-gold-thin", len: 0.7, n: 3 })} />
      </g>
      <g {...b("pop", 7.5, { len: 0.5 })}>
        <circle className="f-gold" cx="366" cy="528" r="30" />
      </g>
      {["1", "2", "3"].map((n, i) => (
        <g key={n} {...b("fade", 7.5 + i * 0.7, { len: 0.25 })}>
          {i < 2 && (
            <g {...b("out", 8.2 + i * 0.7, { len: 0.2 })}>
              <text className="t-ink t-num" x="366" y="540" fontSize="34">{n}</text>
            </g>
          )}
          {i === 2 && <text className="t-ink t-num" x="366" y="540" fontSize="34">{n}</text>}
        </g>
      ))}
      <text x="285" y="900" fontSize="30" {...b("fade", 8.9, { cls: "t-small" })}>
        Missed
      </text>

      {/* A good business, on page two. */}
      <g {...b("rise", 9.9, { len: 0.9 })}>
        <rect className="s-line" x="500" y="540" width="370" height="64" rx="32" />
        <path className="s-paper" d={`${ring(540, 570, 13)} M 550 580 L 562 592`} />
        <path className="s-soft" d="M 580 572 H 760" />
      </g>
      {[0, 1, 2].map((i) => (
        <g key={i} {...b("rise", 10.2 + i * 0.2, { len: 0.8 })}>
          <path className="s-dim thick" d={`M 510 ${648 + i * 70} H ${770 - i * 30}`} />
          <path className="s-soft" d={`M 510 ${676 + i * 70} H ${840 - i * 20}`} />
        </g>
      ))}
      <g {...b("fade", 11.1, { len: 1.2 })}>
        <rect className="s-gold-faint" x="500" y="862" width="370" height="76" rx="12" />
        <text className="t-gold t-left" x="522" y="912" fontSize="30">Your business</text>
        <text className="t-small t-right" x="852" y="912" fontSize="26">Page 2</text>
      </g>
    </Art>
  );
}

/* ── 3. Sorting it out ─────────────────────────────────────────────────── */

function Plan() {
  const b = beats(DESIGN.plan);
  return (
    <Art>
      {/* Two calendars become one. */}
      <g {...b("moveto", 0.9, { len: 1.6, dx: 205 })}>
        <Card x={130} y={40} w={330} title="Calendar" />
      </g>
      <g {...b("out", 2.3, { len: 0.6 })}>
        <g {...b("moveto", 0.9, { len: 1.6, dx: -205 })}>
          <Card x={540} y={40} w={330} title="Job sheet" />
        </g>
      </g>
      <g {...b("pop", 2.6, { len: 0.6 })}>
        <circle className="f-gold" cx="660" cy="50" r="26" />
        <path className="s-ink" d="M 648 51 l 9 9 l 16 -18" />
      </g>

      {/* The tangle, pulled straight. */}
      <path
       
        pathLength={1}
        d="M 240 400 C 300 300, 400 520, 450 380 S 610 300, 560 440 S 360 470, 440 350 S 700 380, 620 460 S 450 520, 520 390 S 700 330, 760 400"
        {...b("undraw", 1.2, { cls: "s-gold", len: 1.8 })}
      />
      <path pathLength={1} d="M 500 400 H 240" {...b("draw", 1.6, { cls: "s-gold", len: 1.6 })} />
      <path pathLength={1} d="M 500 400 H 760" {...b("draw", 1.6, { cls: "s-gold", len: 1.6 })} />

      {/* The plan, on one page. */}
      <g {...b("rise", 3.9, { len: 1.3 })}>
        <rect className="f-paper" x="250" y="460" width="500" height="460" rx="10" />
        <text className="t-disp t-ink" x="500" y="540" fontSize="52">The plan</text>
        <path className="s-ink-soft" d="M 300 572 H 700" />
      </g>
      {["One calendar", "Every call answered", "Found on Google"].map((item, i) => (
        <g key={item} {...b("rise", 4.7 + i * 0.6, { len: 0.9 })}>
          <text className="t-disp t-gold-deep t-left" x="300" y={660 + i * 84} fontSize="52">
            {i + 1}
          </text>
          <text className="t-ink t-left" x="350" y={654 + i * 84} fontSize="34">
            {item}
          </text>
        </g>
      ))}
    </Art>
  );
}

/* ── 4. Websites & getting found ───────────────────────────────────────── */

const QUERY = "kitchen remodel napa";

function Web() {
  const b = beats(DESIGN.web);
  /** Four results; yours starts at the foot and rises to the top, the rest stepping down one. */
  const others = [0, 1, 2, 3];
  return (
    <Art>
      <g {...b("out", 6.8, { len: 0.8 })}>
        <g {...b("rise", 0.3, { len: 1 })}>
          <rect className="s-line" x="130" y="120" width="740" height="84" rx="42" />
          <path className="s-paper" d={`${ring(184, 160, 15)} M 195 172 L 210 187`} />
        </g>
        <text className="t-body t-left" x="226" y="174" fontSize="38">
          {[...QUERY].map((ch, i) => (
            <tspan key={i} {...b("fade", 0.9 + i * 0.07, { len: 0.12 })}>
              {ch}
            </tspan>
          ))}
        </text>
        {others.map((i) => (
          <g key={i} {...b("slide", 3.7, { len: 1.3, dy: -116 })}>
            <g {...b("rise", 2.3 + i * 0.15, { len: 0.8 })}>
              <path className="s-dim thick" d={`M 150 ${386 + i * 116} H ${560 - i * 40}`} />
              <path className="s-soft" d={`M 150 ${420 + i * 116} H ${830 - i * 30}`} />
              <path className="s-soft" d={`M 150 ${448 + i * 116} H ${700 - i * 20}`} />
            </g>
          </g>
        ))}
        <g {...b("slide", 3.6, { len: 1.5, dy: 464 })}>
          <g {...b("glow", 3.6, { len: 1.5 })}>
            <rect className="s-gold f-glow" x="130" y="236" width="740" height="122" rx="16" />
            <text className="t-gold t-left" x="160" y="290" fontSize="38">Your business</text>
            <g className="f-gold">
              {[0, 1, 2, 3, 4].map((s) => (
                <path key={s} d={`M ${168 + s * 28} 318 l 5.5 11 l 12 1.6 l -8.8 8.6 l 2.4 12 l -11.1 -5.6 l -11.1 5.6 l 2.4 -12 l -8.8 -8.6 l 12 -1.6 z`} />
              ))}
            </g>
            <text className="t-small t-left" x="318" y="342" fontSize="26">Napa · Open now</text>
          </g>
        </g>
      </g>

      {/* The top result opens into the site, which puts itself together. */}
      <g {...b("open", 7, { len: 1.2 })}>
        <rect className="s-line f-site" x="110" y="120" width="780" height="760" rx="20" />
        <path className="s-soft" d="M 110 186 H 890" />
        <g className="f-dim">
          <circle cx="150" cy="153" r="8" />
          <circle cx="178" cy="153" r="8" />
          <circle cx="206" cy="153" r="8" />
        </g>
      </g>
      <g {...b("fade", 7.8, { len: 0.7 })}>
        <text className="t-disp t-left" x="160" y="262" fontSize="40">Your business</text>
        <path className="s-soft thick" d="M 610 248 H 680 M 710 248 H 780 M 810 248 H 850" />
      </g>
      <g {...b("rise", 8.2, { len: 0.9 })}>
        <text className="t-disp t-left" x="160" y="380" fontSize="60">Kitchens,</text>
        <text className="t-disp t-left" x="160" y="446" fontSize="60">done right.</text>
        <path className="s-soft" d="M 160 494 H 450 M 160 526 H 400" />
      </g>
      <g {...b("rise", 8.6, { len: 1 })}>
        <rect className="f-gold-dim" x="520" y="320" width="320" height="260" rx="10" />
        <path className="s-gold" d="M 560 540 H 800 M 590 540 V 470 H 770 V 540 M 640 380 V 420 M 620 420 H 660 M 740 380 V 420 M 720 420 H 760" />
      </g>
      <g {...b("press", 10.3, { len: 0.5 })}>
        <g {...b("pop", 9, { len: 0.7 })}>
          <rect className="f-gold" x="160" y="566" width="270" height="72" rx="6" />
          <text className="t-ink t-caps" x="295" y="612" fontSize="26">Book a visit</text>
        </g>
      </g>
      {[0, 1, 2].map((i) => (
        <g key={i} {...b("rise", 9.4 + i * 0.2, { len: 0.8 })}>
          <rect className="s-soft" x={160 + i * 236} y="690" width="208" height="140" rx="10" />
          <path className="s-dim thick" d={`M ${186 + i * 236} 730 H ${300 + i * 236}`} />
          <path className="s-soft" d={`M ${186 + i * 236} 766 H ${340 + i * 236} M ${186 + i * 236} 794 H ${320 + i * 236}`} />
        </g>
      ))}
      <circle cx="295" cy="602" r="44" {...b("ring", 10.3, { cls: "s-gold-thin", len: 0.9, n: 1 })} />
      {/* Someone gets in touch. */}
      <g {...b("rise", 10.9, { len: 1 })}>
        <rect className="f-paper" x="470" y="760" width="440" height="140" rx="16" />
        <circle className="f-gold" cx="520" cy="810" r="12" />
        <text className="t-ink t-left t-strong" x="548" y="822" fontSize="34">New enquiry</text>
        <text className="t-ink-soft t-left" x="498" y="872" fontSize="28">Kitchen · this week</text>
      </g>
    </Art>
  );
}

/* ── 5. And the rest: three panels, panned across ──────────────────────── */

function Tools() {
  const b = beats(DESIGN.more);
  return (
    <Art>
      <text x="500" y="170" fontSize="80" {...b("rise", 0.4, { cls: "t-disp", len: 1.2 })}>
        Custom tools
      </text>
      <g {...b("rise", 0.8, { len: 1.1 })}>
        <rect className="s-line" x="120" y="250" width="760" height="560" rx="18" />
        <path className="s-soft" d="M 330 250 V 810" />
        <path className="s-dim thick" d="M 160 320 H 290 M 160 390 H 270 M 160 460 H 290 M 160 530 H 250" />
        <rect className="f-gold-dim" x="140" y="295" width="170" height="50" rx="6" />
      </g>
      {["Job", "Client", "Date"].map((label, i) => (
        <g key={label}>
          <text x="380" y={340 + i * 130} fontSize="26" {...b("fade", 1.2, { cls: "t-small t-left" })}>
            {label}
          </text>
          <path d={`M 380 ${388 + i * 130} H 830`} {...b("fade", 1.2, { cls: "s-soft" })} />
          <path d={`M 380 ${370 + i * 130} H ${720 - i * 70}`} {...b("grow", 1.8 + i * 0.6, { cls: "s-gold thick", len: 0.7 })} />
        </g>
      ))}
      <g {...b("pop", 3.8, { len: 0.7 })}>
        <circle className="f-gold" cx="790" cy="745" r="34" />
        <path className="s-ink" d="M 774 746 l 11 11 l 22 -24" />
      </g>
    </Art>
  );
}

function Photo() {
  const b = beats(DESIGN.more);
  const rows = [-300, -200, -100, 0, 100, 200, 300];
  return (
    <Art>
      <text x="500" y="170" fontSize="80" {...b("rise", 5.6, { cls: "t-disp", len: 1.2 })}>
        Photo &amp; video
      </text>
      {/* The viewfinder. */}
      <path
       
        d="M 150 290 V 240 H 210 M 790 240 H 850 V 290 M 850 770 V 820 H 790 M 210 820 H 150 V 770"
        {...b("fade", 5.6, { cls: "s-paper thick" })}
      />
      <g {...b("blink", 6, { len: 0.8, n: 4 })}>
        <circle className="f-gold" cx="200" cy="290" r="10" />
      </g>
      <text x="222" y="300" fontSize="26" {...b("fade", 6, { cls: "t-small t-left" })}>
        Rec
      </text>
      {/* Vines to the hills, under the sun. */}
      <path pathLength={1} d="M 160 560 C 300 470, 420 520, 520 490 S 760 440, 840 500" {...b("draw", 5.7, { cls: "s-line", len: 1.4 })} />
      <path pathLength={1} d={ring(690, 400, 40)} {...b("draw", 5.9, { cls: "s-gold", len: 1.2 })} />
      {rows.map((dx, i) => (
        <path
          key={dx}
         
          pathLength={1}
          d={`M ${500 + dx * 0.12} 560 L ${500 + dx * 1.3} 800`}
          {...b("draw", 6 + i * 0.12, { cls: "s-gold-thin", len: 1 })}
        />
      ))}
      <g {...b("focus", 6.8, { len: 0.9 })}>
        <rect className="s-paper" x="440" y="600" width="120" height="90" />
      </g>
    </Art>
  );
}

function Phones() {
  const b = beats(DESIGN.more);
  return (
    <Art>
      <text x="500" y="170" fontSize="72" {...b("rise", 9.2, { cls: "t-disp", len: 1.2 })}>
        Phones &amp; booking
      </text>
      <g {...b("shake", 9.5, { len: 0.6, n: 2 })}>
        <rect className="s-line" x="130" y="300" width="200" height="370" rx="30" />
        <path className="s-paper" d="M 196 440 q 10 -18 22 -6 l 8 8 q 6 8 -2 16 q 10 18 26 26 q 8 -8 16 -2 l 8 8 q 12 12 -6 22 q -38 6 -72 -72 z" />
      </g>
      <g {...b("pop", 10.5, { len: 0.6 })}>
        <rect className="f-gold" x="150" y="580" width="160" height="56" rx="28" />
        <text className="t-ink t-caps" x="230" y="617" fontSize="24">Answered</text>
      </g>
      <path d="M 345 480 C 380 440, 400 420, 430 410" {...b("fade", 11, { cls: "s-gold-thin dashed" })} />
      <g {...b("rise", 11, { len: 0.9 })}>
        <rect className="s-line" x="440" y="290" width="430" height="260" rx="16" />
        <text className="t-small t-left" x="468" y="340" fontSize="26">Thursday</text>
        <path className="s-soft" d="M 468 368 H 842 M 468 430 H 842 M 468 492 H 842" />
      </g>
      <g {...b("grow", 11.6, { len: 0.7 })}>
        <rect className="f-gold" x="468" y="380" width="374" height="44" rx="6" />
      </g>
      <text x="484" y="412" fontSize="26" {...b("fade", 12, { cls: "t-ink t-left" })}>
        Booked · 10am
      </text>
      <g {...b("rise", 12.6, { len: 0.9 })}>
        <path className="f-paper" d="M 460 610 h 380 a 20 20 0 0 1 20 20 v 80 a 20 20 0 0 1 -20 20 h -330 l -30 30 v -30 h -20 a 20 20 0 0 1 -20 -20 v -80 a 20 20 0 0 1 20 -20 z" />
        <text className="t-ink t-left" x="470" y="668" fontSize="28">Thanks, see you Thursday.</text>
        <text className="t-ink-soft t-left" x="470" y="712" fontSize="26">Follow-up · sent</text>
      </g>
      <g {...b("pop", 13.4, { len: 0.5 })}>
        <circle className="f-gold" cx="840" cy="610" r="22" />
        <path className="s-ink" d="M 830 611 l 7 7 l 14 -15" />
      </g>
    </Art>
  );
}

function More() {
  const b = beats(DESIGN.more);
  return (
    <div {...b("pan", 0, { cls: "film-strip" })}>
      <div {...b("panel1", 0, { cls: "film-panel" })}>
        <Tools />
      </div>
      <div {...b("panel2", 0, { cls: "film-panel" })}>
        <Photo />
      </div>
      <div {...b("panel3", 0, { cls: "film-panel" })}>
        <Phones />
      </div>
    </div>
  );
}

/* ── 6. One plan ───────────────────────────────────────────────────────── */

function Close() {
  const b = beats(DESIGN.close);
  return (
    <Art>
      <g {...b("rise", 0.2, { len: 1.6 })}>
        <text className="t-disp t-mark" x="370" y="430" fontSize="168">A</text>
        <text className="t-disp t-mark t-gold" x="500" y="430" fontSize="140">&amp;</text>
        <text className="t-disp t-mark" x="630" y="430" fontSize="168">J</text>
      </g>
      <path pathLength={1} d="M 500 500 H 320" {...b("draw", 0.9, { cls: "s-gold", len: 1.4 })} />
      <path pathLength={1} d="M 500 500 H 680" {...b("draw", 0.9, { cls: "s-gold", len: 1.4 })} />
      <text x="500" y="640" fontSize="104" {...b("rise", 1.1, { cls: "t-disp", len: 1.4 })}>
        One plan.
      </text>
      <text x="500" y="720" fontSize="34" {...b("fade", 3.7, { cls: "t-body t-soft", len: 1.2 })}>
        Built and looked after by the two of them
      </text>
    </Art>
  );
}

export const SCENE_ART: Record<SceneId, () => React.JSX.Element> = {
  elora: Elora,
  call: Call,
  problem: Problem,
  plan: Plan,
  web: Web,
  more: More,
  close: Close,
};
