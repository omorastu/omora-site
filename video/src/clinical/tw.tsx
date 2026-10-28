import React, { createContext, useContext, type CSSProperties, type ReactNode } from "react";

/**
 * A small Tailwind v4 → inline style map, so the Clinical Scribe replica can
 * carry the app's own class strings verbatim (copied from
 * omora-clinical/app/_components/ui.tsx and the screens) instead of
 * hand-translated approximations. It covers only the classes those screens
 * use, with Tailwind 4.3's own values: the oklch palette, the 0.25rem
 * spacing step, unitless line heights, ring and shadow composition, and
 * `space-y-*` as v4 does it (margin-block-end on every child but the last).
 *
 * Responsive prefixes resolve against the viewport the composition is laid
 * out at (1440 or 390 CSS px), as the app's media queries would. `dark:`,
 * `hover:`, `focus*:`, `active:`, `disabled:` and `print:` are ignored:
 * the replica is light mode and nobody is pointing at it. Pressed and busy
 * states are drawn explicitly where the loop needs them.
 */

/** Tailwind 4.3 theme colours (node_modules/tailwindcss/theme.css). */
export const COLORS: Record<string, string> = {
  white: "#fff",
  black: "#000",
  transparent: "transparent",
  current: "currentcolor",
  "amber-50": "oklch(98.7% 0.022 95.277)",
  "amber-100": "oklch(96.2% 0.059 95.617)",
  "amber-200": "oklch(92.4% 0.12 95.746)",
  "amber-300": "oklch(87.9% 0.169 91.605)",
  "amber-400": "oklch(82.8% 0.189 84.429)",
  "amber-500": "oklch(76.9% 0.188 70.08)",
  "amber-600": "oklch(66.6% 0.179 58.318)",
  "amber-700": "oklch(55.5% 0.163 48.998)",
  "amber-800": "oklch(47.3% 0.137 46.201)",
  "amber-900": "oklch(41.4% 0.112 45.904)",
  "amber-950": "oklch(27.9% 0.077 45.635)",
  "emerald-50": "oklch(97.9% 0.021 166.113)",
  "emerald-100": "oklch(95% 0.052 163.051)",
  "emerald-200": "oklch(90.5% 0.093 164.15)",
  "emerald-300": "oklch(84.5% 0.143 164.978)",
  "emerald-400": "oklch(76.5% 0.177 163.223)",
  "emerald-500": "oklch(69.6% 0.17 162.48)",
  "emerald-600": "oklch(59.6% 0.145 163.225)",
  "emerald-700": "oklch(50.8% 0.118 165.612)",
  "emerald-800": "oklch(43.2% 0.095 166.913)",
  "emerald-900": "oklch(37.8% 0.077 168.94)",
  "sky-50": "oklch(97.7% 0.013 236.62)",
  "sky-100": "oklch(95.1% 0.026 236.824)",
  "sky-200": "oklch(90.1% 0.058 230.902)",
  "sky-300": "oklch(82.8% 0.111 230.318)",
  "sky-600": "oklch(58.8% 0.158 241.966)",
  "sky-700": "oklch(50% 0.134 242.749)",
  "sky-800": "oklch(44.3% 0.11 240.79)",
  "sky-900": "oklch(39.1% 0.09 240.876)",
  "rose-50": "oklch(96.9% 0.015 12.422)",
  "rose-100": "oklch(94.1% 0.03 12.58)",
  "rose-200": "oklch(89.2% 0.058 10.001)",
  "rose-400": "oklch(71.2% 0.194 13.428)",
  "rose-500": "oklch(64.5% 0.246 16.439)",
  "rose-600": "oklch(58.6% 0.253 17.585)",
  "rose-700": "oklch(51.4% 0.222 16.935)",
  "rose-800": "oklch(45.5% 0.188 13.697)",
  "zinc-50": "oklch(98.5% 0 none)",
  "zinc-100": "oklch(96.7% 0.001 286.375)",
  "zinc-200": "oklch(92% 0.004 286.32)",
  "zinc-300": "oklch(87.1% 0.006 286.286)",
  "zinc-400": "oklch(70.5% 0.015 286.067)",
  "zinc-500": "oklch(55.2% 0.016 285.938)",
  "zinc-600": "oklch(44.2% 0.017 285.786)",
  "zinc-700": "oklch(37% 0.013 285.805)",
  "zinc-800": "oklch(27.4% 0.006 286.033)",
  "zinc-900": "oklch(21% 0.006 285.885)",
  "zinc-950": "oklch(14.1% 0.005 285.823)",
};

