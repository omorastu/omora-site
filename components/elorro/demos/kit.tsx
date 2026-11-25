"use client";

import { useEffect, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { hanken } from "@/components/elorro/fonts";
import { WORKSPACE, type DemoIndustry } from "@/components/elorro/demos/data";
import "@/components/elorro/demos/demos.css";

/**
 * What every demo screen shares (app/demos/*): the player, the app's frame,
 * and the small parts (avatars, chips, ticks, icons).
 *
 * A demo is a short flow, drawn as a pure function of one time, `t` seconds
 * into it: nothing on it keeps a clock of its own (no CSS transitions or
 * animations), so it can be captured a frame at a time
 * (video/scripts/demos.mjs) and the film's loops are exactly what the page
 * shows. Visited, it plays, holds its end for a moment and goes round; with
 * reduced motion on, it shows its end. With `?capture` it waits instead:
 * `window.__demo.seek(t)` draws the moment `t` (synchronously; the capture
 * then waits two animation frames for the paint).
 *
 * Two layouts, each drawn on a stage of its own size and scaled to the
 * window: a desktop app on a 960 × 600 stage (1440 × 900 at 1.5×), and a
 * phone app on a 390 × 488 stage (a 4:5 frame, the film's phone box).
 */

declare global {
  interface Window {
    /** Capture mode only (?capture): the flow's length, and a way to draw any moment of it. */
    __demo?: { duration: number; seek(t: number): void };
  }
}

export const STAGE = { desktop: [960, 600], phone: [390, 488] } as const;
/** In a visit, how long the end holds before it goes round again. */
const HOLD = 2;

const onResize = (change: () => void) => {
  window.addEventListener("resize", change);
  return () => window.removeEventListener("resize", change);
};
const REDUCE = "(prefers-reduced-motion: reduce)";
const onMotionPref = (change: () => void) => {
  const m = window.matchMedia(REDUCE);
  m.addEventListener("change", change);
  return () => m.removeEventListener("change", change);
};

/** The window's size, as "w×h" (a string, so the snapshot is stable). */
function useWindowSize() {
  const key = useSyncExternalStore(
    onResize,
    () => `${window.innerWidth}x${window.innerHeight}`,
    () => "1440x900"
  );
  const [w, h] = key.split("x").map(Number);
  return { w, h };
}
function useReducedMotion() {
  return useSyncExternalStore(onMotionPref, () => window.matchMedia(REDUCE).matches, () => false);
}

/** The flow's time: playing round in a visit, set from outside in capture mode, at its end with reduced motion. */
function useFlowTime(duration: number, capture: boolean, reduce: boolean) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (capture) {
      window.__demo = {
        duration,
        seek: (x: number) => flushSync(() => setT(Math.max(0, Math.min(duration, x)))),
      };
      return () => {
        delete window.__demo;
      };
    }
    if (reduce) return;
    let raf = 0;
    let t0 = -1;
    const loop = (now: number) => {
      if (t0 < 0) t0 = now;
      const e = ((now - t0) / 1000) % (duration + HOLD);
      setT(Math.min(e, duration));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [duration, capture, reduce]);
  return !capture && reduce ? duration : t;
}

/** The demo on its stage, scaled to the window; `draw` gets the time and which layout. */
export function DemoPlayer({
  duration,
  capture,
  label,
  draw,
}: {
  duration: number;
  capture: boolean;
  label: string;
  draw: (t: number, phone: boolean) => ReactNode;
}) {
  const { w, h } = useWindowSize();
  const reduce = useReducedMotion();
  const t = useFlowTime(duration, capture, reduce);
  const phone = w < 700;
  const [sw, sh] = phone ? STAGE.phone : STAGE.desktop;
  const scale = Math.min(w / sw, h / sh);
  return (
    <main className={`dm-root ${hanken.variable}`} aria-label={label} data-capture={capture ? "" : undefined}>
      <div className={`dm-stage${phone ? " dm-stage--phone" : ""}`} style={{ width: sw, height: sh, transform: `scale(${scale})` }}>
        {draw(t, phone)}
      </div>
    </main>
  );
}

/* ── Time ──────────────────────────────────────────────────────────────── */

