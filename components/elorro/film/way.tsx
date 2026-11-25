"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { hanken } from "@/components/elorro/fonts";
import { IntroCard, armShine } from "@/components/intro/intro";
import { dust, mist } from "@/components/elorro/film/mist";
import { cn } from "@/lib/utils";

/**
 * The way in to the film (/film, over the whole page). It opens on the home
 * page's own intro (components/intro/intro.tsx's IntroCard, on its timeline
 * and in its type): the gold ELORRO, the small gold rule, and "Two people
 * who listen first, then build what adds real value to your business." burned
 * in under it. After its hold, the line turns to gold mist and drifts off
 * (mist.ts), the rule fades and the logo goes small to the top. Then the door
 * comes up, on its own, ajar, warm light at its gap; then, together, the
 * welcome forms out of gold dust at the top (the mist in reverse), settling
 * in the intro's own gold, and "Open the door to see what it's about." comes
 * up at the bottom.
 *
 * The door's tap (or Enter, or Space) is the gesture the film needs for her
 * voice and its videos (film.tsx): the door swings open and the camera goes
 * through it, into the film, which starts behind it.
 *
 * `stage`: "in" plays it all; "door" (back from the film) is at the door,
 * welcome and all, already; "through" is the way through, once opened.
 *
 * Reduced motion: no mist, no dust, no swing or push: the intro is simply
 * there (as the home page's is), then fades to the door, then the welcome
 * and the line under the door fade in; the tap goes straight to the film.
 */

/** The intro's hold, as the home page's (intro.tsx's HOLD_END), then the door, then the welcome, in ms from the start. */
const HOLD_MS = 4200;
const DOOR_MS = HOLD_MS + 1300;
const WELCOME_MS = DOOR_MS + 1500;
/** The same, with reduced motion (the home page's own hold is shorter then: REDUCED_HOLD_END). */
const STILL = { hold: 3200, door: 3900, welcome: 4800 };

type Phase = "intro" | "mist" | "door" | "welcome";

/**
 * Where the logo goes, small, at the top: its move from where the intro set
 * it, and its scale, as CSS variables on the way's root (film.css). Measured
 * from the logo's own box, which a transform doesn't move.
 */
function placeLogo(root: HTMLElement) {
  const mark = root.querySelector<HTMLElement>(".elo-intro-mark");
  const inner = root.querySelector<HTMLElement>(".elo-intro-inner");
  if (!mark || !inner) return;
  const w = innerWidth;
  const h = innerHeight;
  const flat = h < 560 && w > h;
  // A quiet header, not a headline: its width at the top, 67 px on a desktop (some 11 px tall), 50 on a phone, 43 on its side.
  const width = flat ? 43 : w < 600 ? 50 : 67;
  const cy = Math.max(flat ? 24 : 34, h * (flat ? 0.07 : w < 600 ? 0.065 : 0.075));
  const x = inner.offsetLeft + mark.offsetLeft + mark.offsetWidth / 2;
  const y = inner.offsetTop + mark.offsetTop + mark.offsetHeight / 2;
  root.style.setProperty("--lx", `${(w / 2 - x).toFixed(1)}px`);
  root.style.setProperty("--ly", `${(cy - y).toFixed(1)}px`);
  root.style.setProperty("--ls", (width / mark.offsetWidth).toFixed(4));
}

