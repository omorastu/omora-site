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
 * The root also runs the hero's entrance, once the intro has cleared or, with
 * no intro, as soon as the fonts are in: the gold ampersand drops into place,
 * a gold pen writes "Ashan Fernando" and then "Jordan Lopez" left to right,
 * the letters inking in right behind its nib, and the lede rises in under
 * them, all inside about two seconds. The names are on the page from the
 * start; the entrance only reveals them, so nothing moves. Under reduced
 * motion everything is simply there.
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

/** The entrance's steps, in ms. (The ampersand's drop, about 350ms, is its spring's.) */
const WRITE_AT = 300;
const WRITE_MS = 500;
const WRITE_GAP = 70;
const RISE_MS = 400;
/** A quick start, a steady stroke, a light lift off the end. */
const WRITE_EASE = "cubic-bezier(.42, .1, .45, 1)";
/** If the intro never says it has cleared, start anyway. */
const INTRO_WAIT = 9000;

/**
 * A damped spring sampled into a CSS linear() easing.
 * damping = ratio (<1 overshoots), omega = natural frequency (rad/s).
 */
function spring(damping = 0.58, omega = 13, samples = 40) {
  const wd = omega * Math.sqrt(1 - damping * damping);
  const T = Math.log(1 / 0.004) / (damping * omega);
  const pts: number[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = (T * i) / samples;
    const x =
      1 -
      Math.exp(-damping * omega * t) *
        (Math.cos(wd * t) + ((damping * omega) / wd) * Math.sin(wd * t));
    pts.push(i === samples ? 1 : +x.toFixed(4));
  }
  return { easing: `linear(${pts.join(", ")})`, duration: Math.round(T * 1000) };
}

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

  /* Entrance: the ampersand drops, the pen writes the names, the lede rises. */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let cancelled = false;
    let wait = 0;

    const entrance = () => {
      if (cancelled) return;
      const hero = el.querySelector<HTMLElement>(".hero");
      const a = el.querySelector<HTMLElement>(".name--a");
      const j = el.querySelector<HTMLElement>(".name--j");
      const amp = el.querySelector<HTMLElement>(".name-amp");
      const nib = el.querySelector<HTMLElement>(".nib");
      if (!hero || !a || !j || !amp || !nib || reducedMotion() || typeof a.animate !== "function") {
        setIsIn(true);
        return;
      }

      // The ampersand, a short drop with a slight overshoot. The seam (desktop) draws down meanwhile.
      const drop = spring(0.62, 25);
      amp.animate(
        { transform: ["translateY(-.32em)", "none"] },
        { duration: drop.duration, easing: drop.easing, fill: "backwards" }
      );
      amp.animate({ opacity: [0, 1] }, { duration: 140, easing: "linear", fill: "backwards" });
      el.querySelector(".seam")?.animate(
        { scale: ["1 0", "1 1"] },
        { duration: 900, easing: "cubic-bezier(.65, 0, .35, 1)", fill: "backwards" }
      );

      // Each name written in, left to right: the button's clip opens behind
      // the nib, which rides the clip's edge along the first name's line.
      // Measured by layout (offsets from the hero), not by the screen, which
      // the panel's own lift is still moving.
      const write = (name: HTMLElement, at: number) => {
        const first = name.querySelector<HTMLElement>(".name-first") ?? name;
        const size = parseFloat(getComputedStyle(name).fontSize);
        const w = name.offsetWidth;
        // Room for ink past the box: the J's hook on the left, tails above and below.
        const side = Math.ceil(size * 0.08);
        const tall = Math.ceil(size * 0.3);
        const timing = { duration: WRITE_MS, delay: at, easing: WRITE_EASE };
        name.animate(
          { clipPath: [`inset(-${tall}px ${w + side}px -${tall}px -${side}px)`, `inset(-${tall}px -${side}px -${tall}px -${side}px)`] },
          { ...timing, fill: "backwards" }
        );
        const x0 = name.offsetLeft - side;
        const x1 = name.offsetLeft + w + side;
        const y = first.offsetTop + first.offsetHeight * 0.62;
        nib.animate(
          [
            { transform: `translate(${x0}px, ${y}px)`, opacity: 0 },
            { opacity: 1, offset: 0.06 },
            { opacity: 1, offset: 0.86 },
            { transform: `translate(${x1}px, ${y}px)`, opacity: 0 },
          ],
          timing
        );
        // The hand's own small rise and fall as it writes.
        const bob = size * 0.035;
        nib.firstElementChild?.animate(
          { translate: ["0 0", `0 ${-bob}px`, `0 ${bob * 0.7}px`, `0 ${-bob * 0.5}px`, "0 0"] },
          { duration: WRITE_MS, delay: at, easing: "linear" }
        );
      };
      write(a, WRITE_AT);
      write(j, WRITE_AT + WRITE_MS + WRITE_GAP);

      // Then the lines under them rise in, quick, with no long settle. The
      // hint and the lede sit on paper that breaks the seam: their letters
      // fade in, not the paper, or the seam would show through it.
      const riseAt = WRITE_AT + 2 * WRITE_MS + 2 * WRITE_GAP;
      const lines = [hero.querySelector(".hint"), hero.querySelector(".lede"), hero.querySelector(":scope > .act")];
      lines.forEach((line, i) => {
        if (!line) return;
        const rise = { duration: RISE_MS, delay: riseAt + (i === 2 ? 60 : 0), easing: "cubic-bezier(.2, .7, .3, 1)", fill: "backwards" } as const;
        line.animate({ transform: ["translateY(.875rem)", "none"] }, rise);
        if (line.classList.contains("across")) line.animate({ color: ["transparent", getComputedStyle(line).color] }, rise);
        else line.animate({ opacity: [0, 1] }, rise);
      });
      setIsIn(true);
    };

    const begin = () => {
      const fontsReady = document.fonts?.ready ?? Promise.resolve();
      Promise.race([fontsReady, new Promise((r) => setTimeout(r, 900))]).then(entrance);
    };

    // With the intro up, wait for it to clear (components/intro/intro.tsx).
    const intro = window.__kzIntro;
    const go = () => {
      removeEventListener("kz:intro-clear", go);
      clearTimeout(wait);
      begin();
    };
    if (intro?.show && !intro.done && !intro.clear) {
      addEventListener("kz:intro-clear", go);
      wait = window.setTimeout(go, INTRO_WAIT);
    } else begin();

    return () => {
      cancelled = true;
      removeEventListener("kz:intro-clear", go);
      clearTimeout(wait);
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
