"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { createSmoke, type Smoke } from "@/components/intro/smoke";
import { cormorantItalic } from "@/components/intro/font";
import "@/components/intro/intro.css";

/**
 * The intro: a paper card with the Elorro logo (the gold lettering with its
 * runners, public/m/brand/elorro-logo.png) and, under it, the name's
 * definition, over the home page, on a visitor's first page load of the
 * session.
 *
 *   0–1s     the logo, then the rule and the definition fade in (CSS)
 *   1–4s     hold; with a mouse, the pointer stirs the logo and letters like smoke
 *   4–5.5s   it evaporates: the surface and letters break into soft particles
 *            that blur, rise and fade, revealing the page, while the logo
 *            shrinks and flies (0.6s) to the header's wordmark, turning into
 *            it on the way, and stays there until the overlay has gone
 *
 * A click, tap, key or scroll starts the evaporation early. Under reduced
 * motion it holds still and then simply fades out over 0.6s, with no flight.
 * Once the page shows through, it tells the home page's hero to come in
 * ("kz:intro-clear", components/kozmoz/hands.tsx).
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
const HOLD_END = 4000;
const DISSOLVE = 1500;
const REDUCED_HOLD_END = 3400;
const FADE = 600;
/** The logo's flight to the header, from the start of the dissolve. */
const FLIGHT = 600;
/** How far into the dissolve the page counts as showing through, for the hero to start. */
const CLEAR_AFTER = 700;
/** From here intro.css's fallback owns the exit (keep in step with intro.css). */
const FALLBACK_AT = 4400;
/** If nothing else has, the overlay goes at this point regardless. */
const FAILSAFE = 7500;
/** Mouse stirring takes over from the DOM once the text has finished fading in. */
const ENTERED = 1000;

const KEY = "kz-intro";

/** The dictionary line under the logo: the name, its part of speech, what it means. */
const DEFINITION: React.ReactNode = (
  <>
    elorro · <i>noun</i> · two people who listen first, then build what adds real value to your business.
  </>
);

/** The logo file's own size, so its box is reserved before it loads, and where its letters sit in it. */
const LOGO = { src: "/m/brand/elorro-logo.png", width: 962, height: 172, ink: { left: 9, right: 946 } };

/**
 * Runs as the overlay is parsed, before the first paint. Shows the overlay
 * (by adding a style rule — it touches nothing React renders) only on the
 * session's first load, and not when arriving from another page of the site.
 * The same rule holds back the hero's own fallback (kozmoz.css, --kz-wait)
 * until the overlay's has run, so the hero never shows under the intro.
 */
const BOOT = `(function(){var show=false,q=/[?&]intro(=|&|$)/.test(location.search);try{var r=document.referrer,inside=false;try{inside=!!r&&new URL(r).origin===location.origin}catch(e){}var seen=sessionStorage.getItem("${KEY}");sessionStorage.setItem("${KEY}","1");show=!seen&&!inside}catch(e){}show=show||q;window.__kzIntro={show:show,t0:performance.now()};if(show){var s=document.createElement("style");s.textContent="html .kz-intro{display:block}html{--kz-wait:5s}";document.head.appendChild(s)}})();`;

