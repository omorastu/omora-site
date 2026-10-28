"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { people, type Who } from "@/lib/kozmoz";
import { cn } from "@/lib/utils";

/**
 * Whose hands: the home page root and the "pick a name" toggle.
 *
 * Picking a name highlights that person and nothing else: their name lights
 * up in their own ink and their line opens under the hero's hint (kozmoz.css
 * keys both off data-view on this root). Nothing else on the page dims or
 * changes. Picking the same name again closes it; picking the other switches
 * straight across.
 *
 * The root also runs the names' entrance in the hero.
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