const clamp = (x: number) => Math.min(1, Math.max(0, x));
/** How far through a move that starts at `at` and takes `len`: 0 to 1. */
export const prog = (t: number, at: number, len = 0.3) => clamp((t - at) / len);
/** Eased out (fast, then settling), as UI moves are. */
export const ease = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** Coming in from `at`: fading up from `dy` px lower (or `dx` to the side), and a touch smaller if `grow`. */
export const appear = (t: number, at: number, o: { len?: number; dy?: number; dx?: number; grow?: boolean } = {}): CSSProperties => {
  const p = ease(prog(t, at, o.len ?? 0.32));
  const dy = (1 - p) * (o.dy ?? 8);
  const dx = (1 - p) * (o.dx ?? 0);
  const s = o.grow ? 0.96 + 0.04 * p : 1;
  return { opacity: p, transform: dx || dy || s !== 1 ? `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) scale(${s.toFixed(4)})` : undefined };
};
/** Going from `at`. */
export const fadeOut = (t: number, at: number, len = 0.25): CSSProperties => ({ opacity: 1 - ease(prog(t, at, len)) });
/** Text typed from `at`, `cps` letters a second. */
export const typed = (text: string, t: number, at: number, cps = 22) => text.slice(0, Math.max(0, Math.floor((t - at) * cps)));
/** Text spoken from `at` to `end`, a word at a time (a live transcript). */
export const spoken = (text: string, t: number, at: number, end: number) => {
  const words = text.split(" ");
  const n = Math.ceil(words.length * clamp((t - at) / (end - at)));
  return words.slice(0, n).join(" ");
};
/** Between `a` and `b`, at `x` (0 to 1). */
export const mix = (a: number, b: number, x: number) => a + (b - a) * x;

/* ── Small parts ───────────────────────────────────────────────────────── */

const AVATAR = ["#E9D7FE", "#D1E9FF", "#FDE2C8", "#D3F8DF", "#FCE7F6", "#E0EAFF", "#FEF0C7", "#CCFBEF"];
const AVATAR_INK = ["#5B2C9A", "#1849A9", "#93370D", "#085D3A", "#9E165F", "#2D31A6", "#93370D", "#125D56"];
/** A person: their initials in a circle, its colour fixed by the name. */
export function Avatar({ name, initials, size = 32 }: { name: string; initials: string; size?: number }) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 997;
  const i = h % AVATAR.length;
  return (
    <span className="dm-avatar" style={{ width: size, height: size, fontSize: size * 0.38, background: AVATAR[i], color: AVATAR_INK[i] }} aria-hidden="true">
      {initials}
    </span>
  );
}

export type Tone = "neutral" | "pending" | "confirmed" | "live" | "done" | "new";
export function Chip({ tone = "neutral", children, style }: { tone?: Tone; children: ReactNode; style?: CSSProperties }) {
  return (
    <span className={`dm-chip dm-chip--${tone}`} style={style}>
      {children}
    </span>
  );
}

/** A tick in a circle, drawn in as it comes (`p`, 0 to 1). */
export function Check({ p = 1, size = 18, gold }: { p?: number; size?: number; gold?: boolean }) {
  const e = ease(p);
  return (
    <span className={`dm-check${gold ? " dm-check--gold" : ""}`} style={{ width: size, height: size, opacity: Math.min(1, p * 2), transform: `scale(${(0.6 + 0.4 * e).toFixed(3)})` }} aria-hidden="true">
      <svg viewBox="0 0 20 20">
        <path d="M5.5 10.4l3 3 6-6.6" pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1 - e }} />
      </svg>
    </span>
  );
}

/** An empty circle where a tick will be. */
export function Pending({ size = 18 }: { size?: number }) {
  return <span className="dm-pending" style={{ width: size, height: size }} aria-hidden="true" />;
}

