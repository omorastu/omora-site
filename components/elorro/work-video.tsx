"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

/**
 * A project's muted loop, laid over its still. Nothing downloads until the
 * card is near the screen; phones get the portrait cut, wide screens the
 * landscape one, and either keeps the still when its cut isn't there. It fades in only once it is actually playing, so a slow
 * connection just keeps showing the still. Under reduced motion it never loads
 * (and elorro.css hides it).
 *
 * How much it loads follows the connection, where the browser says
 * (navigator.connection): Save-Data or a 3G-class link gets the project's SD
 * cut when it has one, 2G gets the still alone. At most two loops download at
 * once across the page; the rest wait their turn. A loop that stalls for more
 * than 3 seconds gives way to its still for the rest of the visit.
 *
 * Inside a PlayGate (the home page's pinned row on phones, work-pin.tsx) a
 * loop also waits for the gate: in view but held back, it stays on its still.
 *
 * Some browsers won't start even a muted loop on their own: an iPhone in Low
 * Power Mode (Safari, and Chrome, which is Safari underneath) refuses every
 * play() until the visitor touches the page. A loop refused that way isn't
 * given up on: it keeps its source, waits on its still and holds no download
 * slot. The first loop on the page asks once whether loops may start on their
 * own; if not, the page listens for the visitor's first tap, swipe or key, and
 * in that gesture (iOS counts only what happens inside it) starts the loops
 * refused so far and plays-and-pauses every loop with nothing loaded yet,
 * which is what lets each start on its own later. Where loops start on their
 * own, nothing listens and nothing changes.
 */

/** Which of the loops in view may play; without one, all of them. */
export type PlayGate = { plays(el: Element): boolean; subscribe(fn: () => void): () => void };
export const PlayGateContext = createContext<PlayGate | null>(null);

type Cuts = { desktop?: string; mobile?: string; desktopSd?: string; mobileSd?: string };
type Connection = { saveData?: boolean; effectiveType?: string; downlink?: number };

const MAX_LOADING = 2;
const STALL_MS = 3000;

/** What the connection can take: the full cut, the light one, or none. */
function budget(): "hd" | "sd" | "none" {
  const c = (navigator as Navigator & { connection?: Connection }).connection;
  if (!c) return "hd";
  if (c.effectiveType === "slow-2g" || c.effectiveType === "2g") return "none";
  if (c.saveData || c.effectiveType === "3g" || (c.downlink !== undefined && c.downlink > 0 && c.downlink < 1.5)) return "sd";
  return "hd";
}

/* Download slots, shared by every loop on the page. */
let loading = 0;
const queue: (() => void)[] = [];

/** Runs `start` once a slot is free; the returned function gives the slot (or the place in line) back. */
function takeSlot(start: () => void) {
  let state: "queued" | "loading" | "done" = "queued";
  const go = () => {
    state = "loading";
    loading++;
    start();
  };
  if (loading < MAX_LOADING) go();
  else queue.push(go);
  return () => {
    if (state === "queued") queue.splice(queue.indexOf(go), 1);
    if (state === "loading") {
      loading--;
      queue.shift()?.();
    }
    state = "done";
  };
}

/* Loops the browser won't start on their own (iOS in Low Power Mode). */

/** A loop on the page, as the visitor's gesture sees it: true if it may now play. */
type Loop = { unlock(): boolean };
const loops = new Set<Loop>();
/** What counts as the visitor's say-so: a tap (its touchend, pointerup or click), a swipe's touchend, a key. */
const GESTURES = ["touchend", "pointerup", "click", "keydown"] as const;
/** Heard first and only heard: never stopped, never prevented, so the hold, the Work row and the rest hear it as before. */
const HEAR = { capture: true, passive: true } as const;
let listening = false;
let asked = false;

/** Listen for the visitor's next gesture, until one lets a loop play. */
function awaitGesture() {
  if (listening) return;
  listening = true;
  for (const type of GESTURES) addEventListener(type, onGesture, HEAR);
}

/**
 * Inside the gesture, every loop takes its chance (each only counts if it
 * calls play() right here). Once any is let play, the gesture has counted and
 * nothing more is needed; if none is, the browser didn't count this one, and
 * the next gesture tries again.
 */
function onGesture() {
  let allowed = false;
  for (const loop of loops) if (loop.unlock()) allowed = true;
  if (!allowed) return;
  listening = false;
  for (const type of GESTURES) removeEventListener(type, onGesture, HEAR);
}

/**
 * Whether loops may start on their own, asked once, of a loop with nothing
 * loaded (so nothing downloads). A browser that refuses play() leaves it
 * paused there and then; one that doesn't is paused again at once.
 */
function ask(v: HTMLVideoElement) {
  if (asked) return;
  asked = true;
  v.play()?.catch(() => {});
  if (v.paused) awaitGesture();
  else v.pause();
}

