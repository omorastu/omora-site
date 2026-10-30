"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { people, type Who } from "@/lib/kozmoz";
import { cn } from "@/lib/utils";

/**
 * Whose hands: the home page root and the "pick a name" toggle.
 *
 * Picking a name highlights that person and nothing else: a band of gold
 * lights under their name and their line opens under the hero's hint
 * (kozmoz.css keys both off data-view on this root). Nothing else on the page
 * dims or changes. Picking the same name again closes it; picking the other
 * switches straight across.
 *
 * The root also runs the hero's entrance, once the intro's black has gone or,
 * with no intro, as soon as the fonts are in, one step at a time: the gold
 * ampersand comes up softly (0.4s); then "Ashan Fernando" and "Jordan Lopez"
 * write themselves in together, letter by letter, left to right, first name
 * then last, both in the same 1.8s, so they finish together; and as the
 * first of the last names starts to appear, the hint, the lede and the
 * button rise in together (1s) while the names finish. The names are on
 * the page from the start; the entrance only
 * reveals them, so nothing moves. A scroll, click or key on the way, or an
 * intro cut short, goes straight to the finished hero. Under reduced motion
 * everything is simply there.
 */

type View = Who | "";

const HandsContext = createContext<{ view: View; choose: (who: Who) => void; status: string } | null>(
  null
);

function useHands() {
  const ctx = useContext(HandsContext);
  if (!ctx) throw new Error("Hands components must sit inside <Hands>.");
  return ctx;
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The entrance's steps, in ms: the ampersand, both names together, the rest rising in. */
const AMP_MS = 400;
const WRITE_MS = 1800;
const RISE_MS = 1000;
/** The rise: off gently, and a long, soft settle. */
const RISE_EASE = "cubic-bezier(.3, .55, .25, 1)";
/** Each letter, as a hand draws it: eased in, a steady stroke, eased off. */
const LETTER_EASE = "cubic-bezier(.45, .05, .45, 1)";
/** Across a name, the letters a little slower at its start and end, so it gathers and settles. */
const pace = (u: number) => 0.6 * u + 0.4 * ((1 - Math.cos(Math.PI * u)) / 2);
/** If the intro never says it has cleared, start anyway. */
const INTRO_WAIT = 10000;

export function Hands({ className, children }: { className?: string; children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const viewRef = useRef<View>("");
  const [view, setView] = useState<View>("");
  const [status, setStatus] = useState("");
  // .is-in: the names have been handed to their entrance and may show.
  const [isIn, setIsIn] = useState(false);

  const apply = useCallback((next: View) => {
    viewRef.current = next;
    setView(next);
    setStatus(
      next ? `Showing what ${people[next].name} does.` : "Showing both of us."
    );
  }, []);

  const choose = useCallback(
    (who: Who) => apply(viewRef.current === who ? "" : who),
    [apply]
  );

  /* Entrance: the ampersand, the names writing themselves in, a pause, the rest. */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let cancelled = false;
    let wait = 0;
    /** Ends a running entrance where it would have ended. */
    let settle: (() => void) | null = null;

    const entrance = (finished = false) => {
      if (cancelled) return;
      const hero = el.querySelector<HTMLElement>(".hero");
      const a = el.querySelector<HTMLElement>(".name--a");
      const j = el.querySelector<HTMLElement>(".name--j");
      const amp = el.querySelector<HTMLElement>(".name-amp");
      if (finished || !hero || !a || !j || !amp || reducedMotion() || typeof a.animate !== "function") {
        setIsIn(true);
        return;
      }
      const anims: Animation[] = [];
      /** What the writing puts on the page, to take off again once it's done. */
      const undo: (() => void)[] = [];

      // The ampersand first, softly. The seam (desktop) draws down meanwhile.
      anims.push(
        amp.animate(
          { opacity: [0, 1], transform: ["scale(.97)", "none"] },
          { duration: AMP_MS, easing: "cubic-bezier(.3, .1, .3, 1)", fill: "backwards" }
        )
      );
      const seam = el.querySelector(".seam");
      if (seam) {
        anims.push(seam.animate({ scale: ["1 0", "1 1"] }, { duration: 900, easing: "cubic-bezier(.65, 0, .35, 1)", fill: "backwards" }));
      }

      // Then both names at once, letter by letter, first name then last:
      // each name's letters share the same time, however many there are.
      // The rest rises in as the first of the last names starts.
      let riseAt = AMP_MS + WRITE_MS;
      for (const name of [a, j]) {
        const parts = [...name.querySelectorAll<HTMLElement>(".name-first, .name-last")]
          .map((line) => ({ line, edges: letterEdges(line) }))
          .filter((part) => part.edges.length > 1);
        const count = parts.reduce((n, part) => n + part.edges.length - 1, 0);
        let before = 0;
        for (const { line, edges } of parts) {
          const times = edges.map((_, k) => AMP_MS + pace((before + k) / count) * WRITE_MS);
          before += edges.length - 1;
          if (line.classList.contains("name-last")) riseAt = Math.min(riseAt, times[0]);
          const writing = reveal(line, edges, times);
          anims.push(...writing.anims);
          undo.push(writing.undo);
        }
      }

      // The lines under them rise in together, the names still writing. The
      // hint and the lede sit on paper that breaks the seam: their letters
      // fade in, not the paper, or the seam would show through it.
      const rest = [hero.querySelector(".hint"), hero.querySelector(".lede"), hero.querySelector(":scope > .act")];
      // Whole pixels, so a line's paper waits with crisp edges, not a faint seam of its own.
      const lift = Math.round(parseFloat(getComputedStyle(document.documentElement).fontSize) * 0.875);
      for (const line of rest) {
        if (!line) continue;
        const rise = { duration: RISE_MS, delay: riseAt, easing: RISE_EASE, fill: "backwards" } as const;
        anims.push(line.animate({ transform: [`translateY(${lift}px)`, "none"] }, rise));
        if (line.classList.contains("across")) anims.push(line.animate({ color: ["transparent", getComputedStyle(line).color] }, rise));
        else anims.push(line.animate({ opacity: [0, 1] }, rise));
      }

      // Done, or cut short by a scroll, a click or a key: the hero as it ends.
      // (Every step ends on the page's own styles, so stopping them is finishing them.)
      const cut = ["wheel", "touchmove", "pointerdown", "keydown", "scroll"] as const;
      settle = () => {
        settle = null;
        for (const type of cut) removeEventListener(type, end, true);
        for (const anim of anims) anim.cancel();
        for (const fn of undo) fn();
      };
      const end = () => settle?.();
      for (const type of cut) addEventListener(type, end, { capture: true, passive: true });
      Promise.all(anims.map((anim) => anim.finished)).then(end, () => {});
      setIsIn(true);
    };

    const begin = () => {
      const fontsReady = document.fonts?.ready ?? Promise.resolve();
      Promise.race([fontsReady, new Promise((r) => setTimeout(r, 900))]).then(() => entrance());
    };

    // With the intro up, wait for it to clear (components/intro/intro.tsx);
    // cut short, it leaves the hero finished.
    const intro = window.__kzIntro;
    const go = () => {
      removeEventListener("kz:intro-clear", go);
      clearTimeout(wait);
      if (window.__kzIntro?.skipped) entrance(true);
      else begin();
    };
    if (intro?.show && !intro.done && !intro.clear) {
      addEventListener("kz:intro-clear", go);
      wait = window.setTimeout(go, INTRO_WAIT);
    } else begin();

    return () => {
      cancelled = true;
      removeEventListener("kz:intro-clear", go);
      clearTimeout(wait);
      settle?.();
    };
  }, []);

  return (
    <HandsContext.Provider value={{ view, choose, status }}>
      <div
        ref={root}
        className={cn("kz", className, isIn && "is-in")}
        data-view={view || undefined}
      >
        {children}
      </div>
    </HandsContext.Provider>
  );
}

