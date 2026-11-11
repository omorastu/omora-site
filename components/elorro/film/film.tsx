"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { hanken } from "@/components/elorro/fonts";
import { EloraAvatar } from "@/components/elorro/film/elora";
import { CAMERA, CLIPS, ClipContext, DESIGN, Handoff, SCENE_ART, type ClipId } from "@/components/elorro/film/scenes";
import { captions, scenes, timeline, voice } from "@/components/elorro/film/script";
import { budget } from "@/components/elorro/work-video";
import { cn } from "@/lib/utils";
import "@/components/elorro/film/film.css";

/**
 * "How we work", a short film narrated by Elora: a button, and the film it
 * opens over the whole screen. It plays on its own, scene into scene
 * (scenes.tsx, timed by script.ts), its captions always on, Elora in her
 * corner (elora.tsx); the only things to do are leave (the X, or Escape) and
 * turn the sound off and on. It ends on a button to book a call, which takes
 * the page to its contact section.
 *
 * Every picture moves by CSS animations on one clock (film.css). This keeps
 * them all at one time, and that time with Elora's voice: the voice leads
 * while it plays, and should it stall the pictures wait for it, briefly. Its
 * file is fetched as the page loads and started inside the click, so a phone
 * plays it. Without it, the film runs as captions alone, on the same timing.
 * Only the scenes near the moment are in the page at all (WINDOW), which
 * keeps a phone's memory and work to two scenes at most.
 *
 * Two of the scenes play Elorro's own loops (scenes.tsx, CLIPS). Their
 * videos are made, and started and stopped at once, inside the same click:
 * an iPhone in Low Power Mode lets a video play on its own later only if it
 * was started in a gesture (as work-video.tsx does on the pages). Each loads
 * only shortly before its scene, plays in step with the film, and stays on
 * its still under reduced motion or on a connection too slow for it.
 *
 * On a phone upright the scenes are laid out tall (TALL, scenes.tsx); the
 * film follows the screen if it turns.
 *
 * For reviewing: /film?at=30 opens the film stopped 30 seconds in, silent;
 * /film?at=30&run plays it on from there.
 */

