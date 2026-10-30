"use client";

import { useEffect, useRef, useState } from "react";
import { PlayGateContext, type PlayGate } from "@/components/kozmoz/work-video";

/**
 * The home page's Work on phones, pinned (kozmoz.css, "work, pinned"):
 * once the section reaches the top of the screen it holds there, and each
 * swipe moves its row of cards along by exactly one, however short the
 * swipe (past SWIPE px, or a flick): up or right to left for the next card,
 * down or left to right for the one before, whichever way the swipe mostly
 * went. The row glides to that card's middle (MOVE ms) and takes no more
 * input until it's there, so a swipe never skips a card or stops between
 * two. On the last card the next swipe on lets the page go on down into
 * Contact; on the first, a swipe back lets it go up.
 *
 * Coming in, it's a hard stop: however big or quick the scroll or fling,
 * the moment the page reaches (or has passed) the section's start coming
 * down, it's put exactly on the first card, and coming up, on the last; and
 * the page is frozen there (freeze()) so whatever momentum is left dies,
 * until the next touch, wheel or key. Scrolls to a link (the hero's button,
 * the menu) pass straight through.
 *
 * Underneath it's a tall box with a sticky stage: each card has its own
 * stop down the box, the row's place (--x, in cards) follows the page's
 * scroll, and a move is the page scrolled from one stop to the next. While
 * it's held, this takes the swipes and keeps the page itself from scrolling
 * (only then, and only during a swipe); anywhere else the page scrolls as
 * it always does. A scroll that ends between stops some other way (a wheel,
 * keys) settles on the nearest. Only the card in the middle plays its loop
 * (PlayGate).
 *
 * The same test as kozmoz.css's decides when: under 768px, motion allowed,
 * scripting on. Otherwise the pin and its stage step aside and the cards are
 * as they always were: the grid, or on phones under reduced motion, the row
 * to swipe.
 */

const PINNED = "(max-width: 767px) and (prefers-reduced-motion: no-preference) and (scripting: enabled)";
/** A move from one card to the next, in ms. */
const MOVE = 450;
/** A swipe: this far, in px; or a flick, FLICK px within FLICK_MS. */
const SWIPE = 30;
const FLICK = 12;
const FLICK_MS = 220;
/** Under this, in px, the finger hasn't yet said which way it's going. */
const SLOP = 6;
/** A scroll that has stopped for this long, in ms, has ended (the wheel, keys). */
const SETTLE = 160;
/** A wheel after this long a pause, in ms, is a new scroll, not the last one's momentum. */
const WHEEL_PAUSE = 250;
/** Frozen, the page slipping this many times gets a firmer hold. */
const DRIFT = 2;
/** The page still for this long, in ms, needs no watching frame by frame (scroll events still come). */
const QUIET = 600;
/** Someone's scroll is over when the page has been still this long, in ms, with no finger down. */
const OVER = 400;
/** Keys that scroll the page a screen or a line. (Home and End go to a place, like a link.) */
const SCROLL_KEYS = new Set([" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp"]);

const easeOut = (t: number) => 1 - (1 - t) ** 3;

/** A finger on the screen: where it went down, and whose swipe it is. */
type Touch = {
  x: number;
  y: number;
  t: number;
  /** open: not yet clear; ours: a move through the cards; page: the page's own scroll; spent: done with. */
  kind: "open" | "ours" | "page" | "spent";
  axis?: "x" | "y";
  dir?: 1 | -1;
  /** Where it is now. */
  nx: number;
  ny: number;
  moved: boolean;
};

/** The page frozen on a stop: where, and whether the body has been pinned too. */
type Frozen = { at: number; fixed: boolean; drift: number };

