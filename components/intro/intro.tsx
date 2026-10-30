"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { createSmoke, type Smoke } from "@/components/intro/smoke";
import "@/components/intro/intro.css";

/**
 * The intro: near-black, full screen, before anything else of the home page
 * shows, on a visitor's first page load of the session. The Elorro logo (the
 * gold lettering with its runners, public/m/brand/elorro-logo.png) fades in
 * on the black, then the line under it burns in, left to right behind a
 * glowing edge, and settles as gold cut into the stone.
 *
 *   0–0.75s    the logo fades in, then the gold rule draws (intro.css)
 *   0.85s      a band of light glides across the gold, once (1.6s), and
 *              once more, fainter, during the hold (2.8–4.3s)
 *   0.75–2s    the line burns in (intro.css); the hold runs to 4.2s, and
 *              with a mouse the pointer bends the logo a little (smoke.ts)
 *   4.2s       the line dims out (0.25s), then the black slides off to the
 *              left in one piece (0.8s), uncovering the page from the right,
 *              while the logo flies over it to the header's wordmark, turning
 *              into it as it lands, just as the last of the black goes
 *
 * The hero comes in once the black has gone ("kz:intro-clear",
 * components/kozmoz/hands.tsx). A click, tap, key or scroll goes straight to
 * the page, finished: a quick fade, no flight, and the hero already in. Under
 * reduced motion the logo and the line are simply there, held a moment, then
 * the black fades away.
 * While it shows, the browser's chrome is near-black too.
 *
 * The decision to show it is made by a tiny inline script during the first
 * paint, from sessionStorage and the referrer, so a returning or internal
 * visit never sees a flash of it; the page underneath is rendered from the
 * start. If that script can't run, there is no intro. If it runs but the
 * page's JavaScript never arrives, intro.css fades the overlay out on its own.
 *
 * Preview it again: open the page in a new tab or window, or add ?intro.
 */

/** Timeline, in ms from the first paint. */
const HOLD_END = 4200;
/** The line and the rule dim out, before the black moves. */
const DIM = 250;
/** The black sliding off to the left; the logo's flight to the header takes the same time, on the same curve. */
const SLIDE = 800;
const SLIDE_EASE = "cubic-bezier(.37, 0, .63, 1)";
/** Reduced motion: a hold, then a plain fade. */
const REDUCED_HOLD_END = 3200;
const FADE = 600;
/** A click, key or scroll: straight to the page. */
const SKIP = 250;
/** From here intro.css's fallback owns the exit (keep in step with intro.css and BOOT). */
const FALLBACK_AT = 5200;
/** If nothing else has, the overlay goes at this point regardless. */
const FAILSAFE = 8000;
/** The logo has faded in: from here the mouse may stir it. */
const ENTERED = 800;

const KEY = "kz-intro";
/** The black, here and in intro.css (--night), and the browser chrome while the intro shows. */
const NIGHT = "#0C0A08";

/**
 * The line under the logo, broken by hand so it wraps evenly: two lines, or
 * three on a phone (intro.css shows each set of breaks where it belongs).
 */
const DEFINITION: React.ReactNode = (
  <>
    Two people who listen first,<br className="kz-intro-narrow" /> then build<br className="kz-intro-wide" /> what adds
    real<br className="kz-intro-narrow" /> value to your business.
  </>
);

/** The logo file's own size, so its box is reserved before it loads, and where its letters sit in it. */
const LOGO = { src: "/m/brand/elorro-logo.png", width: 1695, height: 287, ink: { left: 24, right: 1670 } };

/**
 * Runs as the overlay is parsed, before the first paint. Shows the overlay
 * (by adding a style rule — it touches nothing React renders) only on the
 * session's first load, and not when arriving from another page of the
 * site. The same rule holds back the hero's own fallback (kozmoz.css,
 * --kz-wait) and the header's wordmark (the logo lands on it) until the
 * overlay's fallback has run; a theme-color ahead of the page's darkens the
 * browser's chrome, and goes again by then if nothing has taken over.
 */
const BOOT = `(function(){var show=false,q=/[?&]intro(=|&|$)/.test(location.search);try{var r=document.referrer,inside=false;try{inside=!!r&&new URL(r).origin===location.origin}catch(e){}var seen=sessionStorage.getItem("${KEY}");sessionStorage.setItem("${KEY}","1");show=!seen&&!inside}catch(e){}show=show||q;var b=window.__kzIntro={show:show,t0:performance.now()};if(show){var s=document.createElement("style");s.id="${KEY}-boot";s.textContent="html .kz-intro{display:block}html{--kz-wait:${(FALLBACK_AT + FADE + 200) / 1000}s}.kz .top .brand .wordmark{animation:kz-intro-word ${FALLBACK_AT + FADE}ms}";document.head.appendChild(s);var m=document.createElement("meta");m.name="theme-color";m.content="${NIGHT}";m.id="${KEY}-theme";document.head.prepend(m);setTimeout(function(){if(!b.live)m.remove()},${FALLBACK_AT + FADE})}})();`;