const { parts, total } = timeline();
const CAPTIONS = captions();
/** Her glow follows what she says, not how long its caption stays up. */
const SPOKEN = CAPTIONS.map((c) => ({ from: c.from, to: c.said }));
const LAST = parts[parts.length - 1];
/** The button to book a call comes up as she says so, the film's last line. */
const BOOK_AT = LAST.start + (LAST.scene.lines[LAST.scene.lines.length - 1]?.at ?? 0);
/** Elora comes in as she starts to speak, and goes to her corner as her scene ends. */
const ELORA_IN = Math.max(0, parts[0].start + (parts[0].scene.lines[0]?.at ?? 1.2) - 0.6);
const ELORA_CORNER = parts[0].start + parts[0].duration - 1.1;
/** Between her and the call: the thread she leaves draws from just before she moves; the title as she settles; both gone as the call is under way. */
const CALL = parts[1];
const HANDOFF = { thread: ELORA_CORNER - 0.2, title: ELORA_CORNER + 1, gone: CALL.start + CALL.duration * (1.5 / DESIGN.call) };
/** When each loop plays, in seconds into the film, and where in it it starts. */
const CLIP_IDS = Object.keys(CLIPS) as ClipId[];
const CLIP_AT = CLIP_IDS.map((id) => {
  const c = CLIPS[id];
  const p = parts.find((x) => x.scene.id === c.scene) ?? parts[0];
  const k = p.duration / DESIGN[c.scene];
  return { id, from: p.start + c.at * k, to: p.start + c.until * k, offset: c.offset };
});
/** A loop starts loading this many seconds before it plays (never sooner, so the film starts fast). */
const PREFETCH = 8;
/** A phone upright: the scenes' tall layout. Kept the same as film.css's. */
const TALL = "(max-width: 767px) and (max-aspect-ratio: 3/4)";
/** The longest the pictures wait for a stalled voice, in ms, before going on without it. */
const STALL_MS = 2000;
/** A scene is in the page from this many seconds before its start to as many after its end. */
const WINDOW = 2.5;
/** Keys that would scroll the page under the film. */
/** What counts as the visitor's say-so for a loop the browser held back. */
const GESTURES = ["touchend", "pointerup", "click", "keydown"] as const;
const SCROLL_KEYS = new Set([" ", "PageDown", "PageUp", "Home", "End", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"]);

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;
const sec = (t: number) => `${t.toFixed(3)}s`;
/** The scenes to have in the page at `t`. */
const scenesAt = (t: number) =>
  parts.flatMap((p, i) => (t >= p.start - WINDOW && t <= p.start + p.duration + WINDOW ? [i] : []));
const same = (a: number[], b: number[]) => a.length === b.length && a.every((x, i) => x === b[i]);

type Showing = { at: number; run: boolean; review: boolean };
type Clips = Partial<Record<ClipId, HTMLVideoElement>>;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** One of the loops' videos: muted, inline, looping, nothing loaded; shown once it has a frame to show. */
function makeClip() {
  const v = document.createElement("video");
  v.muted = true;
  v.defaultMuted = true;
  v.playsInline = true;
  v.loop = true;
  v.preload = "none";
  v.tabIndex = -1;
  v.className = "film-clip-video";
  v.setAttribute("aria-hidden", "true");
  const on = () => {
    if (v.readyState >= 2) v.classList.add("is-on");
  };
  v.addEventListener("playing", on);
  v.addEventListener("seeked", on);
  v.addEventListener("loadeddata", on);
  return v;
}

/** Follows the screen: true while a phone is upright. */
function useTall() {
  return useSyncExternalStore(
    (change) => {
      const m = window.matchMedia(TALL);
      m.addEventListener("change", change);
      return () => m.removeEventListener("change", change);
    },
    () => window.matchMedia(TALL).matches,
    () => false
  );
}

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
  const clips = useRef<Clips>({});
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
    // And the loops, started and stopped here, with nothing loaded yet, so they may play on their own later.
    if (!reducedMotion()) {
      for (const id of CLIP_IDS) {
        const v = (clips.current[id] ??= makeClip());
        if (!v.dataset.src) {
          v.play()?.catch(() => {});
          v.pause();
        }
      }
    }
    clearTimeout(leaving.current);
    setClosing(false);
    setShowing({ at: 0, run: true, review: false });
  };

  const sound = useCallback((on: boolean) => {
    if (audio.current) audio.current.muted = !on;
  }, []);

  /** Leave the film: it fades, the page comes back, and the focus with it, unless booking took it to the form. */
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
      {showing &&
        createPortal(<Film {...showing} audio={audio} clips={clips} closing={closing} onLeave={leave} onSound={sound} />, document.body)}
    </>
  );
}