/**
 * Where a line's letters run, in px from its left edge: where the first
 * begins, then where each one ends.
 */
function letterEdges(line: HTMLElement) {
  const left = line.getBoundingClientRect().left;
  const edges: number[] = [];
  const range = document.createRange();
  const walk = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
  for (let node = walk.nextNode() as Text | null; node; node = walk.nextNode() as Text | null) {
    for (let i = 0; i < node.length; i++) {
      if (/\s/.test(node.data[i])) continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const r = range.getBoundingClientRect();
      if (!r.width) continue;
      if (!edges.length) edges.push(r.left - left);
      edges.push(r.right - left);
    }
  }
  range.detach();
  return edges;
}

/**
 * Writes a line in, left to right: its edge reaches the end of each letter
 * at that letter's time (`times`, ms from the start of the entrance), easing
 * through each. The edge is a clip that reaches past the line's box (the J's
 * hook, the tails above and below), softened by a short fade to the paper
 * riding just inside it.
 */
function reveal(line: HTMLElement, edges: number[], times: number[]) {
  const size = parseFloat(getComputedStyle(line).fontSize);
  const w = line.offsetWidth;
  const h = line.offsetHeight;
  // Room for ink past the box, and the soft edge's width.
  const side = Math.ceil(size * 0.12);
  const tall = Math.ceil(size * 0.4);
  const fade = Math.max(2, size * 0.14);
  const last = edges.length - 1;
  // The edge, letter by letter: clear of the first letter's ink before it, past the last one's after.
  const fronts = edges.map((e, k) => (k === 0 ? e - side : k === last ? e + side + fade : e + fade));
  const span = times[last] - times[0];
  const at = (k: number) => ({ offset: (times[k] - times[0]) / span, easing: LETTER_EASE });
  const timing = { duration: span, delay: times[0], fill: "both" } as const;

  const soft = document.createElement("span");
  soft.setAttribute("aria-hidden", "true");
  Object.assign(soft.style, {
    position: "absolute",
    left: "0",
    top: `${-tall}px`,
    width: `${fade}px`,
    height: `${h + 2 * tall}px`,
    background: "linear-gradient(90deg, transparent, var(--paper))",
    pointerEvents: "none",
  });
  const placed = getComputedStyle(line).position !== "static";
  if (!placed) line.style.position = "relative";
  line.append(soft);
  return {
    anims: [
      line.animate(fronts.map((f, k) => ({ clipPath: `inset(-${tall}px ${w - f}px -${tall}px -${tall}px)`, ...at(k) })), timing),
      soft.animate(fronts.map((f, k) => ({ transform: `translateX(${f - fade}px)`, ...at(k) })), timing),
    ],
    undo: () => {
      soft.remove();
      if (!placed) line.style.removeProperty("position");
    },
  };
}

/**
 * One of the name buttons — the big ones in the hero and the small ones in
 * the header. Pressed while that person is picked.
 */
export function WhoButton({
  who,
  className,
  children,
}: {
  who: Who;
  className: string;
  children: React.ReactNode;
}) {
  const { view, choose } = useHands();
  return (
    <button
      className={className}
      type="button"
      data-who={who}
      aria-pressed={view === who}
      aria-describedby="hands-hint"
      onClick={() => choose(who)}
    >
      {children}
    </button>
  );
}

/** Announces the pick to screen readers; the highlight itself is visual only. */
export function HandsStatus() {
  const { status } = useHands();
  return (
    <p className="sr-only" aria-live="polite">
      {status}
    </p>
  );
}
