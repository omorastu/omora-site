import React, { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { APP, type NavKey } from "./data";
import { B, FONT_BODY } from "./tw";

/**
 * The app's visual language, mirrored from omora-clinical/app/_components:
 * ui.tsx (Page, PageHeader, Card, CardTitle, Category, Muted, Quiet, Chip,
 * Badge, Button, Spinner, CheckIcon, INPUT), demo-banner.tsx and
 * sidebar.tsx. Class strings are the app's own, run through tw.tsx.
 *
 * Its CSS animations (animate-pulse, animate-spin, the level meter) are
 * computed from the loop's clock instead, so every frame is deterministic.
 */

/** Seconds on the loop's clock; negative while the end fades back into frame 0. */
export const Clock = createContext(0);

/** Frame px per CSS px (1.5 or 3), for snapping offsets to whole frame pixels. */
export const Scale = createContext(1.5);

/** A CSS px offset rounded to whole frame pixels, so text never lands between them. */
export const useSnap = () => {
  const scale = useContext(Scale);
  return (px: number) => Math.round(px * scale) / scale;
};

export type Pass = { s?: CSSProperties; spaceAfter?: number };

/** CSS ease-in-out, as `cubic-bezier(0.42, 0, 0.58, 1)`. */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const sample = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (x: number) => {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (sample(x1, x2, mid) < x) lo = mid;
      else hi = mid;
    }
    return sample(y1, y2, (lo + hi) / 2);
  };
}
export const easeInOut = bezier(0.42, 0, 0.58, 1);
const pulseCurve = bezier(0.4, 0, 0.6, 1);

const mod = (a: number, n: number) => ((a % n) + n) % n;

/** Tailwind's animate-pulse: 2s, opacity 1 → 0.5 → 1. */
export function pulse(t: number) {
  const p = mod(t, 2) / 2;
  return p < 0.5 ? 1 - 0.5 * pulseCurve(p / 0.5) : 0.5 + 0.5 * pulseCurve((p - 0.5) / 0.5);
}

/* -------------------------------------------------------------------------
 * Chrome: banner, sidebar (desktop), top bar (phone)
 * ---------------------------------------------------------------------- */

export const DemoBanner: React.FC = () => (
  <B c="bg-amber-100 px-4 py-1.5 text-center text-xs font-medium text-amber-900" s={{ fontFamily: FONT_BODY }}>
    {APP.banner}
  </B>
);

export const Badge: React.FC<{ count: number; inline?: boolean }> = ({ count, inline = false }) =>
  count === 0 ? null : (
    <B
      as="span"
      c={`${inline ? "" : "ml-auto "}inline-flex min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[0.6875rem] font-semibold text-amber-900 tabular-nums`}
    >
      {count}
    </B>
  );

/** The desktop column. Its sticky inner fills the frame under the pinned banner. */
export const Sidebar: React.FC<{ active: NavKey | null }> = ({ active }) => (
  <B as="aside" c="hidden w-52 shrink-0 self-stretch border-r border-zinc-200 bg-white md:block">
    <B c="sticky top-0 flex flex-col" s={{ height: "100%" }}>
      <B c="px-4 pt-5 pb-3">
        <B as="p" c="text-sm font-semibold text-zinc-900">
          {APP.name}
        </B>
        <B as="p" c="text-xs text-zinc-600">
          {APP.today}
        </B>
      </B>
      <B as="nav" c="flex-1 space-y-0.5 px-2">
        {APP.nav.map((item) => (
          <B
            key={item.key}
            as="a"
            c={
              "flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors " +
              (item.key === active ? "bg-zinc-100 font-medium text-zinc-900" : "text-zinc-600")
            }
          >
            {item.label}
            <Badge count={item.badge} />
          </B>
        ))}
      </B>
      <B c="border-t border-zinc-100 px-4 py-3">
        <B as="p" c="text-[0.6875rem] text-zinc-600">
          {APP.footer}
        </B>
        <B as="button" c="mt-1 cursor-pointer text-xs text-zinc-600 underline-offset-2">
          {APP.reset}
        </B>
      </B>
    </B>
  </B>
);

/** The phone's top bar: name and date, then the destinations as tabs. */
export const PhoneHeader: React.FC<{ active: NavKey | null }> = ({ active }) => (
  <B as="header" c="sticky top-0 z-30 border-b border-zinc-200 bg-white md:hidden">
    <B c="flex items-baseline justify-between gap-3 px-4 pt-3 pb-2">
      <B as="p" c="text-sm font-semibold text-zinc-900">
        {APP.name}
      </B>
      <B as="p" c="shrink-0 text-xs text-zinc-600">
        {APP.today}
      </B>
    </B>
    <B as="nav" c="flex gap-1 overflow-x-auto px-2 pb-2">
      {APP.nav.map((item) => (
        <B
          key={item.key}
          as="a"
          c={
            "flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 text-sm whitespace-nowrap transition-colors " +
            (item.key === active ? "bg-zinc-900 font-semibold text-white" : "text-zinc-700")
          }
        >
          {item.label}
          <Badge count={item.badge} inline />
        </B>
      ))}
    </B>
  </B>
);

/* -------------------------------------------------------------------------
 * Page frame, cards, labels
 * ---------------------------------------------------------------------- */

/**
 * The app's Page is `min-h-full bg-zinc-50 font-sans`. Here the frame's page
 * area paints that zinc-50 ground instead, so a page fading in or out does not
 * carry a full-width background whose blending would leave a faint seam.
 */
