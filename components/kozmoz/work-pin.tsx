"use client";

import { useEffect, useRef, useState } from "react";
import { PlayGateContext, type PlayGate } from "@/components/kozmoz/work-video";

/**
 * The home page's Work on phones, pinned (kozmoz.css, "work, pinned"):
 * once the section reaches the top of the screen it holds there while the
 * scroll moves its row of cards sideways, one card at a time, each settling
 * in the middle, and lets go after the last. Scrolling back up runs it in
 * reverse. Nothing takes over the scroll: the pin is a tall box with a
 * sticky stage in it, and this only turns how far down the box the page is
 * into how far along the row is (--x, in cards). The page settles on a card
 * when a scroll ends near one (scroll snapping, in kozmoz.css), and only
 * the card in the middle plays its loop (PlayGate).
 *
 * The same test as kozmoz.css's decides when: under 768px, motion allowed,
 * scripting on. Otherwise the pin and its stage step aside and the cards are
 * as they always were: the grid, or on phones under reduced motion, the row
 * to swipe.
 */

const PINNED = "(max-width: 767px) and (prefers-reduced-motion: no-preference) and (scripting: enabled)";
/** How long each card holds still in the middle, as a share of its step either side of its stop. */
const HOLD = 0.2;
/** The hold after the last card before the pin lets go, in steps (kozmoz.css's --hold-end). */
const END = 0.35;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** A row position (in cards) for a scroll position (in steps): hold, glide, hold. */
function along(s: number, last: number) {
  if (s >= last) return last;
  const i = Math.floor(s);
  const t = clamp01((s - i - HOLD) / (1 - 2 * HOLD));
  return i + t * t * (3 - 2 * t);
}

export function WorkPin({ count, children }: { count: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [gate] = useState(createGate);

  useEffect(() => {
    const pin = ref.current;
    const stage = pin?.firstElementChild;
    if (!pin || !(stage instanceof HTMLElement)) return;
    const pinned = window.matchMedia(PINNED);
    const cards = [...pin.querySelectorAll<HTMLElement>(".proj")];
    const last = count - 1;
    let raf = 0;
    let near = false;

    /** Page px per card. */
    const step = () => (pin.offsetHeight - stage.offsetHeight) / (last + END);

    const update = () => {
      raf = 0;
      if (!pinned.matches || last < 1) {
        pin.style.removeProperty("--x");
        gate.set(false, null);
        return;
      }
      const top = pin.getBoundingClientRect().top;
      const x = along(Math.max(0, -top) / step(), last);
      pin.style.setProperty("--x", x.toFixed(4));
      gate.set(true, cards[Math.round(x)] ?? null);
      // Coming up: the cards still off to the side get their stills now, not as they slide in.
      if (!near && top < innerHeight * 2) {
        near = true;
        pin.querySelectorAll("img").forEach((img) => (img.loading = "eager"));
      }
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    // A card's link reached from the keyboard: scroll to that card's stop.
    const onFocus = (e: FocusEvent) => {
      const i = cards.findIndex((c) => c.contains(e.target as Node));
      if (!pinned.matches || i < 0) return;
      scrollTo({ top: pin.getBoundingClientRect().top + scrollY + i * step(), behavior: "instant" });
    };

    update();
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    pinned.addEventListener("change", queue);
    pin.addEventListener("focusin", onFocus);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", queue);
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
        {/* Where a scroll that ends close by settles: each card's stop. */}
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className="work-snap" style={{ "--i": i } as React.CSSProperties} aria-hidden="true" />
        ))}
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
