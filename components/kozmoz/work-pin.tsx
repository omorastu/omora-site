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
 * Contact; on the first, a swipe back lets it go up. Coming in from above
 * it holds on the first card, from below on the last.
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
/** A swipe that let go this recently may still be carrying the page, in ms. */
const COAST = 1200;
/** A scroll that has stopped for this long, in ms, has ended (the wheel, keys). */
const SETTLE = 160;

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

export function WorkPin({ count, children }: { count: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [gate] = useState(createGate);

  useEffect(() => {
    const pin = ref.current;
    const stage = pin?.firstElementChild;
    if (!pin || !(stage instanceof HTMLElement)) return;
    const pinned = window.matchMedia(PINNED);
    const root = document.documentElement;
    const cards = [...pin.querySelectorAll<HTMLElement>(".proj")];
    const last = count - 1;
    let raf = 0;
    let near = false;
    let lastY = scrollY;
    let touch: Touch | null = null;
    /** When the last swipe (not a tap) let go. */
    let swipedAt = -Infinity;
    /** A glide under way. */
    let gliding = 0;
    /** The page held still on a stop, and what lets it go (the next touch, or the end of the coast). */
    let held: (() => void) | null = null;
    let letGo = 0;
    let settling = 0;
    let bound = false;

    const on = () => pinned.matches && last >= 1;
    /** The pin's top, in page px, and the page px per card. */
    const top = () => pin.getBoundingClientRect().top + scrollY;
    const step = () => (pin.offsetHeight - stage.offsetHeight) / last;
    const stop = (i: number) => top() + i * step();
    /** Where the row is, in cards, for where the page is. */
    const place = () => Math.min(last, Math.max(0, (scrollY - top()) / step()));
    const inside = () => scrollY > stop(0) - 2 && scrollY < stop(last) + 2;

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

    /**
     * Stop the page on a stop, wherever its scroll was taking it: still the
     * page's own scrolling there, and keep it still through any coast after
     * the finger lifts, until the next touch (or the coast is surely over).
     */
    const hold = (at: number) => {
      root.style.overflow = "hidden";
      scrollTo({ top: at, behavior: "instant" });
      lastY = scrollY;
      swipedAt = -Infinity;
      clearTimeout(letGo);
      held = () => {
        held = null;
        clearTimeout(letGo);
        root.style.removeProperty("overflow");
      };
      letGo = window.setTimeout(() => held?.(), COAST);
      queue();
    };

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        touch = null;
        return;
      }
      const p = e.touches[0];
      // A new touch: whatever held the page, it's this finger's now.
      held?.();
      const ours = on() && (gliding > 0 || inside());
      touch = { x: p.clientX, y: p.clientY, t: performance.now(), kind: ours ? (gliding ? "spent" : "open") : "page", nx: p.clientX, ny: p.clientY, moved: false };
    };
    /** Where the finger is, and whether it's a swipe yet (always; it never holds the page up). */
    const track = (e: TouchEvent) => {
      if (!touch || e.touches.length !== 1) return;
      touch.nx = e.touches[0].clientX;
      touch.ny = e.touches[0].clientY;
      if (Math.abs(touch.nx - touch.x) > 10 || Math.abs(touch.ny - touch.y) > 10) touch.moved = true;
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
      if (touch.moved && !held) swipedAt = performance.now();
      touch = null;
    };

    const onScroll = () => {
      const y = scrollY;
      if (on() && !gliding && !held) {
        // A swipe from outside carrying the page in: hold it on the first card
        // coming from above, on the last coming from below.
        const swiping = (touch?.kind === "page" && touch.moved) || performance.now() - swipedAt < COAST;
        const a = stop(0);
        const b = stop(last);
        if (swiping && lastY < a - 1 && y > a + 1 && y < b) hold(a);
        else if (swiping && lastY > b + 1 && y < b - 1 && y > a) hold(b);
      }
      lastY = scrollY;
      queue();
      // Any other scroll that comes to rest between two cards settles on the nearer.
      clearTimeout(settling);
      settling = window.setTimeout(() => {
        if (!on() || gliding || held || touch || !inside()) return;
        const at = stop(Math.round(place()));
        if (Math.abs(scrollY - at) > 1) glide(at);
      }, SETTLE);
    };

    // A card's link reached from the keyboard: scroll to that card's stop.
    const onFocus = (e: FocusEvent) => {
      const i = cards.findIndex((c) => c.contains(e.target as Node));
      if (!on() || i < 0) return;
      scrollTo({ top: stop(i), behavior: "instant" });
    };

    // Loaded part way through: on the nearest card.
    if (on() && inside()) scrollTo({ top: stop(Math.round(place())), behavior: "instant" });
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("touchstart", onStart, { passive: true });
    addEventListener("touchmove", track, { passive: true });
    addEventListener("touchend", onEnd, { passive: true });
    addEventListener("touchcancel", onEnd, { passive: true });
    addEventListener("resize", queue);
    pinned.addEventListener("change", queue);
    pin.addEventListener("focusin", onFocus);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(gliding);
      clearTimeout(settling);
      held?.();
      removeEventListener("scroll", onScroll);
      removeEventListener("touchstart", onStart);
      removeEventListener("touchmove", track);
      removeEventListener("touchend", onEnd);
      removeEventListener("touchcancel", onEnd);
      removeEventListener("touchmove", onMove);
      removeEventListener("resize", queue);
      pinned.removeEventListener("change", queue);
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