export const Page: React.FC<{ children: ReactNode; wide?: boolean }> = ({ children, wide = false }) => (
  <B c="min-h-full font-sans">
    <B c={`mx-auto space-y-6 px-4 py-6 sm:px-6 ${wide ? "max-w-6xl" : "max-w-4xl"}`}>{children}</B>
  </B>
);

export const PageHeader: React.FC<{ title: ReactNode; subtitle?: ReactNode; actions?: ReactNode } & Pass> = ({
  title,
  subtitle,
  actions,
  s,
  spaceAfter,
}) => (
  <B as="header" c="flex flex-wrap items-center justify-between gap-3" s={s} spaceAfter={spaceAfter}>
    <B c="min-w-0">
      <B as="h1" c="text-base font-semibold text-zinc-900">
        {title}
      </B>
      {subtitle && (
        <B as="p" c="text-xs text-zinc-600">
          {subtitle}
        </B>
      )}
    </B>
    {actions && <B c="flex flex-wrap items-center gap-3">{actions}</B>}
  </B>
);

const TONES = {
  neutral: "bg-white ring-zinc-200",
  amber: "bg-amber-50 ring-amber-200",
  emerald: "bg-emerald-50 ring-emerald-200",
  rose: "bg-rose-50 ring-rose-200",
};

export const Card: React.FC<{ children: ReactNode; className?: string; tone?: keyof typeof TONES } & Pass> = ({
  children,
  className = "",
  tone = "neutral",
  s,
  spaceAfter,
}) => (
  <B as="section" c={`rounded-lg p-4 ring-1 ${TONES[tone]} ${className}`} s={s} spaceAfter={spaceAfter}>
    {children}
  </B>
);

export const CardTitle: React.FC<{ children: ReactNode; right?: ReactNode }> = ({ children, right }) => (
  <B c="flex items-baseline justify-between gap-4">
    <B as="h2" c="text-sm font-semibold text-zinc-900">
      {children}
    </B>
    {right}
  </B>
);

export const Category: React.FC<{ children: ReactNode }> = ({ children }) => (
  <B as="span" c="text-[0.6875rem] font-medium tracking-wide text-amber-700 uppercase">
    {children}
  </B>
);

export const Muted: React.FC<{ children: ReactNode; className?: string } & Pass> = ({ children, className = "", s, spaceAfter }) => (
  <B as="p" c={`text-xs text-zinc-600 ${className}`} s={s} spaceAfter={spaceAfter}>
    {children}
  </B>
);

export const Quiet: React.FC<{ children: ReactNode }> = ({ children }) => (
  <B as="span" c="font-medium text-sky-700">
    {children}
  </B>
);

export const Chip: React.FC<{ children: ReactNode; primary?: boolean }> = ({ children, primary = false }) => (
  <B
    as="span"
    c={
      "inline-flex items-center gap-1.5 rounded-full font-medium " +
      (primary ? "bg-zinc-900 px-3 py-1 text-xs text-white" : "bg-zinc-100 px-2.5 py-1 text-xs text-zinc-800")
    }
  >
    {children}
  </B>
);

/* -------------------------------------------------------------------------
 * Buttons
 * ---------------------------------------------------------------------- */

const BUTTON = {
  primary: "rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white",
  secondary: "rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 ring-1 ring-zinc-300",
  amber: "inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 ring-1 ring-amber-400",
  link: "text-xs text-zinc-600 underline underline-offset-2 decoration-zinc-400",
} as const;

/** The `active:` state, for the frames where a button is being pressed. */
const PRESSED: Record<keyof typeof BUTTON, string> = {
  primary: "bg-zinc-950",
  secondary: "bg-zinc-200",
  amber: "bg-amber-200",
  link: "",
};

export const Button: React.FC<{ variant?: keyof typeof BUTTON; pressed?: boolean; children: ReactNode; className?: string }> = ({
  variant = "secondary",
  pressed = false,
  children,
  className = "",
}) => (
  <B
    as="button"
    c={`select-none ${BUTTON[variant]} ${pressed ? PRESSED[variant] : ""} ${className}`}
    s={pressed ? { transform: "translateY(1px)" } : undefined}
  >
    {children}
  </B>
);

/** The busy spinner, turning once a second (animate-spin). */
export const Spinner: React.FC = () => {
  const t = useContext(Clock);
  return (
    <B
      as="span"
      c="mr-1.5 inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent align-[-1px]"
      s={{ transform: `rotate(${mod(t, 1) * 360}deg)` }}
    />
  );
};

export const CheckIcon: React.FC = () => (
  <svg viewBox="0 0 16 16" aria-hidden style={{ width: 14, height: 14 }}>
    <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const INPUT = "w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-900 outline-none";

/** The `group` of an app frame: everything outside <Page> inherits body's Arial. */
export const RESET = `
.cs, .cs *, .cs ::before, .cs ::after { box-sizing: border-box; margin: 0; padding: 0; border: 0 solid; }
.cs {
  font-family: ${FONT_BODY}; font-size: 16px; line-height: 1.5; color: #171717; background: #fff;
  -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; tab-size: 4;
  -webkit-text-size-adjust: 100%;
}
.cs h1, .cs h2, .cs h3 { font-size: inherit; font-weight: inherit; }
.cs ol, .cs ul { list-style: none; }
.cs svg { display: block; vertical-align: middle; }
.cs a { color: inherit; text-decoration: inherit; }
.cs button, .cs input, .cs select, .cs textarea {
  font: inherit; font-feature-settings: inherit; font-variation-settings: inherit; letter-spacing: inherit;
  color: inherit; border-radius: 0; background-color: transparent; opacity: 1;
}
.cs button { appearance: button; }
.cs ::placeholder { opacity: 1; color: color-mix(in oklab, currentcolor 50%, transparent); }
`;
