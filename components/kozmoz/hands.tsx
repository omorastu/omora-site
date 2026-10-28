"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { people, type Who } from "@/lib/kozmoz";
import { cn } from "@/lib/utils";

/**
 * Whose hands: the page root and the "pick a name" toggle.
 *
 * Picking a name dims everything that isn't that person's (kozmoz.css keys
 * the dimming off data-view on this root); picking it again shows both. The
 * change runs as a view transition that opens from the chosen person's side
 * of the page, or from the seam when going back to both.
 *
 * The root also runs the two pieces of motion that span sections: the names'
 * entrance in the hero, and the seam's starting length.
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
const phone = () => window.matchMedia("(max-width: 1023px)").matches;

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
  // .vt: a view transition is swapping the page; per-element fades step aside.
  const [vt, setVt] = useState(false);
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
    (who: Who) => {
      const next = viewRef.current === who ? "" : who;
      if (reducedMotion() || typeof document.startViewTransition !== "function") {
        apply(next);
        return;
      }
      flushSync(() => setVt(true));
      const transition = document.startViewTransition(() => flushSync(() => apply(next)));
      transition.ready
        .then(() => {
          // The new state opens from the chosen person's side; "both" opens from the seam.
          const from =
            next === "a" ? "inset(0 100% 0 0)" : next === "j" ? "inset(0 0 0 100%)" : "inset(0 50% 0 50%)";
          document.documentElement.animate(
            { clipPath: [from, "inset(0 0 0 0)"] },
            {
              duration: 700,
              easing: "cubic-bezier(.31, .13, .11, 1)",
              pseudoElement: "::view-transition-new(root)",
            }
          );
        })
        .catch(() => {});
      transition.finished.finally(() => setVt(false));
    },
    [apply]
  );

  /* Entrance: the names spring to the seam, then the & settles. */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let cancelled = false;

    const entrance = () => {
      if (cancelled) return;
      const a = el.querySelector<HTMLElement>(".name--a");
      const j = el.querySelector<HTMLElement>(".name--j");
      const amp = el.querySelector<HTMLElement>(".name-amp");
      const seam = el.querySelector<HTMLElement>(".seam");
      if (!a || !j || !amp || reducedMotion() || typeof a.animate !== "function") {
        setIsIn(true);
        return;
      }
      const s = spring(0.58, 13);
      const settle = spring(0.5, 15);
      const fade: KeyframeAnimationOptions = { duration: 320, easing: "linear", fill: "backwards" };

      if (!phone()) {
        // Each name starts out in its own half, never past the page margin.
        // Same travel for both, never past the viewport edge.
        const ra = a.getBoundingClientRect();
        const rj = j.getBoundingClientRect();
        const d = Math.max(0, Math.min(ra.left - 8, innerWidth - 8 - rj.right, innerWidth * 0.1));
        const move = { duration: s.duration, easing: s.easing, fill: "backwards" } as const;
        a.animate({ transform: [`translateX(${-d}px)`, "none"] }, move);
        j.animate({ transform: [`translateX(${d}px)`, "none"] }, move);
        a.animate({ opacity: [0, 1] }, fade);
        j.animate({ opacity: [0, 1] }, fade);
        seam?.animate(
          { scale: ["1 0", "1 1"] },
          { duration: 900, easing: "cubic-bezier(.65, 0, .35, 1)", fill: "backwards" }
        );
        amp.animate(
          { transform: ["translateY(-.3em) rotate(-16deg)", "none"] },
          { duration: settle.duration, easing: settle.easing, delay: 360, fill: "backwards" }
        );
        amp.animate({ opacity: [0, 1] }, { ...fade, delay: 360 });
      } else {
        // Phones: a short rise, no sideways travel.
        [a, amp, j].forEach((n, i) => {
          n.animate(
            { transform: ["translateY(1.25rem)", "none"] },
            { duration: s.duration, easing: s.easing, delay: i * 90, fill: "backwards" }
          );
          n.animate({ opacity: [0, 1] }, { ...fade, delay: i * 90 });
        });
      }
      setIsIn(true);
    };

    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    Promise.race([fontsReady, new Promise((r) => setTimeout(r, 900))]).then(entrance);
    return () => {
      cancelled = true;
    };
  }, []);

  /* The seam's drawn tip sits ~3/4 down the screen at the top of the page. */
  useEffect(() => {
    const main = root.current?.querySelector<HTMLElement>("main");
    const seam = main?.querySelector<HTMLElement>(".seam");
    if (!main || !seam) return;

    const seamStart = () => {
      const top = main.getBoundingClientRect().top + scrollY;
      const from = (innerHeight * 0.74 - top) / main.offsetHeight;
      seam.style.setProperty("--seam-from", Math.max(0.02, Math.min(1, from)).toFixed(4));
    };

    seamStart();
    const ro = "ResizeObserver" in window ? new ResizeObserver(seamStart) : null;
    ro?.observe(main);
    addEventListener("resize", seamStart);
    return () => {
      ro?.disconnect();
      removeEventListener("resize", seamStart);
    };
  }, []);

  return (
    <HandsContext.Provider value={{ view, choose, status }}>
      <div
        ref={root}
        className={cn("kz", className, isIn && "is-in", vt && "vt")}
        data-view={view || undefined}
      >
        {children}
      </div>
    </HandsContext.Provider>
  );
}

/**
 * One of the name buttons — the big ones in the hero and the small ones in
 * the header. Pressed while that person's view is on.
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
      data-hands={who}
      aria-pressed={view === who}
      aria-describedby="hands-hint"
      onClick={() => choose(who)}
    >
      {children}
    </button>
  );
}

/** Announces the view change to screen readers; the dimming itself is visual only. */
export function HandsStatus() {
  const { status } = useHands();
  return (
    <p className="sr-only" aria-live="polite">
      {status}
    </p>
  );
}