export function FilmWay({ stage, onOpen }: { stage: "in" | "door" | "through"; onOpen: () => void }) {
  const [phase, setPhase] = useState<Phase>(stage === "in" ? "intro" : "welcome");
  /** Back from the film: at the door, all of it there at once. */
  const [back] = useState(stage !== "in");
  const root = useRef<HTMLDivElement>(null);
  const welcome = useRef<HTMLHeadingElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const dustCanvas = useRef<HTMLCanvasElement>(null);
  const door = useRef<HTMLButtonElement>(null);
  const opened = useRef(false);
  /** The door, opened: once. */
  const open = useCallback(() => {
    if (opened.current) return;
    opened.current = true;
    onOpen();
  }, [onOpen]);

  // Up over the page: the page's own dark cover, there since its first paint (app/film/page.tsx), can go.
  useLayoutEffect(() => {
    document.documentElement.classList.remove("way-boot");
  }, []);

  // The logo's shine, as on the home page (not under reduced motion).
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return armShine(el);
  }, []);

  // Back at the door: the logo at the top and the welcome whole from the first frame.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || !back) return;
    el.dataset.instant = "";
    placeLogo(el);
    welcome.current?.style.setProperty("--wipe", "100000px");
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => delete el.dataset.instant));
    return () => cancelAnimationFrame(raf);
  }, [back]);

  // The intro's hold; then the line to mist, the rule out and the logo up; then the door; then the welcome, from dust.
  useEffect(() => {
    if (stage !== "in" || back) return;
    const el = root.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const at = still ? STILL : { hold: HOLD_MS, door: DOOR_MS, welcome: WELCOME_MS };
    const timers: number[] = [];
    const anims: Animation[] = [];
    const runs: { stop(): void }[] = [];
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const fadeOut = (sel: string, ms: number) => {
      for (const w of el.querySelectorAll<HTMLElement>(sel)) {
        anims.push(w.animate({ opacity: [Number(getComputedStyle(w).opacity), 0] }, { duration: ms, easing: "ease", fill: "forwards" }));
      }
    };
    later(at.hold, async () => {
      placeLogo(el);
      if (still) {
        fadeOut(".elo-intro-rule, .elo-intro-def", 600);
        setPhase("mist");
        return;
      }
      await document.fonts?.ready;
      const def = el.querySelector<HTMLElement>(".elo-intro-def");
      const cut = el.querySelector<HTMLElement>(".elo-intro-cut");
      fadeOut(".elo-intro-rule", 700);
      if (def && cut && canvas.current) runs.push(mist(def, canvas.current, cut));
      setPhase("mist");
    });
    later(at.door, () => setPhase("door"));
    later(at.welcome, () => {
      if (!still && welcome.current && dustCanvas.current) runs.push(dust(welcome.current, dustCanvas.current));
      setPhase("welcome");
    });
    return () => {
      timers.forEach(clearTimeout);
      anims.forEach((a) => a.cancel());
      runs.forEach((r) => r.stop());
    };
  }, [stage, back]);

  // A new size, once the logo's gone up: its place at the top again, at once.
  useEffect(() => {
    if (phase === "intro") return;
    const el = root.current;
    if (!el) return;
    const onResize = () => {
      el.dataset.instant = "";
      placeLogo(el);
      requestAnimationFrame(() => requestAnimationFrame(() => delete el.dataset.instant));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [phase]);

  // At the door: the focus on it; Enter or Space anywhere opens it.
  const atDoor = phase === "door" || phase === "welcome";
  useEffect(() => {
    if (!atDoor || stage === "through") return;
    const focus = window.setTimeout(() => door.current?.focus({ preventScroll: true }), 400);
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        open();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(focus);
      document.removeEventListener("keydown", onKey);
    };
  }, [atDoor, stage, open]);

  // Going through: the camera pushes in on the doorway's middle.
  useLayoutEffect(() => {
    if (stage !== "through" || !root.current || !door.current) return;
    const r = door.current.querySelector(".way-doorway")?.getBoundingClientRect();
    if (!r) return;
    root.current.style.setProperty("--door-x", `${r.left + r.width / 2}px`);
    root.current.style.setProperty("--door-y", `${r.top + r.height / 2}px`);
  }, [stage]);

  useEffect(() => {
    if (stage === "door") opened.current = false;
  }, [stage]);

  return (
    <div
      ref={root}
      className={cn("way elo-intro-host", hanken.variable, `is-${phase}`, atDoor && "is-at-door", back && "is-back", stage === "through" && "is-through")}
      aria-label="Elorro"
      role="region"
    >
      <div className="way-stage">
        <h1 className="way-sr">Elorro: two people who listen first, then build what adds real value to your business.</h1>
        <div className="way-intro" aria-hidden="true">
          <IntroCard />
        </div>
        <div className="way-welcome" aria-hidden={!atDoor}>
          {/* In the intro's own gold: its line's style (intro.css, .elo-intro-cut), cut into the stone. */}
          <h2 ref={welcome} className="way-h">
            <span className="elo-intro-cut">
              Welcome to the <span className="way-h-us">Ashan &amp; Jordan experience.</span>
            </span>
          </h2>
          <button ref={door} type="button" className="way-door" onClick={open} tabIndex={atDoor ? 0 : -1}>
            <span className="way-door-at" aria-hidden="true">
              <span className="way-doorway">
                <span className="way-light" />
                <span className="way-hinge">
                  <span className="way-leaf">
                    <span className="way-panel" />
                    <span className="way-panel" />
                    <span className="way-knob" />
                  </span>
                </span>
                <svg className="way-frame" viewBox="0 0 100 210" preserveAspectRatio="none" focusable="false">
                  <rect x="0.5" y="0.5" width="99" height="209" />
                  <rect className="way-frame-in" x="5" y="5" width="90" height="205" />
                </svg>
              </span>
              <span className="way-spill" />
            </span>
            <span className="way-note">
              <span className="way-note-in">Open the door to see what it’s about.</span>
            </span>
          </button>
        </div>
      </div>
      <canvas ref={canvas} className="way-mist" aria-hidden="true" />
      <canvas ref={dustCanvas} className="way-mist" aria-hidden="true" />
    </div>
  );
}