export function WorkPin({ count, children }: { count: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [gate] = useState(createGate);

  useEffect(() => {
    const pin = ref.current;
    const stage = pin?.firstElementChild;
    if (!pin || !(stage instanceof HTMLElement)) return;
    const pinned = window.matchMedia(PINNED);
    const root = document.documentElement;
    const body = document.body;
    const cards = [...pin.querySelectorAll<HTMLElement>(".proj")];
    const last = count - 1;
    let raf = 0;
    let watching = 0;
    let near = false;
    let touch: Touch | null = null;
    /** What moved the page last: someone scrolling it (a swipe, a wheel, keys), or a link. */
    let intent: "scroll" | "link" | null = null;
    let frozen: Frozen | null = null;
    let lastWheel = -Infinity;
    let over = 0;
    /** When anything last moved, or might be moving, the page. */
    let stirred = performance.now();
    /** A glide under way. */
    let gliding = 0;
    let settling = 0;
    let bound = false;

    const on = () => pinned.matches && last >= 1;
    /** Where the page is scrolled to (frozen with the body pinned, the window reads 0). */
    const pageY = () => (frozen?.fixed ? frozen.at : scrollY);
    let lastY = pageY();
    /** The pin's top, in page px, and the page px per card. */
    const top = () => pin.getBoundingClientRect().top + pageY();
    const step = () => (pin.offsetHeight - stage.offsetHeight) / last;
    const stop = (i: number) => top() + i * step();
    /** Where the row is, in cards, for where the page is. */
    const place = () => Math.min(last, Math.max(0, (pageY() - top()) / step()));
    const inside = () => pageY() > stop(0) - 2 && pageY() < stop(last) + 2;

    const show = () => {
      if (!on()) {
        pin.style.removeProperty("--x");
        gate.set(false, null);
        return;
      }
      const x = place();
      pin.style.setProperty("--x", x.toFixed(4));
      gate.set(true, cards[Math.round(x)] ?? null);
      // Coming up: the cards still off to the side get their stills now, not as they slide in.
      if (!near && pin.getBoundingClientRect().top < innerHeight * 2) {
        near = true;
        pin.querySelectorAll("img").forEach((img) => (img.loading = "eager"));
      }
    };
    const update = () => {
      raf = 0;
      // The hard stop first, so no frame shows the row moved by a scroll that's about to be stopped.
      check();
      show();
      // Only while the row is held does a swipe need stopping from scrolling the page.
      const want = on() && inside();
      if (want !== bound) {
        bound = want;
        if (want) addEventListener("touchmove", onMove, { passive: false });
        else removeEventListener("touchmove", onMove);
      }
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    /* ── The hard stop ─────────────────────────────────────────────────── */

    /** Someone's scroll lasts as long as the page keeps moving, or a finger is down (and a little after). */
    const scrolling = () => {
      intent = "scroll";
      clearTimeout(over);
      over = window.setTimeout(() => {
        if (!touch) intent = null;
      }, OVER);
    };

    /**
     * Put the page exactly on a stop and freeze it there: nothing scrolls it
     * (not a finger still down, not the momentum of a fling) until the next
     * touch, wheel or key lets go (thaw()).
     */
    const freeze = (at: number) => {
      scrollTo({ top: at, behavior: "instant" });
      // The root only: on the body as well, the body would become a scroller of its own and the stage would stop sticking.
      root.style.overflow = "hidden";
      frozen = { at, fixed: false, drift: 0 };
      lastY = at;
      intent = null;
      queue();
      watch();
    };
    /** If the page drifts all the same (momentum that ignores the above), pin the body where it is. */
    const fix = () => {
      if (!frozen || frozen.fixed) return;
      frozen.fixed = true;
      Object.assign(body.style, { position: "fixed", top: `${-frozen.at}px`, left: "0", right: "0", width: "100%" });
    };
    const thaw = () => {
      if (!frozen) return;
      const { at, fixed } = frozen;
      frozen = null;
      root.style.removeProperty("overflow");
      for (const prop of ["position", "top", "left", "right", "width"]) body.style.removeProperty(prop);
      if (fixed) scrollTo({ top: at, behavior: "instant" });
      lastY = scrollY;
    };

    /**
     * Each scroll and each frame near the section: someone's scroll that has
     * reached the section, or gone past it within a frame, stops on its first
     * card coming down and its last coming up; and frozen, the page stays put.
     */
    const check = () => {
      if (!on() || gliding) return;
      if (frozen) {
        if (frozen.fixed) return;
        // Slipped (momentum that the frozen root didn't stop): back, and a second slip gets the firmer hold.
        if (Math.abs(scrollY - frozen.at) > 1) {
          scrollTo({ top: frozen.at, behavior: "instant" });
          if (++frozen.drift >= DRIFT) fix();
        }
        return;
      }
      const y = scrollY;
      if (!gliding && intent === "scroll") {
        const a = stop(0);
        const b = stop(last);
        if (lastY < a - 1 && y >= a - 1) return freeze(a);
        if (lastY > b + 1 && y <= b + 1) return freeze(b);
      }
      lastY = y;
    };
    /** Every frame while the page is moving near the section, or has just been frozen on it. */
    const watch = () => {
      stirred = performance.now();
      if (watching) return;
      const frame = () => {
        watching = 0;
        const y = pageY();
        if (Math.abs(y - lastY) > 0.5) stirred = performance.now();
        check();
        const close = y > stop(0) - 2 * innerHeight && y < stop(last) + 2 * innerHeight;
        if (on() && close && performance.now() - stirred < QUIET) watching = requestAnimationFrame(frame);
      };
      watching = requestAnimationFrame(frame);
    };

    /* ── Moving through the cards ──────────────────────────────────────── */

    /** Glide the page to `to` (page px), the row with it; nothing else moves it meanwhile. */
    const glide = (to: number) => {
      cancelAnimationFrame(gliding);
      const from = scrollY;
      const t0 = performance.now();
      const frame = (now: number) => {
        const p = easeOut(Math.min(1, (now - t0) / MOVE));
        scrollTo({ top: from + (to - from) * p, behavior: "instant" });
        lastY = scrollY;
        show();
        gliding = p < 1 ? requestAnimationFrame(frame) : 0;
        if (!gliding) queue();
      };
      gliding = requestAnimationFrame(frame);
    };

    /** One card on or back; past either end, the page goes on (sideways swipes take it there). */
    const go = (dir: 1 | -1, axis: "x" | "y") => {
      const j = Math.round(place()) + dir;
      if (j >= 0 && j <= last) glide(stop(j));
      else if (axis === "x") glide(dir > 0 ? stop(last) + innerHeight * 0.6 : stop(0) - innerHeight * 0.6);
    };

    const onStart = (e: TouchEvent) => {
      // A new touch: whatever froze the page, it's this finger's now.
      thaw();
      watch();
      if (e.touches.length !== 1) {
        touch = null;
        return;
      }
      const p = e.touches[0];
      const ours = on() && (gliding > 0 || inside());
      touch = { x: p.clientX, y: p.clientY, t: performance.now(), kind: ours ? (gliding ? "spent" : "open") : "page", nx: p.clientX, ny: p.clientY, moved: false };
    };
    /** Where the finger is, and whether it's a swipe yet (always; it never holds the page up). */
    const track = (e: TouchEvent) => {
      if (!touch || e.touches.length !== 1) return;
      touch.nx = e.touches[0].clientX;
      touch.ny = e.touches[0].clientY;
      if (!touch.moved && (Math.abs(touch.nx - touch.x) > 10 || Math.abs(touch.ny - touch.y) > 10)) touch.moved = true;
      if (touch.moved) scrolling();
    };
    /** While the row is held: which way, and keep the page from scrolling under it. */
    function onMove(e: TouchEvent) {
      if (!touch || e.touches.length !== 1) return;
      track(e);
      const dx = touch.nx - touch.x;
      const dy = touch.ny - touch.y;
      if (touch.kind === "page") return;
      if (touch.kind === "open") {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < SLOP) return;
        const axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        // Finger going left or up: the next card.
        const dir = (axis === "x" ? dx : dy) < 0 ? 1 : -1;
        const i = Math.round(place());
        // Off either end, up or down: that's the page's own scroll, as it would be anywhere.
        if (axis === "y" && ((dir > 0 && i >= last) || (dir < 0 && i <= 0))) {
          touch.kind = "page";
          return;
        }
        Object.assign(touch, { kind: "ours", axis, dir });
      }
      if (e.cancelable) e.preventDefault();
      if (touch.kind === "ours" && Math.abs(touch.axis === "x" ? dx : dy) >= SWIPE) {
        touch.kind = "spent";
        go(touch.dir!, touch.axis!);
      }
    }
    const onEnd = (e: TouchEvent) => {
      if (!touch) return;
      // Where it lifted: a browser may not report a move this small until the touch ends.
      const end = e.changedTouches[0];
      if (end) {
        touch.nx = end.clientX;
        touch.ny = end.clientY;
      }
      // Short of a swipe, but quick: a flick.
      const quick = performance.now() - touch.t <= FLICK_MS;
      if (touch.kind === "open" && quick) {
        const dx = touch.nx - touch.x;
        const dy = touch.ny - touch.y;
        const axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        const d = axis === "x" ? dx : dy;
        if (Math.abs(d) >= FLICK) go(d < 0 ? 1 : -1, axis);
      } else if (touch.kind === "ours" && quick) {
        const d = touch.axis === "x" ? touch.nx - touch.x : touch.ny - touch.y;
        if (Math.abs(d) >= FLICK) go(touch.dir!, touch.axis!);
      }
      // A swipe let go: its momentum may carry the page on yet.
      if (touch.moved) scrolling();
      touch = null;
    };

    /* ── Everything else that moves the page ───────────────────────────── */

    const onWheel = () => {
      const now = performance.now();
      // A new turn of the wheel lets a frozen page go; the last one's momentum doesn't.
      if (now - lastWheel > WHEEL_PAUSE) thaw();
      lastWheel = now;
      scrolling();
      watch();
    };
    const onKey = (e: KeyboardEvent) => {
      thaw();
      if (SCROLL_KEYS.has(e.key)) scrolling();
      else if (e.key === "Home" || e.key === "End" || e.key === "Tab") intent = "link";
    };
    /** A link (the hero's button, the menu's sections) takes the page where it's going. */
    const onClick = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest("a[href]")) intent = "link";
    };
    /** Turned or resized: let go, and stand on the nearest card. */
    const onResize = () => {
      thaw();
      if (on() && inside()) scrollTo({ top: stop(Math.round(place())), behavior: "instant" });
      queue();
    };

    const onScroll = () => {
      check();
      queue();
      watch();
      if (intent === "scroll") scrolling();
      // Any other scroll that comes to rest between two cards settles on the nearer.
      clearTimeout(settling);
      settling = window.setTimeout(() => {
        if (!on() || gliding || frozen || touch || !inside()) return;
        const at = stop(Math.round(place()));
        if (Math.abs(scrollY - at) > 1) glide(at);
      }, SETTLE);
    };

    // A card's link reached from the keyboard: scroll to that card's stop.
    const onFocus = (e: FocusEvent) => {
      const i = cards.findIndex((c) => c.contains(e.target as Node));
      if (!on() || i < 0) return;
      intent = "link";
      scrollTo({ top: stop(i), behavior: "instant" });
    };

    // Loaded part way through: on the nearest card.
    if (on() && inside()) scrollTo({ top: stop(Math.round(place())), behavior: "instant" });
    update();
    watch();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("touchstart", onStart, { passive: true });
    addEventListener("touchmove", track, { passive: true });
    addEventListener("touchend", onEnd, { passive: true });
    addEventListener("touchcancel", onEnd, { passive: true });
    addEventListener("wheel", onWheel, { passive: true });
    addEventListener("keydown", onKey);
    addEventListener("click", onClick, true);
    addEventListener("resize", onResize);
    addEventListener("orientationchange", onResize);
    pinned.addEventListener("change", onResize);
    pin.addEventListener("focusin", onFocus);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(watching);
      cancelAnimationFrame(gliding);
      clearTimeout(settling);
      clearTimeout(over);
      thaw();
      removeEventListener("scroll", onScroll);
      removeEventListener("touchstart", onStart);
      removeEventListener("touchmove", track);
      removeEventListener("touchend", onEnd);
      removeEventListener("touchcancel", onEnd);
      removeEventListener("touchmove", onMove);
      removeEventListener("wheel", onWheel);
      removeEventListener("keydown", onKey);
      removeEventListener("click", onClick, true);
      removeEventListener("resize", onResize);
      removeEventListener("orientationchange", onResize);
      pinned.removeEventListener("change", onResize);
      pin.removeEventListener("focusin", onFocus);
      gate.set(false, null);
    };
  }, [count, gate]);

  return (
    <PlayGateContext.Provider value={gate}>
      <div ref={ref} className="work-pin" style={{ "--cards": count } as React.CSSProperties}>
        <div className="work-stage">
          {children}
          <div className="work-progress" aria-hidden="true">
            <span />
          </div>
        </div>
      </div>
    </PlayGateContext.Provider>
  );
}

/** Pinned, only the card in the middle may play; otherwise every card may. */
function createGate(): PlayGate & { set(pinned: boolean, current: Element | null): void } {
  let pinned = false;
  let current: Element | null = null;
  const subs = new Set<() => void>();
  return {
    plays: (el) => !pinned || !!current?.contains(el),
    subscribe(fn) {
      subs.add(fn);
      return () => void subs.delete(fn);
    },
    set(p, c) {
      if (p === pinned && c === current) return;
      pinned = p;
      current = c;
      subs.forEach((fn) => fn());
    },
  };
}