/**
 * Set by the boot script; `live` once this has taken over, `clear` once the
 * page shows through (`skipped` if a click, key or scroll cut it short),
 * `done` once the overlay has gone.
 */
type Boot = { show: boolean; t0: number; live?: boolean; clear?: boolean; skipped?: boolean; done?: boolean };

declare global {
  interface Window {
    __kzIntro?: Boot;
  }
}

const noSubscribe = () => () => {};
/** True on the server and while hydrating; false for any render after that. */
const useFirstRender = () =>
  useSyncExternalStore(
    noSubscribe,
    () => false,
    () => true
  );

export function Intro() {
  const firstRender = useFirstRender();
  // Mounted later on the client (navigating back to the home page)? Nothing to show.
  const [on, setOn] = useState(() => {
    if (typeof window === "undefined") return true;
    const boot = window.__kzIntro;
    return !!boot?.show && !boot.done;
  });
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = root.current;
    const cv = canvas.current;
    const boot = window.__kzIntro;
    if (!el || !cv || !boot?.show || boot.done) {
      setOn(false);
      return;
    }
    return play(el, cv, boot, () => {
      boot.done = true;
      setOn(false);
    });
  }, []);

  // While hydrating, render exactly what the server sent, shown or not.
  if (!on && !firstRender) return null;

  return (
    <div ref={root} className="kz-intro" aria-hidden="true">
      {firstRender && <script dangerouslySetInnerHTML={{ __html: BOOT }} />}
      <div className="kz-intro-ground">
        <canvas ref={canvas} className="kz-intro-canvas" />
      </div>
      <div className="kz-intro-inner">
        <span className="kz-intro-mark">
          <Image
            className="kz-intro-logo"
            src={LOGO.src}
            width={LOGO.width}
            height={LOGO.height}
            sizes="min(680px, 90vw)"
            alt=""
            loading="eager"
            fetchPriority="high"
            data-picture=""
          />
          {/* The shine: light across the gold, only where the gold is (intro.css). */}
          <span className="kz-intro-shine" />
        </span>
        <span className="kz-intro-rule" />
        {/* The line twice over: cut in gold, and the burn's glowing edge, laid on it. */}
        <p className="kz-intro-def">
          <span className="kz-intro-cut">{DEFINITION}</span>
          <span className="kz-intro-ember">{DEFINITION}</span>
        </p>
        {/* The old tagline, out for now: "When everything works the way it should, and looks the way it should." */}
      </div>
      <Engrave />
    </div>
  );
}

/**
 * The cut (intro.css applies it to the gold): inside each letter, along its
 * top, the shadow of the cut's upper wall; just above it, the faint light
 * on the stone's edge.
 */
function Engrave() {
  return (
    <svg className="kz-intro-filters" width="0" height="0" focusable="false">
      <filter id="kz-engrave" x="-5%" y="-15%" width="110%" height="130%" colorInterpolationFilters="sRGB">
        <feOffset in="SourceAlpha" dy="0.7" result="down" />
        <feGaussianBlur in="down" stdDeviation="0.35" result="downSoft" />
        <feComposite in="SourceAlpha" in2="downSoft" operator="out" result="topEdge" />
        <feFlood floodColor="#2A1804" floodOpacity="0.6" />
        <feComposite in2="topEdge" operator="in" result="shade" />
        <feOffset in="SourceAlpha" dy="-0.75" result="up" />
        <feComposite in="up" in2="SourceAlpha" operator="out" result="rim" />
        <feGaussianBlur in="rim" stdDeviation="0.2" result="rimSoft" />
        <feFlood floodColor="#FFF0CC" floodOpacity="0.32" />
        <feComposite in2="rimSoft" operator="in" result="light" />
        <feMerge>
          <feMergeNode in="light" />
          <feMergeNode in="SourceGraphic" />
          <feMergeNode in="shade" />
        </feMerge>
      </filter>
    </svg>
  );
}

/**
 * Runs the intro from wherever its timeline has got to, and calls `finish`
 * once the overlay is gone. Returns a cleanup that undoes everything it set
 * up (React may run it early, in development, and run play() again).
 */