/** next/font's Geist, as the app's `font-sans` and `font-mono` resolve. */
export const FONT_SANS = "Geist, ui-sans-serif, system-ui, sans-serif";
export const FONT_MONO = "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
/** Tailwind's own serif stack (the letters' textarea). */
export const FONT_SERIF = "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif";
/** globals.css sets body to Arial, so anything outside <Page> (banner, nav) is Arial. */
export const FONT_BODY = "Arial, Helvetica, sans-serif";

function color(token: string): string | undefined {
  const [name, alpha] = token.split("/");
  const c = COLORS[name];
  if (!c) return undefined;
  if (!alpha) return c;
  return `color-mix(in oklab, ${c} ${alpha}%, transparent)`;
}

/** Spacing scale: `4` → 16px, `0.5` → 2px, `px` → 1px, `[26rem]` → 26rem. */
function space(v: string): string | number | undefined {
  if (v === "px") return 1;
  if (v === "auto") return "auto";
  if (v === "full") return "100%";
  if (v === "fit") return "fit-content";
  if (v === "screen") return "100vh";
  if (/^\[.+\]$/.test(v)) return v.slice(1, -1);
  const n = Number(v);
  return Number.isFinite(n) ? n * 4 : undefined;
}

const MAX_W: Record<string, string> = {
  xs: "20rem",
  md: "28rem",
  "2xl": "42rem",
  "4xl": "56rem",
  "6xl": "72rem",
};

const TEXT: Record<string, [number, number | string]> = {
  xs: [12, 1 / 0.75],
  sm: [14, 1.25 / 0.875],
  base: [16, 1.5],
  lg: [18, 1.75 / 1.125],
  "5xl": [48, 1],
};

const ROUNDED: Record<string, number | string> = {
  "": 4,
  sm: 4,
  md: 6,
  lg: 8,
  full: "calc(infinity * 1px)",
};

const SHADOW: Record<string, string> = {
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
};

const BREAKPOINTS: Record<string, number> = { sm: 640, md: 768, lg: 1024 };
const IGNORED = new Set(["dark", "hover", "focus", "focus-visible", "active", "disabled", "print", "aria-busy", "group-open"]);

export type Tw = { style: CSSProperties; spaceY?: number };

/**
 * Class string → style, at a viewport width. `space-y-*` comes back
 * separately, because it styles the children rather than the element.
 */