function Film({
  at,
  run,
  review,
  audio,
  clips,
  closing,
  onLeave,
  onSound,
}: Showing & {
  audio: React.RefObject<HTMLAudioElement | null>;
  clips: React.RefObject<Clips>;
  closing: boolean;
  onLeave: (refocus?: boolean) => void;
  onSound: (on: boolean) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const reel = useRef<HTMLDivElement>(null);
  const shut = useRef<HTMLButtonElement>(null);
  const book = useRef<HTMLAnchorElement>(null);
  const clock = useRef<{ align(): void } | null>(null);
  const [muted, setMuted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [near, setNear] = useState(() => scenesAt(at));
  const tall = useTall();
  // The loops stay on their stills under reduced motion, and on a connection too slow for them.
  const [still] = useState(() => reducedMotion() || budget() === "none");
  const sound = review ? null : audio;

  /** A loop's place on the set, as its scene comes in (or null, as it goes): its video goes in, or comes out. */
  const attach = useCallback(
    (id: ClipId, slot: HTMLElement | null) => {
      if (still) return;
      const v = (clips.current[id] ??= makeClip());
      if (slot) slot.appendChild(v);
      else {
        v.pause();
        v.remove();
      }
    },
    [clips, still]
  );

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
    // (Transitions, such as a loop fading in over its still, keep their own time.)
    const anims = () => el.getAnimations({ subtree: true }).filter((x) => !(typeof CSSTransition !== "undefined" && x instanceof CSSTransition));
    const tick0 = el.querySelector(".film-clock")?.getAnimations()[0];
    const now = () => Number(tick0?.currentTime ?? 0) / 1000;
    let paused = !run;
    /** Elora's video, if she has one, kept to the film's time. */
    const face = () => el.querySelector<HTMLVideoElement>(".elora-video");
    const keepFace = (t: number) => {
      const v = face();
      if (!v) return;
      if (Math.abs(v.currentTime - t) > 0.25) v.currentTime = t;
      if (paused) v.pause();
      else if (v.paused) v.play().catch(() => {});
    };
    /**
     * The loops, at `t`: each loads PREFETCH seconds before it plays; while
     * it plays it runs on its own, put back only if it drifts a second off;
     * stopped, or not yet on, it waits on the right frame. One the browser
     * won't start (an iPhone in Low Power Mode, despite the click) starts on
     * the visitor's next tap.
     */
    const blocked = new Set<HTMLVideoElement>();
    const onGesture = () => {
      for (const v of blocked) {
        v.play()?.catch(() => {});
        if (!v.paused) blocked.delete(v);
      }
      if (!blocked.size) for (const type of GESTURES) el.removeEventListener(type, onGesture, true);
      clock.current?.align();
    };
    const refused = (v: HTMLVideoElement) => (err: unknown) => {
      if (!(err instanceof DOMException) || err.name !== "NotAllowedError") return;
      if (!blocked.size) for (const type of GESTURES) el.addEventListener(type, onGesture, true);
      blocked.add(v);
    };
    const keepClips = (t: number, moving: boolean) => {
      if (still) return;
      for (const c of CLIP_AT) {
        const v = clips.current?.[c.id];
        if (!v) continue;
        if (!v.dataset.src) {
          if (t < c.from - PREFETCH || t > c.to) continue;
          const cut = CLIPS[c.id].cuts;
          const small = window.matchMedia("(max-width: 1023px)").matches;
          const src = budget() === "sd" ? (small ? cut.mobileSd : cut.desktopSd) : small ? cut.mobile : cut.desktop;
          v.dataset.src = src;
          v.preload = "auto";
          v.src = src;
        }
        const dur = Number.isFinite(v.duration) ? v.duration : 0;
        const want = Math.max(0, t - c.from) + c.offset;
        const pos = dur ? want % dur : want;
        const off = Math.abs(v.currentTime - pos);
        if (!moving || !v.isConnected || t < c.from || t > c.to) {
          if (!v.paused) v.pause();
          if (t <= c.to && off > 0.05) v.currentTime = pos;
          continue;
        }
        if (v.paused) {
          if (off > 0.15) v.currentTime = pos;
          if (!blocked.has(v)) v.play()?.catch(refused(v));
        } else if (Math.min(off, dur ? dur - off : off) > 1) v.currentTime = pos;
      }
    };
    /** All running at `t`: set by their start time, so none that has finished starts over. */
    const runAt = (t: number) => {
      const base = Number(document.timeline.currentTime ?? 0) - t * 1000;
      for (const x of anims()) {
        // Just made (no start time yet), stopped, or drifted: put it on the clock.
        if (x.startTime === null || x.playState === "paused" || Math.abs(Number(x.startTime) - base) > 60) x.startTime = base;
      }
      keepFace(t);
      keepClips(t, true);
    };
    /** All stopped at `t`. */
    const pauseAt = (t: number) => {
      for (const x of anims()) {
        x.pause();
        x.currentTime = t * 1000;
      }
      keepFace(t);
      keepClips(t, false);
    };

    /** The voice stalled for longer than the pictures will wait: they go on, and it catches up when it can. */
    let stalled = false;
    let waiting = false;
    let stall = 0;
    const leads = () => !!a && !!voice.src && !a.paused && !a.ended && !stalled;
    const at0 = run && leads() ? a!.currentTime : at;
    if (run) runAt(at0);
    else pauseAt(at0);
    if (tick0) tick0.onfinish = () => setEnded(true);
    // Scenes just put in the page: onto the clock before they're seen.
    clock.current = { align: () => (paused || waiting ? pauseAt(now()) : runAt(leads() ? a!.currentTime : now())) };

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
      const t = now();
      const want = scenesAt(t);
      setNear((had) => (same(had, want) ? had : want));
      if (leads()) {
        if (!waiting) runAt(a!.currentTime);
      } else {
        if (a && !voice.src) {
          let i = 0;
          while (i + 1 < parts.length && parts[i + 1].start <= t) i++;
          const src = parts[i].scene.voice;
          if (i !== scene && src) {
            a.src = src;
            a.play().catch(() => {});
          }
          scene = i;
        }
        keepFace(t);
        keepClips(t, true);
      }
    };
    a?.addEventListener("waiting", onWaiting);
    a?.addEventListener("playing", onPlaying);
    const timer = run ? window.setInterval(tick, 200) : 0;

    if (review) {
      window.__eloFilm = {
        seek: (t: number) => {
          paused = true;
          pauseAt(t);
          setNear(scenesAt(t));
        },
        total,
        starts: parts.map((p) => p.start),
      };
    }
    return () => {
      clearInterval(timer);
      clearTimeout(stall);
      a?.removeEventListener("waiting", onWaiting);
      a?.removeEventListener("playing", onPlaying);
      for (const type of GESTURES) el.removeEventListener(type, onGesture, true);
      if (tick0) tick0.onfinish = null;
      clock.current = null;
      delete window.__eloFilm;
    };
  }, [at, run, review, sound, clips, still]);

  // Scenes just put in the page, or laid out anew for a turned screen: onto the clock before they're seen.
  useLayoutEffect(() => {
    clock.current?.align();
  }, [near, tall]);

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
        <GoldDefs />

        <ClipContext.Provider value={attach}>
        {parts.map(({ scene, start, duration }, i) => {
          if (!near.includes(i)) return null;
          const art = SCENE_ART[scene.id](tall);
          const cam = CAMERA[scene.id];
          return (
            <section
              key={scene.id}
              className={cn("film-scene", i === 0 && "is-first", i === parts.length - 1 && "is-last")}
              data-scene={scene.id}
              aria-hidden="true"
              style={
                {
                  "--s": sec(start),
                  "--d": sec(duration),
                  "--px": cam.px,
                  "--py": cam.py,
                  "--z0": cam.z0,
                  "--z1": cam.z1,
                  "--ry": cam.ry,
                  "--nx": cam.nx,
                  "--ny": cam.ny,
                } as Vars
              }
            >
              <div className="film-lens">
                <div className="film-far">{art.far}</div>
                <div className="film-mid">
                  <div className="film-orbit">{art.mid}</div>
                </div>
                <div className="film-near">{art.near}</div>
              </div>
            </section>
          );
        })}
        </ClipContext.Provider>

        {(near.includes(0) || near.includes(1)) && <Handoff tall={tall} {...HANDOFF} />}

        <div className="film-grain" aria-hidden="true" />

        <EloraAvatar lines={SPOKEN} arrive={ELORA_IN} toCorner={ELORA_CORNER} />

        <div className="film-frame">
          <div className="film-end" style={{ "--from": sec(BOOK_AT) } as Vars}>
            <a ref={book} className="film-book" href="#contact" onClick={() => onLeave(false)}>
              Book a call
            </a>
            <button type="button" className="film-stay" onClick={() => onLeave()}>
              Or keep looking around
            </button>
          </div>
        </div>

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

        <div className="film-caps" aria-hidden="true">
          {CAPTIONS.map((c) => (
            <p key={c.from} className="film-cap" style={{ "--from": sec(c.from), "--len": sec(c.to - c.from) } as Vars}>
              <span>{c.text}</span>
            </p>
          ))}
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

/** The film's golds, shared by every picture: the logo's metal across the set, a fill for chips and buttons, the cards. */
function GoldDefs() {
  return (
    <svg className="film-defs" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="film-gold" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1000" y2="1000">
          <stop offset="0" stopColor="#9C7630" />
          <stop offset=".22" stopColor="#E3C27D" />
          <stop offset=".42" stopColor="#B88E40" />
          <stop offset=".64" stopColor="#F2DCA2" />
          <stop offset=".84" stopColor="#B08636" />
          <stop offset="1" stopColor="#8A6424" />
        </linearGradient>
        <linearGradient id="film-gold-v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E3C27D" />
          <stop offset=".5" stopColor="#C29A4C" />
          <stop offset="1" stopColor="#9C7630" />
        </linearGradient>
        <linearGradient id="film-card" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1E1913" />
          <stop offset="1" stopColor="#110E0B" />
        </linearGradient>
        <linearGradient id="film-page" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7F4ED" />
          <stop offset="1" stopColor="#E9E3D6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