function play(el: HTMLDivElement, cv: HTMLCanvasElement, boot: Boot, finish: () => void) {
  const since = () => performance.now() - boot.t0;
  const timers: number[] = [];
  const offs: (() => void)[] = [];
  const anims: Animation[] = [];
  const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, Math.max(0, ms)));
  const on = <K extends keyof HTMLElementEventMap>(
    target: HTMLElement | Window,
    type: K,
    fn: (e: HTMLElementEventMap[K]) => void,
    opts?: AddEventListenerOptions
  ) => {
    target.addEventListener(type, fn as EventListener, opts);
    offs.push(() => target.removeEventListener(type, fn as EventListener, opts));
  };
  const ground = el.querySelector<HTMLElement>(".kz-intro-ground");

  let smoke: Smoke | null = null;
  let fading: Animation | null = null;
  /** Stops the logo's flight and takes its copy away. */
  let landing: (() => void) | null = null;
  let leaving = false;
  let ended = false;

  function cleanup() {
    timers.forEach(clearTimeout);
    timers.length = 0;
    offs.forEach((off) => off());
    offs.length = 0;
    landing?.();
    landing = null;
    smoke?.destroy();
    smoke = null;
    fading?.cancel();
    fading = null;
    anims.forEach((a) => a.cancel());
    anims.length = 0;
    delete el.dataset.live;
    delete el.dataset.mode;
    delete el.dataset.leaving;
    delete el.dataset.flying;
  }

  /** The page is there: the hero can come in. */
  function clear() {
    if (boot.clear) return;
    boot.clear = true;
    window.dispatchEvent(new Event("kz:intro-clear"));
  }

  /** Gone: the browser's chrome and the header's wordmark are the page's again. */
  function end() {
    if (ended) return;
    ended = true;
    cleanup();
    clear();
    document.getElementById(`${KEY}-theme`)?.remove();
    document.getElementById(`${KEY}-boot`)?.remove();
    finish();
  }

  // Hydrated so late that intro.css's fallback is already fading it out: let it finish.
  if (since() >= FALLBACK_AT) {
    later(FALLBACK_AT + FADE - since(), end);
    return cleanup;
  }

  boot.live = true;
  el.dataset.live = ""; // from here the script owns the exit, not the CSS fallback
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The shine is cut to the logo's own picture, the file the page already has: it shows once that's in.
  const logo = el.querySelector<HTMLImageElement>(".kz-intro-logo");
  const shine = el.querySelector<HTMLElement>(".kz-intro-shine");
  if (logo && shine && !reduced) {
    const arm = () => {
      if (!logo.naturalWidth) return;
      shine.style.setProperty("--logo", `url("${logo.currentSrc || logo.src}")`);
      shine.dataset.on = "";
    };
    if (logo.complete) arm();
    else on(logo, "load", arm, { once: true });
  }
  const mouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const getSmoke = () => {
    if (!smoke) {
      try {
        smoke = createSmoke(el, cv);
      } catch {
        smoke = null;
      }
    }
    return smoke;
  };

  function fade(ms: number) {
    fading?.cancel();
    fading = el.animate({ opacity: [Number(getComputedStyle(el).opacity), 0] }, { duration: ms, easing: "ease", fill: "forwards" });
    fading.onfinish = end;
  }

  /** Let clicks through to the page again — after the press that started this has let go. */
  function release(cause: string) {
    const free = () => (el.dataset.leaving = "");
    if (cause === "pointer") {
      const up = () => later(60, free);
      on(el, "pointerup", up, { once: true });
      on(el, "pointercancel", up, { once: true });
      later(900, free);
    } else later(200, free);
  }

  /** The way out, on time: the words dim, then the black slides away and the logo flies. */
  function leave() {
    if (leaving) return;
    leaving = true;
    release("timer");
    if (reduced) return clear(), fade(FADE);
    for (const w of el.querySelectorAll<HTMLElement>(".kz-intro-rule, .kz-intro-def")) {
      anims.push(w.animate({ opacity: [Number(getComputedStyle(w).opacity), 0] }, { duration: DIM, easing: "ease-in", fill: "forwards" }));
    }
    later(DIM, slide);
  }

  /**
   * The black slides off to the left in one piece, its straight edge
   * crossing the screen from right to left, onto the page; the logo flies to
   * the header meanwhile, over it, in step with it.
   */
  function slide() {
    if (!ground) return clear(), fade(FADE);
    const door = { transform: ["none", "translateX(-100%)"] };
    const timing: KeyframeAnimationOptions = { duration: SLIDE, easing: SLIDE_EASE, fill: "both" };
    const black = ground.animate(door, timing);
    anims.push(black);
    landing = fly(el, () => Number(black.effect?.getComputedTiming().progress ?? 0));
    if (landing) {
      smoke?.release();
      el.dataset.flying = "";
    } else {
      // Nothing to land on: the logo goes with the black.
      const inner = el.querySelector<HTMLElement>(".kz-intro-inner");
      if (inner) anims.push(inner.animate(door, timing));
    }
    black.onfinish = end;
  }

  /** A click, key or scroll: straight to the page. */
  function skip(cause: string) {
    if (ended) return;
    if (!leaving) release(cause);
    leaving = true;
    if (!boot.clear) boot.skipped = true;
    clear();
    fade(SKIP);
  }

  // On its own: leave after the hold.
  later((reduced ? REDUCED_HOLD_END : HOLD_END) - since(), leave);
  // And whatever happens, never leave the overlay up.
  later(FAILSAFE - since(), end);

  // Early: any press, key or scroll.
  on(el, "pointerdown", () => skip("pointer"));
  on(window, "keydown", (e) => {
    if (!["Shift", "Control", "Alt", "Meta"].includes(e.key)) skip("key");
  });
  on(el, "wheel", () => skip("wheel"), { passive: true });

  // With a mouse, the pointer stirs the logo once it has faded in.
  if (mouse && !reduced) {
    let at: [number, number] | null = null;
    const stir = () => {
      if (leaving || !at) return;
      if (getSmoke()?.interactive()) smoke!.pointer(at[0], at[1]);
    };
    on(el, "pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      at = [e.clientX, e.clientY];
      smoke?.pointer(e.clientX, e.clientY);
      if (since() >= ENTERED) stir();
    });
    on(el, "pointerleave", () => smoke?.pointer(null));
    later(ENTERED - since(), stir);
  }

  // The canvas is sized to the screen it started on: on a new size, the page's logo takes over again.
  on(window, "resize", () => {
    if (!smoke || leaving) return;
    smoke.destroy();
    smoke = null;
    delete el.dataset.mode;
  });

  return cleanup;
}

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** The wordmark's look, as the header sets it, for its copy outside the page's styles. */
const WORDMARK_STYLE = [
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "letter-spacing",
  "line-height",
  "text-transform",
  "color",
  "background-image",
  "-webkit-background-clip",
  "background-clip",
  "-webkit-text-fill-color",
];