export function tw(classes: string, vw: number): Tw {
  const st: Record<string, string | number> = {};
  let ringWidth = 0;
  let ringColor = "currentcolor";
  let shadow: string | null = null;
  let spaceY: number | undefined;
  /** `leading-*` beats a `text-*` size's default line height, whatever the order. */
  let leading: number | undefined;

  for (let raw of classes.split(/\s+/).filter(Boolean)) {
    // Variants: keep responsive ones that match, drop interaction ones.
    if (raw.includes(":")) {
      const parts = raw.split(":");
      const cls = parts.pop()!;
      let keep = true;
      for (const v of parts) {
        if (v in BREAKPOINTS) keep &&= vw >= BREAKPOINTS[v];
        else if (IGNORED.has(v) || v.startsWith("aria-") || v.startsWith("group-")) keep = false;
        else keep = false;
      }
      if (!keep) continue;
      raw = cls;
    }
    const important = raw.startsWith("!");
    const c = important ? raw.slice(1) : raw;
    let m: RegExpMatchArray | null;

    // Fixed utilities.
    const fixed: Record<string, Record<string, string | number>> = {
      flex: { display: "flex" },
      "inline-flex": { display: "inline-flex" },
      grid: { display: "grid" },
      block: { display: "block" },
      "inline-block": { display: "inline-block" },
      hidden: { display: "none" },
      "flex-col": { flexDirection: "column" },
      "flex-wrap": { flexWrap: "wrap" },
      "flex-1": { flex: "1 1 0%" },
      "basis-0": { flexBasis: 0 },
      "shrink-0": { flexShrink: 0 },
      "items-center": { alignItems: "center" },
      "items-start": { alignItems: "flex-start" },
      "items-end": { alignItems: "flex-end" },
      "items-baseline": { alignItems: "baseline" },
      "justify-between": { justifyContent: "space-between" },
      "justify-center": { justifyContent: "center" },
      "self-start": { alignSelf: "flex-start" },
      "self-stretch": { alignSelf: "stretch" },
      relative: { position: "relative" },
      absolute: { position: "absolute" },
      "overflow-hidden": { overflow: "hidden" },
      "overflow-x-auto": { overflowX: "hidden" },
      "resize-none": { resize: "none" },
      "resize-y": { resize: "vertical" },
      truncate: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
      "whitespace-nowrap": { whiteSpace: "nowrap" },
      "text-left": { textAlign: "left" },
      "text-center": { textAlign: "center" },
      "tabular-nums": { fontVariantNumeric: "tabular-nums" },
      uppercase: { textTransform: "uppercase" },
      italic: { fontStyle: "italic" },
      underline: { textDecorationLine: "underline" },
      "underline-offset-2": { textUnderlineOffset: 2 },
      "list-disc": { listStyleType: "disc" },
      "list-decimal": { listStyleType: "decimal" },
      "font-normal": { fontWeight: 400 },
      "font-medium": { fontWeight: 500 },
      "font-semibold": { fontWeight: 600 },
      "font-sans": { fontFamily: FONT_SANS },
      "font-mono": { fontFamily: FONT_MONO },
      "font-serif": { fontFamily: FONT_SERIF },
      "tracking-wide": { letterSpacing: "0.025em" },
      "min-w-0": { minWidth: 0 },
      "min-w-5": { minWidth: 20 },
      "min-h-11": { minHeight: 44 },
      "min-h-full": { minHeight: "100%" },
      "mx-auto": { marginLeft: "auto", marginRight: "auto" },
      "ml-auto": { marginLeft: "auto" },
      "-mb-px": { marginBottom: -1 },
      border: { borderWidth: 1 },
      "border-b": { borderBottomWidth: 1 },
      "border-t": { borderTopWidth: 1 },
      "border-r": { borderRightWidth: 1 },
      "border-b-2": { borderBottomWidth: 2 },
      "border-l-2": { borderLeftWidth: 2 },
      "border-l-4": { borderLeftWidth: 4 },
      "border-2": { borderWidth: 2 },
      "border-dashed": { borderStyle: "dashed" },
      "outline-none": { outline: "none" },
      "select-none": { userSelect: "none" },
      "sr-only": { position: "absolute", width: 1, height: 1, overflow: "hidden" },
      "h-fit": { height: "fit-content" },
      "align-[-1px]": { verticalAlign: -1 },
      "object-cover": { objectFit: "cover" },
      "backdrop-blur-[2px]": { backdropFilter: "blur(2px)" },
      "inset-0": { inset: 0 },
      fixed: { position: "absolute" }, // fixed to the frame, which is the viewport here
      "z-10": { zIndex: 10 },
      "z-30": { zIndex: 30 },
      "w-full": { width: "100%" },
      "h-full": { height: "100%" },
    };
    if (c === "leading-relaxed") {
      leading = 1.625;
      continue;
    }
    if (c in fixed) {
      Object.assign(st, fixed[c]);
      continue;
    }

    if ((m = c.match(/^text-(xs|sm|base|lg|5xl)$/))) {
      const [size, lh] = TEXT[m[1]];
      st.fontSize = size;
      st.lineHeight = lh;
      continue;
    }
    if ((m = c.match(/^text-\[(.+)\]$/))) {
      // Arbitrary size: font-size only; line-height inherits.
      st.fontSize = m[1];
      continue;
    }
    if ((m = c.match(/^text-(.+)$/)) && color(m[1])) {
      st.color = color(m[1])!;
      continue;
    }
    if ((m = c.match(/^bg-(.+)$/)) && color(m[1])) {
      st.backgroundColor = color(m[1])!;
      continue;
    }
    if ((m = c.match(/^border-t-(.+)$/)) && color(m[1])) {
      st.borderTopColor = color(m[1])!;
      continue;
    }
    if ((m = c.match(/^border-(.+)$/)) && color(m[1])) {
      st.borderColor = color(m[1])!;
      continue;
    }
    if ((m = c.match(/^ring-(\d)$/))) {
      ringWidth = Number(m[1]);
      continue;
    }
    if ((m = c.match(/^ring-(.+)$/)) && color(m[1])) {
      ringColor = color(m[1])!;
      continue;
    }
    if ((m = c.match(/^shadow-(lg|xl)$/))) {
      shadow = SHADOW[m[1]];
      continue;
    }
    if ((m = c.match(/^rounded(?:-(sm|md|lg|full))?$/))) {
      st.borderRadius = ROUNDED[m[1] ?? ""];
      continue;
    }
    if ((m = c.match(/^max-w-(.+)$/)) && MAX_W[m[1]]) {
      st.maxWidth = MAX_W[m[1]];
      continue;
    }
    if ((m = c.match(/^space-y-(.+)$/))) {
      spaceY = space(m[1]) as number;
      continue;
    }
    if ((m = c.match(/^grid-cols-(\d+)$/))) {
      st.gridTemplateColumns = `repeat(${m[1]}, minmax(0, 1fr))`;
      continue;
    }
    if ((m = c.match(/^grid-cols-\[(.+)\]$/))) {
      st.gridTemplateColumns = m[1].replace(/_/g, " ");
      continue;
    }
    if ((m = c.match(/^col-span-(\d+)$/))) {
      st.gridColumn = `span ${m[1]} / span ${m[1]}`;
      continue;
    }
    if ((m = c.match(/^opacity-(\d+)$/))) {
      st.opacity = Number(m[1]) / 100;
      continue;
    }
    if ((m = c.match(/^(gap-x|gap-y|gap|min-w|min-h|max-w|px|py|pt|pb|pl|pr|p|mx|my|mt|mb|ml|mr|m|w|h|top|left|right|bottom)-(.+)$/))) {
      const v = space(m[2]);
      if (v === undefined) throw new Error(`tw: unknown class "${c}"`);
      const map: Record<string, string[]> = {
        p: ["padding"],
        px: ["paddingLeft", "paddingRight"],
        py: ["paddingTop", "paddingBottom"],
        pt: ["paddingTop"],
        pb: ["paddingBottom"],
        pl: ["paddingLeft"],
        pr: ["paddingRight"],
        m: ["margin"],
        mx: ["marginLeft", "marginRight"],
        my: ["marginTop", "marginBottom"],
        mt: ["marginTop"],
        mb: ["marginBottom"],
        ml: ["marginLeft"],
        mr: ["marginRight"],
        gap: ["gap"],
        "gap-x": ["columnGap"],
        "gap-y": ["rowGap"],
        w: ["width"],
        h: ["height"],
        top: ["top"],
        left: ["left"],
        right: ["right"],
        bottom: ["bottom"],
        "min-w": ["minWidth"],
        "min-h": ["minHeight"],
        "max-w": ["maxWidth"],
      };
      for (const prop of map[m[1]]) st[prop] = v;
      continue;
    }
    if ((m = c.match(/^decoration-(.+)$/)) && color(m[1])) {
      st.textDecorationColor = color(m[1])!;
      continue;
    }
    // Interaction-only utilities that change nothing in a still frame.
    if (/^(cursor-|transition|duration-|animate-|accent-|no-print|print-only-area|group$|sticky$|top-0$|focus)/.test(c)) continue;
    throw new Error(`tw: unknown class "${c}"`);
  }

  if (leading !== undefined) st.lineHeight = leading;
  const shadows = [ringWidth ? `0 0 0 ${ringWidth}px ${ringColor}` : null, shadow].filter(Boolean);
  if (shadows.length) st.boxShadow = shadows.join(", ");
  // Shorthands first, so a longhand (`!py-3` over `p-4`) wins as it does in Tailwind's output.
  const SHORT = ["padding", "margin", "borderWidth", "borderColor", "gap", "inset", "flex"];
  const ordered: Record<string, string | number> = {};
  for (const k of SHORT) if (k in st) ordered[k] = st[k];
  for (const k of Object.keys(st)) if (!SHORT.includes(k)) ordered[k] = st[k];
  return { style: ordered as CSSProperties, spaceY };
}