/** Set by the boot script; `clear` once the page shows through, `done` once the overlay has gone. */
type Boot = { show: boolean; t0: number; clear?: boolean; done?: boolean };

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
    <div ref={root} className={`kz-intro ${cormorantItalic.variable}`} aria-hidden="true">
      {firstRender && <script dangerouslySetInnerHTML={{ __html: BOOT }} />}
      <canvas ref={canvas} className="kz-intro-canvas" />
      <div className="kz-intro-inner">
        <Image
          className="kz-intro-logo"
          src={LOGO.src}
          width={LOGO.width}
          height={LOGO.height}
          sizes="min(640px, 86vw)"
          alt=""
          loading="eager"
          fetchPriority="high"
          data-picture=""
        />
        <span className="kz-intro-rule" data-hairline="" />
        <p className="kz-intro-def" data-glyphs="">
          {DEFINITION}
        </p>
        {/* The old tagline, out for now: "When everything works the way it should, and looks the way it should." */}
      </div>
    </div>
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
    delete el.dataset.live;
    delete el.dataset.mode;
    delete el.dataset.leaving;
  }

  /** The page shows through: the hero can come in. */
  function clear() {
    if (boot.clear) return;
    boot.clear = true;
    window.dispatchEvent(new Event("kz:intro-clear"));
  }

  function end() {
    if (ended) return;
    ended = true;
    cleanup();
    clear();
    finish();
  }

  // Hydrated so late that intro.css's fallback is already fading it out: let it finish.
  if (since() >= FALLBACK_AT) {
    later(FALLBACK_AT + FADE - since(), end);
    return cleanup;
  }

  el.dataset.live = ""; // from here the script owns the exit, not the CSS fallback
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const getSmoke = () => {
    if (!smoke) {
      try {
        smoke = createSmoke(el, cv, { fine: mouse });
      } catch {
        smoke = null;
      }
    }
    return smoke;
  };

  function fade() {
    fading = el.animate({ opacity: [1, 0] }, { duration: FADE, easing: "ease", fill: "forwards" });
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

  function leave(cause: string) {
    if (leaving) return;
    leaving = true;
    release(cause);
    if (reduced) return clear(), fade();
    const s = getSmoke();
    if (!s) return clear(), fade();
    try {
      // The logo flies to the header, if the wordmark's there to land on;
      // otherwise it breaks up with the rest.
      landing = fly(el);
      s.dissolve(DISSOLVE, end, { pictures: !landing });
      later(CLEAR_AFTER, clear);
    } catch {
      landing?.();
      landing = null;
      delete el.dataset.mode;
      clear();
      fade();
    }
  }

  // On its own: dissolve after the hold.
  later((reduced ? REDUCED_HOLD_END : HOLD_END) - since(), () => leave("timer"));
  // And whatever happens, never leave the overlay up.
  later(FAILSAFE - since(), end);

  // Early: any press, key or scroll.
  on(el, "pointerdown", () => leave("pointer"));
  on(window, "keydown", (e) => {
    if (!["Shift", "Control", "Alt", "Meta"].includes(e.key)) leave("key");
  });
  on(el, "wheel", () => leave("wheel"), { passive: true });

  // With a mouse, the pointer stirs the logo and letters once they have faded in.
  if (mouse && !reduced) {
    let at: [number, number] | null = null;
    const stir = () => {
      // Measured too early, the letters' positions would be the fallback font's
      // (and until the logo has loaded, createSmoke declines).
      if (leaving || !at || document.fonts?.status === "loading") return;
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

  // The canvas is sized to the screen it started on; a new size just moves things along.
  on(window, "resize", () => {
    if (smoke) leave("resize");
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
 * The logo's flight: over FLIGHT ms (easing out) it shrinks and moves onto
 * the header's wordmark, crossfading on the way into a copy of it, which then
 * stays exactly over the wordmark (following it, should the page move) until
 * the overlay has gone. Returns what stops it, or null if there's no wordmark
 * in view to land on.
 */
function fly(el: HTMLElement): (() => void) | null {
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
  const t0 = performance.now();
  let raf = 0;
  const frame = (now: number) => {
    const t = Math.min(1, (now - t0) / FLIGHT);
    const p = 1 - (1 - t) ** 4;
    const at = target.getBoundingClientRect();
    const s = Math.exp(Math.log(s0) * (1 - p));
    flyer.style.transform = `translate(${x0 + (at.left - x0) * p}px, ${y0 + (at.top - y0) * p}px) scale(${s})`;
    pic.style.opacity = String(1 - smooth(0.2, 0.65, t));
    word.style.opacity = String(smooth(0.3, 0.75, t));
    raf = requestAnimationFrame(frame);
  };
  frame(t0);
  el.append(flyer);

  return () => {
    cancelAnimationFrame(raf);
    flyer.remove();
  };
}