export function WorkVideo({ desktop, mobile, desktopSd, mobileSd }: Cuts) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const gate = useContext(PlayGateContext);

  useEffect(() => {
    const v = ref.current;
    if (
      !v ||
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const small = window.matchMedia("(max-width: 1023px)");
    let inView = false;
    let gaveUp = false;
    let ready = false; // enough of the cut is in to play through
    let blocked = false; // the browser refused to start it on its own: on its still till a gesture
    let release: (() => void) | null = null;
    let stall = 0;

    if (budget() !== "none") ask(v);

    const want = () => {
      const b = budget();
      if (b === "none") return undefined;
      const hd = small.matches ? mobile : desktop;
      const sd = small.matches ? mobileSd : desktopSd;
      // Either cut will do when the other isn't there.
      return b === "sd" ? (sd ?? hd) : (hd ?? sd);
    };

    const letGo = () => {
      release?.();
      release = null;
    };
    const calm = () => {
      clearTimeout(stall);
      stall = 0;
    };
    // Not playing within STALL_MS of asking (or of running dry): fall back to the still.
    const watch = () => {
      if (!stall) stall = window.setTimeout(giveUp, STALL_MS);
    };

    const unload = () => {
      calm();
      letGo();
      ready = false;
      blocked = false;
      if (v.dataset.loaded) {
        v.pause();
        v.removeAttribute("src");
        v.load();
        delete v.dataset.loaded;
        setPlaying(false);
      }
    };
    function giveUp() {
      gaveUp = true;
      unload();
    }

    /** In view and, inside a gate, let through. */
    const allowed = () => inView && (!gate || gate.plays(v));

    const play = () => {
      watch();
      v.play()?.catch(refused);
    };

    /**
     * A play() that didn't happen. Cut short by a pause or a new source (ours)
     * or failing to load (the error event's business), it's nothing to do with
     * this. Refused (iOS in Low Power Mode): keep the source and the still,
     * stop the stall watch, free the slot, and wait for the visitor's gesture.
     */
    const refused = (err: unknown) => {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "AbortError" || name === "NotSupportedError") return;
      if (!v.paused || !v.dataset.loaded || !allowed()) return;
      blocked = true;
      calm();
      letGo();
      awaitGesture();
    };

    // Play the cut for the current width and connection while the card is
    // near the screen. With no cut for this width, unload, so the still shows
    // again — also after a resize or a tablet rotated across 1024px.
    const sync = () => {
      const src = want();
      if (!src || gaveUp) return unload();
      // In view, but the gate holds it back: back to its still until let through.
      const held = inView && !!gate && !gate.plays(v);
      if (!inView || held) {
        calm();
        // In line for a slot: step out of it until the card is back.
        if (!v.dataset.loaded) return letGo();
        // Half loaded: stop the download and free the slot (the cache keeps what came in).
        if (!ready) return unload();
        if (!v.paused) v.pause();
        if (held) setPlaying(false);
        return;
      }
      // Refused before: it stays on its still until the visitor's gesture starts it.
      if (v.dataset.loaded === src) return blocked ? undefined : play();
      if (release && !v.dataset.loaded) return; // already in line
      unload();
      release = takeSlot(() => {
        v.muted = true;
        v.src = src;
        v.dataset.loaded = src;
        setPlaying(false);
        play();
      });
    };

    const onPlaying = () => calm();
    const onReady = () => {
      ready = true;
      letGo();
    };
    const onDry = () => {
      if (inView && !v.paused) watch();
    };
    // Unloading can raise an error of its own once the source is gone; only a real one counts.
    const onError = () => {
      if (v.dataset.loaded) giveUp();
    };

    /**
     * Inside the visitor's gesture. Refused and allowed now: start it here,
     * with a slot if one is free; if not, it goes back in line with nothing
     * loading. Any loop with nothing loaded: play and pause it here, so it may
     * start on its own when its turn comes. True if the browser let it play.
     */
    const loop: Loop = {
      unlock() {
        let requeue = false;
        if (blocked) {
          blocked = false;
          if (allowed() && loading < MAX_LOADING) {
            release = takeSlot(play);
            return !v.paused;
          }
          unload();
          requeue = true;
        }
        if (v.dataset.loaded || !v.paused) return false;
        v.play()?.catch(() => {});
        const ok = !v.paused;
        v.pause();
        if (requeue) sync();
        return ok;
      },
    };
    loops.add(loop);

    v.addEventListener("playing", onPlaying);
    v.addEventListener("canplaythrough", onReady);
    v.addEventListener("waiting", onDry);
    v.addEventListener("stalled", onDry);
    v.addEventListener("error", onError);

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(v);
    small.addEventListener("change", sync);
    const unsubscribe = gate?.subscribe(sync);
    return () => {
      loops.delete(loop);
      unsubscribe?.();
      io.disconnect();
      small.removeEventListener("change", sync);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("canplaythrough", onReady);
      v.removeEventListener("waiting", onDry);
      v.removeEventListener("stalled", onDry);
      v.removeEventListener("error", onError);
      calm();
      letGo();
    };
  }, [desktop, mobile, desktopSd, mobileSd, gate]);

  return (
    <video
      ref={ref}
      className={playing ? "is-on" : undefined}
      muted
      playsInline
      loop
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
    />
  );
}