/** The viewport width the classes resolve against. */
export const Viewport = createContext(1440);

type BProps = {
  /** Tailwind classes, as the app writes them. */
  c?: string;
  /** Extra style, applied over the classes. */
  s?: CSSProperties;
  as?: keyof React.JSX.IntrinsicElements;
  children?: ReactNode;
  /** Set by a `space-y-*` parent: the gap after this child. */
  spaceAfter?: number;
  /** Extra DOM attributes (an input's type, a select's value). */
  p?: Record<string, unknown>;
};

/**
 * A box with Tailwind classes. `space-y-*` is applied the way v4 does it:
 * margin-block-end on each child but the last, under the child's own margins.
 */
export const B: React.FC<BProps> = ({ c = "", s, as = "div", children, spaceAfter, p }) => {
  const vw = useContext(Viewport);
  const { style, spaceY } = tw(c, vw);
  let kids = children;
  if (spaceY !== undefined) {
    // toArray drops null, false and undefined, as v4's `> :not(:last-child)` only sees rendered children.
    const list = React.Children.toArray(children);
    kids = list.map((k, i) =>
      i < list.length - 1 && React.isValidElement(k)
        ? React.cloneElement(k as React.ReactElement<{ spaceAfter?: number }>, { spaceAfter: spaceY })
        : k
    );
  }
  const Tag = as as React.ElementType;
  return (
    <Tag {...p} style={{ ...(spaceAfter !== undefined ? { marginBottom: spaceAfter } : {}), ...style, ...s }}>
      {kids}
    </Tag>
  );
};