const ICONS: Record<string, string> = {
  calendar: "M4 6.5h16M7.5 3v3.5M16.5 3v3.5M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
  list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
  users: "M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 10.5a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5zM20 19v-1.5a3.5 3.5 0 0 0-2.5-3.35M15.5 4.2a3.25 3.25 0 0 1 0 6.1",
  phone: "M5 4h3.2l1.6 4-2 1.3a10 10 0 0 0 4.9 4.9l1.3-2 4 1.6V17a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z",
  chat: "M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4A8 8 0 1 1 20 12z",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2.1-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2.1 1.2l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2.1 1.2L10 21h4l.5-2.6a7 7 0 0 0 2.1-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
  bell: "M18 9.5a6 6 0 0 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 15.5 18 9.5zM10 20a2.2 2.2 0 0 0 4 0",
  home: "M4 10.5L12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z",
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
  table: "M4 5h16v14H4zM4 10h16M4 14.5h16M10 5v14",
  sparkle: "M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z",
  doc: "M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10.5a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5zM14 3.5V8h4M9 12h6M9 15.5h6",
  chart: "M5 19V11M10 19V5M15 19v-7M20 19V8",
  menu: "M4 7h16M4 12h16M4 17h16",
  plus: "M12 5v14M5 12h14",
  tool: "M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3l-2.5 2.5-2.5-.5-.5-2.5z",
  clock: "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 8v4.5l3 1.8",
  inbox: "M4 13l2.5-8h11L20 13v6H4zM4 13h4.5a3.5 3.5 0 0 0 7 0H20",
  chevron: "M9 6l6 6-6 6",
  back: "M15 6l-6 6 6 6",
  send: "M4 12l16-8-6 16-2.5-6.5z",
};
export function Icon({ name, size = 18, className }: { name: keyof typeof ICONS | string; size?: number; className?: string }) {
  return (
    <svg className={`dm-icon${className ? ` ${className}` : ""}`} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d={ICONS[name] ?? ICONS.doc} />
    </svg>
  );
}

/** The small "Demo" mark every screen carries in its corner. */
export function DemoBadge() {
  return <span className="dm-badge">Demo</span>;
}

/* ── The app's frame ───────────────────────────────────────────────────── */

export type NavItem = { icon: string; label: string; count?: number };

/**
 * The app around a screen. Desktop: the workspace and its menu down the
 * left, the screen's title bar across the top (a search, the Demo badge, who's
 * signed in). Phone: a title bar, and the tabs along the foot.
 */
export function Shell({
  phone,
  ind,
  nav,
  active,
  title,
  sub,
  tools,
  tabs,
  children,
}: {
  phone: boolean;
  ind: DemoIndustry;
  nav: NavItem[];
  active: number;
  title: string;
  sub?: string;
  tools?: ReactNode;
  tabs?: NavItem[];
  children: ReactNode;
}) {
  const ws = WORKSPACE[ind];
  if (phone) {
    return (
      <div className="dm-app dm-app--phone">
        <header className="dm-ptop">
          <span className="dm-ws-mark dm-ws-mark--sm">{ws.mark}</span>
          <div className="dm-ptop-title">
            <strong>{title}</strong>
            {sub && <span>{sub}</span>}
          </div>
          <DemoBadge />
        </header>
        <div className="dm-pbody">{children}</div>
        <nav className="dm-tabs" aria-hidden="true">
          {(tabs ?? nav.slice(0, 4)).map((n, i) => (
            <span key={n.label} className={i === active ? "is-on" : undefined}>
              <Icon name={n.icon} size={20} />
              {n.label}
            </span>
          ))}
        </nav>
      </div>
    );
  }
  return (
    <div className="dm-app">
      <aside className="dm-side" aria-hidden="true">
        <div className="dm-ws">
          <span className="dm-ws-mark">{ws.mark}</span>
          <span className="dm-ws-name">
            <strong>{ws.name}</strong>
            <span>{ws.sub}</span>
          </span>
        </div>
        <nav className="dm-nav">
          {nav.map((n, i) => (
            <span key={n.label} className={i === active ? "is-on" : undefined}>
              <Icon name={n.icon} size={17} />
              {n.label}
              {n.count ? <em>{n.count}</em> : null}
            </span>
          ))}
        </nav>
        <div className="dm-side-foot">
          <Avatar name={ws.who} initials={ws.whoInitials} size={28} />
          <span>
            <strong>{ws.who}</strong>
            <span>Signed in</span>
          </span>
        </div>
      </aside>
      <section className="dm-main">
        <header className="dm-top">
          <div className="dm-top-title">
            <h1>{title}</h1>
            {sub && <span>{sub}</span>}
          </div>
          <div className="dm-top-tools">
            {tools}
            <span className="dm-search">
              <Icon name="search" size={15} />
              Search
            </span>
            <Icon name="bell" size={18} className="dm-top-bell" />
            <DemoBadge />
          </div>
        </header>
        <div className="dm-body">{children}</div>
      </section>
    </div>
  );
}