/**
 * The logo's flight: as `progress` goes from 0 to 1 (the black's slide) it
 * shrinks and moves onto the header's wordmark, crossfading at the very end
 * into a copy of it, which then stays exactly over the wordmark (followed,
 * should the page move) until the overlay has gone. The wordmark itself is
 * held hidden until then, so there's only ever the one. Returns what stops
 * it, or null if there's no wordmark in view to land on.
 */
function fly(el: HTMLElement, progress: () => number): (() => void) | null {
  const logo = el.querySelector<HTMLImageElement>(".kz-intro-logo");
  const target = document.querySelector<HTMLElement>(".top .brand .wordmark");
  if (!logo?.complete || !logo.naturalWidth || !target) return null;
  const from = logo.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if (!from.width || !to.width || to.bottom <= 0 || to.top >= innerHeight) return null;

  const css = getComputedStyle(target);
  const word = document.createElement("span");
  word.textContent = target.textContent;
  for (const prop of WORDMARK_STYLE) word.style.setProperty(prop, css.getPropertyValue(prop));
  word.style.opacity = "0";

  // Landed, the logo's letters cover the wordmark's: its run, less the
  // tracking after the last letter, centred on its line.
  const k = (to.width - (parseFloat(css.letterSpacing) || 0)) / (LOGO.ink.right - LOGO.ink.left);
  const pic = logo.cloneNode() as HTMLImageElement;
  pic.removeAttribute("class");
  const pw = LOGO.width * k;
  const ph = LOGO.height * k;
  const px = -LOGO.ink.left * k;
  const py = (to.height - ph) / 2;
  Object.assign(pic.style, { left: `${px}px`, top: `${py}px`, width: `${pw}px`, height: `${ph}px` });

  const flyer = document.createElement("div");
  flyer.className = "kz-intro-flyer";
  Object.assign(flyer.style, { width: `${to.width}px`, height: `${to.height}px` });
  flyer.append(pic, word);

  // Taking off, the logo's copy sits exactly on the logo.
  const s0 = from.width / pw;
  const x0 = from.left - px * s0;
  const y0 = from.top - py * s0;
  let raf = 0;
  const frame = () => {
    const p = Math.min(1, Math.max(0, progress()));
    const at = target.getBoundingClientRect();
    const s = Math.exp(Math.log(s0) * (1 - p));
    flyer.style.transform = `translate(${x0 + (at.left - x0) * p}px, ${y0 + (at.top - y0) * p}px) scale(${s})`;
    pic.style.opacity = String(1 - smooth(0.8, 1, p));
    word.style.opacity = String(smooth(0.76, 0.97, p));
    raf = requestAnimationFrame(frame);
  };
  frame();
  el.append(flyer);
  target.style.visibility = "hidden";

  return () => {
    cancelAnimationFrame(raf);
    flyer.remove();
    target.style.removeProperty("visibility");
  };
}
