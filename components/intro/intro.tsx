"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { createSmoke, type Smoke } from "@/components/intro/smoke";
import { cormorantItalic } from "@/components/intro/font";
import "@/components/intro/intro.css";

/**
 * The intro: a paper card with the Elorro logo (the gold lettering with its
 * runners, public/m/brand/elorro-logo.png), the name's definition and the
 * tagline, over the home page, on a visitor's first page load of the session.
 *
 *   0–1s     the logo, then the definition, then the tagline fade in (CSS)
 *   1–3s     hold; with a mouse, the pointer stirs the logo and letters like smoke
 *   3–4.5s   it evaporates: the surface, logo and letters break into soft
 *            particles that blur, rise and fade, revealing the page
 *
 * A click, tap, key or scroll starts the evaporation early. Under reduced
 * motion it holds still and then simply fades out over 0.6s.
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
const HOLD_END = 3000;
const DISSOLVE = 1500;
const REDUCED_HOLD_END = 2400;
const FADE = 600;
/** From here intro.css's fallback owns the exit (keep in step with intro.css). */
const FALLBACK_AT = 3400;
/** If nothing else has, the overlay goes at this point regardless. */
const FAILSAFE = 6500;
/** Mouse stirring takes over from the DOM once the text has finished fading in. */
const ENTERED = 1000;

const KEY = "kz-intro";

/** The dictionary line under the logo: the name, its part of speech, what it means. */
const DEFINITION: React.ReactNode = (
  <>
    elorro · <i>noun</i> · two people who listen first, then build what adds real value to your business.
  </>
);

/** The logo file's own size, so its box is reserved before it loads. */
const LOGO = { src: "/m/brand/elorro-logo.png", width: 842, height: 172 };

/**
 * Runs as the overlay is parsed, before the first paint. Shows the overlay
 * (by adding a style rule — it touches nothing React renders) only on the
 * session's first load, and not when arriving from another page of the site.
 */
const BOOT = `(function(){var show=false,q=/[?&]intro(=|&|$)/.test(location.search);try{var r=document.referrer,inside=false;try{inside=!!r&&new URL(r).origin===location.origin}catch(e){}var seen=sessionStorage.getItem("${KEY}");sessionStorage.setItem("${KEY}","1");show=!seen&&!inside}catch(e){}show=show||q;window.__kzIntro={show:show,t0:performance.now()};if(show){var s=document.createElement("style");s.textContent="html .kz-intro{display:block}";document.head.appendChild(s)}})();`;

type Boot = { show: boolean; t0: number; done?: boolean };

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
          sizes="min(560px, 80vw)"
          alt=""
          loading="eager"
          fetchPriority="high"
          data-picture=""
        />
        <span className="kz-intro-rule" data-hairline="" />
        {DEFINITION && (
          <p className="kz-intro-def" data-glyphs="">
            {DEFINITION}
          </p>
        )}
        <p className="kz-intro-tag" data-glyphs="">
          When everything works the way it should, and looks the way it should.
        </p>
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
  let leaving = false;
  let ended = false;

  function cleanup() {
    timers.forEach(clearTimeout);
    timers.length = 0;
    offs.forEach((off) => off());
    offs.length = 0;
    smoke?.destroy();
    smoke = null;
    fading?.cancel();
    fading = null;
    delete el.dataset.live;
    delete el.dataset.mode;
    delete el.dataset.leaving;
  }

  function end() {
    if (ended) return;
    ended = true;
    cleanup();
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
    if (reduced) return fade();
    const s = getSmoke();
    if (!s) return fade();
    try {
      s.dissolve(DISSOLVE, end);
    } catch {
      delete el.dataset.mode;
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
