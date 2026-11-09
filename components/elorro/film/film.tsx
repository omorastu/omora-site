"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { hanken } from "@/components/elorro/fonts";
import { SCENE_ART } from "@/components/elorro/film/scenes";
import { captions, scenes, timeline, voice } from "@/components/elorro/film/script";
import { cn } from "@/lib/utils";
import "@/components/elorro/film/film.css";

/**
 * "How we work", a short film narrated by Elora: a button, and the film it
 * opens over the whole screen. It plays on its own, scene into scene
 * (scenes.tsx, timed by script.ts), its captions always on; the only things
 * to do are leave (the X, or Escape) and turn the sound off and on. It ends
 * on a button to book a call, which takes the page to its contact section.
 *
 * Every picture moves by CSS animations on one clock (film.css). This keeps
 * them all at one time, and that time with Elora's voice: the voice leads
 * while it plays, and should it stall the pictures wait for it. Its file is
 * fetched as the page loads and started inside the click, so a phone plays
 * it. Without it, the film runs as captions alone, on the same timing.
 *
 * For reviewing: /film?at=30 opens the film stopped 30 seconds in, silent;
 * /film?at=30&run plays it on from there.
 */

const { parts, total } = timeline();
const CAPTIONS = captions();
const LAST = parts[parts.length - 1];
/** The button to book a call comes up as she says so, the film's last line. */
const BOOK_AT = LAST.start + (LAST.scene.lines[LAST.scene.lines.length - 1]?.at ?? 0);
/** The longest the pictures wait for a stalled voice, in ms, before going on without it. */
const STALL_MS = 2000;
/** Keys that would scroll the page under the film. */
const SCROLL_KEYS = new Set([" ", "PageDown", "PageUp", "Home", "End", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"]);

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;
const sec = (t: number) => `${t.toFixed(3)}s`;

type Showing = { at: number; run: boolean; review: boolean };

declare global {
  interface Window {
    /** Set only while reviewing (?at=): stops the film at a time, in seconds. */
    __eloFilm?: { seek(t: number): void; total: number; starts: number[] };
  }
}

export function FilmLauncher({ label }: { label: string }) {
  const [showing, setShowing] = useState<Showing | null>(null);
  const [closing, setClosing] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const leaving = useRef(0);
  const refocus = useRef(false);

  useEffect(() => {
    const first = voice.src ?? scenes[0].voice;
    if (first) {
      const a = new Audio();
      a.preload = "auto";
      a.src = first;
      audio.current = a;
    }
    const q = new URLSearchParams(location.search);
    const at = q.get("at");
    // Reviewing (?at=): open on it once the page is up.
    const review =
      at === null
        ? 0
        : window.setTimeout(() => setShowing({ at: Math.min(total, Math.max(0, Number(at) || 0)), run: q.has("run"), review: true }));
    return () => {
      audio.current?.pause();
      clearTimeout(leaving.current);
      clearTimeout(review);
    };
  }, []);

  const watch = () => {
    // Inside the click itself: the one moment a phone lets the voice start.
    const a = audio.current;
    if (a) {
      if (!voice.src && scenes[0].voice) a.src = scenes[0].voice;
      a.currentTime = 0;
      a.muted = false;
      a.play().catch(() => {});
    }
    clearTimeout(leaving.current);
    setClosing(false);
    setShowing({ at: 0, run: true, review: false });
  };

  /** Leave the film: it fades, the page comes back, and the focus with it, unless booking took it to the form. */
  const sound = useCallback((on: boolean) => {
    if (audio.current) audio.current.muted = !on;
  }, []);

  const leave = useCallback((back: boolean = true) => {
    audio.current?.pause();
    setClosing(true);
    refocus.current = back;
    leaving.current = window.setTimeout(() => {
      setShowing(null);
      setClosing(false);
    }, 450);
  }, []);

  // Once the film has gone and the page is in reach again.
  useEffect(() => {
    if (showing || !refocus.current) return;
    refocus.current = false;
    trigger.current?.focus();
  }, [showing]);

  return (
    <>
      <button ref={trigger} type="button" className="act" onClick={watch}>
        {label}
      </button>
      {showing && createPortal(<Film {...showing} audio={audio} closing={closing} onLeave={leave} onSound={sound} />, document.body)}
    </>
  );
}

function Film({
  at,
  run,
  review,
  audio,
  closing,
  onLeave,
  onSound,
}: Showing & {
  audio: React.RefObject<HTMLAudioElement | null>;
  closing: boolean;
  onLeave: (refocus?: boolean) => void;
  onSound: (on: boolean) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const reel = useRef<HTMLDivElement>(null);
  const shut = useRef<HTMLButtonElement>(null);
  const book = useRef<HTMLAnchorElement>(null);
  const [muted, setMuted] = useState(false);
  const [ended, setEnded] = useState(false);
  const sound = review ? null : audio;

  // While it plays: the page underneath out of reach, the browser's chrome as dark as the film, the focus on leaving.
  useEffect(() => {
    const page = document.querySelector<HTMLElement>(".elo");
    page?.setAttribute("inert", "");
    const theme = document.createElement("meta");
    theme.name = "theme-color";
    theme.content = "#0C0A08";
    document.head.prepend(theme);
    // (Not while reviewing: frames taken there would carry the focus ring.)
    if (!review) shut.current?.focus({ preventScroll: true });
    return () => {
      page?.removeAttribute("inert");
      theme.remove();
    };
  }, [review]);

  // The clock: every animation in the film at one time, the voice's while it plays.
  useEffect(() => {
    const el = reel.current;
    if (!el || typeof el.getAnimations !== "function") return;
    const a = sound?.current ?? null;
    const anims = () => el.getAnimations({ subtree: true });
    const clock = el.querySelector(".film-clock")?.getAnimations()[0];
    const now = () => Number(clock?.currentTime ?? 0) / 1000;
    /** All running at `t`: set by their start time, so none that has finished starts over. */
    const runAt = (t: number) => {
      const base = Number(document.timeline.currentTime ?? 0) - t * 1000;
      for (const x of anims()) {
        // Just made (no start time yet), stopped, or drifted: put it on the clock.
        if (x.startTime === null || x.playState === "paused" || Math.abs(Number(x.startTime) - base) > 60) x.startTime = base;
      }
    };
    /** All stopped at `t`. */
    const pauseAt = (t: number) => {
      for (const x of anims()) {
        x.pause();
        x.currentTime = t * 1000;
      }
    };

    /** The voice stalled for longer than the pictures will wait: they go on, and it catches up when it can. */
    let stalled = false;
    let waiting = false;
    let stall = 0;
    const leads = () => !!a && !!voice.src && !a.paused && !a.ended && !stalled;
    if (run) runAt(leads() ? a!.currentTime : at);
    else pauseAt(at);
    if (clock) clock.onfinish = () => setEnded(true);

    // One file: the pictures follow it, and wait for it if it stalls, for STALL_MS at most.
    const onWaiting = () => {
      if (!leads()) return;
      waiting = true;
      pauseAt(now());
      clearTimeout(stall);
      stall = window.setTimeout(() => {
        stalled = true;
        waiting = false;
        runAt(now());
      }, STALL_MS);
    };
    const onPlaying = () => {
      clearTimeout(stall);
      waiting = false;
      if (stalled && a) {
        stalled = false;
        a.currentTime = now();
      }
      if (leads()) runAt(a!.currentTime);
    };
    // One file per scene: each starts with its scene.
    let scene = 0;
    const tick = () => {
      if (leads()) {
        if (!waiting) runAt(a!.currentTime);
      } else if (a && !voice.src) {
        const t = now();
        let i = 0;
        while (i + 1 < parts.length && parts[i + 1].start <= t) i++;
        const src = parts[i].scene.voice;
        if (i !== scene && src) {
          a.src = src;
          a.play().catch(() => {});
        }
        scene = i;
      }
    };
    a?.addEventListener("waiting", onWaiting);
    a?.addEventListener("playing", onPlaying);
    const timer = run ? window.setInterval(tick, 200) : 0;

    if (review) {
      window.__eloFilm = { seek: pauseAt, total, starts: parts.map((p) => p.start) };
    }
    return () => {
      clearInterval(timer);
      clearTimeout(stall);
      a?.removeEventListener("waiting", onWaiting);
      a?.removeEventListener("playing", onPlaying);
      if (clock) clock.onfinish = null;
      delete window.__eloFilm;
    };
  }, [at, run, review, sound]);

  useEffect(() => {
    if (ended) book.current?.focus({ preventScroll: true });
  }, [ended]);

  // Leaving by key, the focus kept inside, and nothing underneath scrolled meanwhile.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onLeave();
        return;
      }
      if (e.key === "Tab") {
        const stops = [...el.querySelectorAll<HTMLElement>("button, a[href]")].filter(
          (n) => getComputedStyle(n).visibility !== "hidden"
        );
        const i = stops.indexOf(document.activeElement as HTMLElement);
        const next = e.shiftKey ? (i <= 0 ? stops.length - 1 : i - 1) : i >= stops.length - 1 ? 0 : i + 1;
        e.preventDefault();
        stops[next]?.focus();
        return;
      }
      // A button's own Space still presses it.
      if (SCROLL_KEYS.has(e.key) && !(e.key === " " && e.target instanceof HTMLButtonElement)) e.preventDefault();
    };
    const still = (e: Event) => {
      if (!(e instanceof TouchEvent) || e.touches.length < 2) e.preventDefault();
    };
    document.addEventListener("keydown", onKey, true);
    el.addEventListener("wheel", still, { passive: false });
    el.addEventListener("touchmove", still, { passive: false });
    return () => {
      document.removeEventListener("keydown", onKey, true);
      el.removeEventListener("wheel", still);
      el.removeEventListener("touchmove", still);
    };
  }, [onLeave]);

  const toggleSound = () => {
    onSound(muted);
    setMuted(!muted);
  };

  return (
    <div
      ref={root}
      className={cn("film", hanken.variable, closing && "is-closing")}
      role="dialog"
      aria-modal="true"
      aria-label="How we work: a short film, narrated by Elora"
      style={{ "--total": sec(total) } as Vars}
    >
      <div ref={reel} className="film-reel">
        <div className="film-top">
          <div className="film-labels" aria-hidden="true">
            {parts
              .filter((p) => p.scene.label)
              .map((p) => (
                <p key={p.scene.id} className="film-label" style={{ "--from": sec(p.start + 0.35), "--len": sec(p.duration - 0.7) } as Vars}>
                  {p.scene.label}
                </p>
              ))}
          </div>
          <div className="film-ctls">
            {sound && (
              <button type="button" className="film-ctl" aria-label="Sound off" aria-pressed={muted} onClick={toggleSound}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
                  {muted ? <path d="M16 9.5l5 5M21 9.5l-5 5" /> : <path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" />}
                </svg>
              </button>
            )}
            <button ref={shut} type="button" className="film-ctl" aria-label="Close the film" onClick={() => onLeave()}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="film-stage">
          <div className="film-set">
            {parts.map(({ scene, start, duration }) => {
              const Art = SCENE_ART[scene.id];
              return (
                <section
                  key={scene.id}
                  className="film-scene"
                  data-scene={scene.id}
                  aria-hidden="true"
                  style={{ "--s": sec(start), "--d": sec(duration) } as Vars}
                >
                  <div className="film-lens">
                    <div className="film-drift">
                      <Art />
                    </div>
                  </div>
                </section>
              );
            })}
            <a
              ref={book}
              className="film-book"
              href="#contact"
              style={{ "--from": sec(BOOK_AT) } as Vars}
              onClick={() => onLeave(false)}
            >
              Book a call
            </a>
          </div>
        </div>

        <div className="film-bottom">
          <div className="film-caps" aria-hidden="true">
            {CAPTIONS.map((c) => (
              <p key={c.from} className="film-cap" style={{ "--from": sec(c.from), "--len": sec(c.to - c.from) } as Vars}>
                {c.text}
              </p>
            ))}
          </div>
        </div>
        <div className="film-progress" aria-hidden="true">
          <i />
        </div>
        <span className="film-clock" aria-hidden="true" />
      </div>

      {/* What she says, for screen readers, all at once. */}
      <div className="film-sr">
        {scenes.map((s) => s.lines.map((l) => <p key={l.text}>{l.text}</p>))}
      </div>
    </div>
  );
}
