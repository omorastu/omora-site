"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { hanken } from "@/components/elorro/fonts";
import { effects, makeEffects } from "@/components/elorro/film/effects";
import { EloraAvatar } from "@/components/elorro/film/elora";
import { CAMERA, CLIPS, ClipContext, DESIGN, Handoff, SCENE_ART, type ClipId } from "@/components/elorro/film/scenes";
import {
  DEMO_IDS,
  availableOwnerPaths,
  captions,
  choice,
  scenes,
  timeline,
  voice,
  voiceStretches,
  type DemoId,
  type OwnerPath,
  type PlanSubject,
  type SceneId,
  type SegmentId,
} from "@/components/elorro/film/script";
import { budget } from "@/components/elorro/work-video";
import { hero } from "@/lib/elorro";
import { cn } from "@/lib/utils";
import "@/components/elorro/film/film.css";

/**
 * "How we work", a short film narrated by Elora: a button, and the film it
 * opens over the whole screen. A short opening offers examples by business or
 * service. Owner paths play a sequence of relevant scenes and continue to the
 * plan and the close. Service examples return to the choice. The X and Escape
 * close the film. The final booking button leads to the page's contact form.
 *
 * The film's parts all sit on one timeline (script.ts, SEGMENTS), a few
 * seconds apart; the clock jumps between them (`go`) and stops on the
 * choice (HOLD).
 *
 * Every picture moves by CSS animations on one clock (film.css). This keeps
 * them all at one time, and that time with Elora's voice: the voice leads
 * while it plays, and should it stall the pictures wait for it, briefly;
 * where a scene runs on past her lines, she waits for it. Her first file is
 * fetched as the page loads and started inside the click, so a phone plays
 * it; any others (a part's or a line's own, script.ts) are fetched soon
 * after, and she moves to each in the quiet before its line, on the same
 * audio element. Without her, the film runs as captions alone, on the same
 * timing.
 * Only the scenes near the moment are in the page at all (WINDOW), which
 * keeps a phone's memory and work to two scenes at most.
 *
 * Scenes play videos of Elorro's real work, made for the film
 * (scenes.tsx, CLIPS; video/README.md), each once through. Their videos are
 * made, and started and stopped at once, inside the same click:
 * an iPhone in Low Power Mode lets a video play on its own later only if it
 * was started in a gesture (as work-video.tsx does on the pages). Each loads
 * only shortly before its scene, plays in step with the film, and stays on
 * its still under reduced motion or on a connection too slow for it. A
 * phone upright gets each loop's phone cut, anything else its desktop cut.
 *
 * On a phone upright the scenes are laid out tall (TALL, scenes.tsx); the
 * film follows the screen if it turns.
 *
 * For reviewing, silent: /film?at=30 opens the film stopped 30 seconds in
 * (up to the choice, the film's time), and /film?at=30&run plays it on from
 * there; /film?at=choice opens on the choice; /film?demo=tools (or photo,
 * frontdesk) plays that demo and comes back to the choice, and
 * /film?demo=tools&at=3 stops 3 seconds into it; /film?at=plan stops on the
 * plan, and /film?at=plan&run plays the plan and the close.
 */

const { parts, segments, total } = timeline();
const CAPTIONS = captions();
const EFFECTS = parts.flatMap(({ scene, start, duration }) =>
  (effects[scene.id] ?? []).map(([at, cue]) => ({ at: start + at * duration / DESIGN[scene.id], cue }))
);
/** Her glow follows what she says, not how long its caption stays up (and not a line she has no voice for yet). */
const SPOKEN = CAPTIONS.filter((c) => !c.silent).map((c) => ({ from: c.from, to: c.said }));
const SEG = Object.fromEntries(segments.map((s) => [s.id, s])) as Record<SegmentId, (typeof segments)[number]>;
/** Where the film stops for the choice: once the last of the first minute has gone and its backdrop is in. */
const HOLD = SEG.choice.start + 1;
/** Stop before the first minute continues into its next narrated scene. */
const OPEN_END = parts[0].duration - 0.35;
/** Into a part a moment before its first scene, so it comes in out of the dark. */
const LEAD = 0.45;
/** Back from a demo to the choice once its pictures have all but gone. */
const RETURN = 0.45;
const PLAN_AT = SEG.finale.start - LEAD;
const demoAt = (id: DemoId) => SEG[id].start - LEAD;
const isDemo = (id: SegmentId): id is DemoId => DEMO_IDS.some((demo) => demo === id);

type OwnerTrack = OwnerPath & {
  spans: { start: number; end: number }[];
  visibleScenes: ReadonlySet<SceneId>;
};
const OWNER_TRACKS: readonly OwnerTrack[] = availableOwnerPaths.map((path) => {
  const selected = path.scenes.map((id) => parts.find((part) => part.scene.id === id)!);
  const spans: OwnerTrack["spans"] = [];
  selected.forEach((part, i) => {
    const previous = selected[i - 1];
    const main = part.segment === "main";
    // A standalone scene fades into the gap. Inside the walkthrough, leave
    // before the next unselected scene starts fading up.
    const end = part.start + part.duration + (main ? -0.3 : RETURN);
    if (previous?.segment === part.segment && Math.abs(previous.start + previous.duration - part.start) < 0.01) {
      spans[spans.length - 1].end = end;
    } else {
      const lead = main ? 0 : LEAD;
      spans.push({ start: part.start - lead + (i === 0 ? path.opening?.trim ?? 0 : 0), end });
    }
  });
  return { ...path, spans, visibleScenes: new Set<SceneId>([...path.scenes, "plan", "close"]) };
});
/** The part of the film at `t`: each reaches half way into the quiet either side of it (none, where one plays into the next). */
const segOf = (t: number) => segments.find((s, i) => !segments[i + 1] || t < (s.end + segments[i + 1].start) / 2) ?? segments[segments.length - 1];
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
  return { id, segment: p.segment, from: p.start + c.at * k, to: p.start + c.until * k, offset: c.offset };
});
/** A loop loads shortly before playback, on the part the visitor actually chose. */
const PREFETCH = 8;
/** Nothing done on the choice for this long, in ms: the cards pulse once. */
const NUDGE_MS = 20000;
/** A phone upright: the scenes' tall layout. Kept the same as film.css's. */
const TALL = "(max-width: 767px) and (max-aspect-ratio: 3/4)";
/** The longest the pictures wait for a stalled voice, in ms, before going on without it. */
const STALL_MS = 2000;
/** Her voice against the film (script.ts): the stretches of her files, and between them, where she waits. */
const VOICE = voiceStretches();
/** Her files, the first she plays first. */
const FILES = [...new Set(VOICE.map((s) => s.src))];
/** A wait shorter than this, she plays through. */
const MIN_WAIT = 0.2;
const href = (src: string) => new URL(src, location.href).href;
/** The film's time at `pos` in her file `src`, while she plays: in the stretch she's in, once the film (`t`, about now) has reached it. */
const filmOf = (pos: number, t: number, src: string) => {
  const mine = VOICE.filter((s) => href(s.src) === src);
  if (!mine.length) return t;
  let i = 0;
  while (i + 1 < mine.length && mine[i + 1].file <= pos && mine[i + 1].film <= t + MIN_WAIT) i++;
  return mine[i].film + pos - mine[i].file;
};
/**
 * Where her voice should be at the film's time `t`: in which file, and where
 * in it. Waiting: quiet there until `until` (in the next stretch's file, if
 * it's another, so that one loads meanwhile). Playing: on through `stop`, if
 * she waits after it.
 */
const voiceAt = (t: number) => {
  let i = 0;
  while (i + 1 < VOICE.length && VOICE[i + 1].film <= t) i++;
  const s = VOICE[i];
  const next = VOICE[i + 1];
  if (t < s.film) return { src: s.src, pos: s.file, wait: true as const, until: s.film };
  const off = t - s.film;
  const end = s.film + s.len;
  // She stops at a stretch's end if the film waits for her next, or if her next is in another file.
  const waits = !!next && (next.film - end >= MIN_WAIT || next.src !== s.src);
  if (off >= s.len && waits)
    return next.src === s.src
      ? { src: s.src, pos: s.file + s.len, wait: true as const, until: next.film }
      : { src: next.src, pos: next.file, wait: true as const, until: next.film };
  return { src: s.src, pos: s.file + off, wait: false as const, stop: waits ? end : undefined };
};
/** Her voice into `src` (if it isn't there already) at `pos`. */
const place = (a: HTMLAudioElement, src: string, pos: number, slack: number) => {
  if (a.src !== href(src)) {
    a.src = src;
    a.currentTime = pos;
  } else if (Math.abs(a.currentTime - pos) > slack) a.currentTime = pos;
};
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

type Showing = { at: number; run: boolean; review: boolean; owner?: OwnerTrack };
type FilmEffects = ReturnType<typeof makeEffects>;
type Clips = Partial<Record<ClipId, HTMLVideoElement>>;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** One of the scenes' videos: muted, inline, played once, nothing loaded; shown once it has a frame to show. */
function makeClip() {
  const v = document.createElement("video");
  v.muted = true;
  v.defaultMuted = true;
  v.playsInline = true;
  v.loop = false;
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
    __eloFilm?: {
      seek(t: number): void;
      total: number;
      starts: number[];
      hold: number;
      segments: { id: string; start: number; end: number }[];
    };
  }
}

/** What a review link opens on (see the top of this file), or null. */
function reviewing(q: URLSearchParams): Showing | null {
  const at = q.get("at");
  const demo = q.get("demo") as DemoId | null;
  const run = q.has("run");
  if (demo && isDemo(demo)) {
    const into = at === null ? null : Math.max(0, Number(at) || 0);
    return { at: into === null ? demoAt(demo) : SEG[demo].start + into, run: into === null || run, review: true };
  }
  if (at === null) return null;
  if (at === "choice") return { at: HOLD, run: false, review: true };
  if (at === "plan") return { at: run ? PLAN_AT : SEG.finale.start + 1.2, run, review: true };
  return { at: Math.min(total, Math.max(0, Number(at) || 0)), run, review: true };
}

export function FilmLauncher({ label }: { label: string }) {
  const [showing, setShowing] = useState<Showing | null>(null);
  const [closing, setClosing] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const clips = useRef<Clips>({});
  const trigger = useRef<HTMLButtonElement | null>(null);
  const effectsPlayer = useRef<FilmEffects>(null);
  const leaving = useRef(0);
  const refocus = useRef(false);

  useEffect(() => {
    let warm = 0;
    if (voice.src || FILES[0]) {
      const a = new Audio();
      a.preload = "auto";
      a.src = FILES[0] || voice.src!;
      audio.current = a;
      // Any other files of hers, fetched once the page has settled, so each is at hand when the film reaches it.
      if (FILES.length > 1) warm = window.setTimeout(() => FILES.slice(1).forEach((src) => fetch(src).catch(() => {})), 4000);
    }
    // Reviewing (?at=, ?demo=): open on it once the page is up.
    const open = reviewing(new URLSearchParams(location.search));
    const review = open ? window.setTimeout(() => setShowing(open)) : 0;
    return () => {
      audio.current?.pause();
      effectsPlayer.current?.close();
      effectsPlayer.current = null;
      clearTimeout(leaving.current);
      clearTimeout(review);
      clearTimeout(warm);
    };
  }, []);

  const watch = (button: HTMLButtonElement, owner?: OwnerTrack) => {
    const at = owner?.spans[0].start ?? 0;
    trigger.current = button;
    // Unlock sound with the same click that starts the selected film.
    const player = (effectsPlayer.current ??= makeEffects());
    player?.unlock();
    player?.audible(true);
    const a = audio.current;
    if (a) {
      const cue = voiceAt(at);
      if (cue.src) place(a, cue.src, cue.pos, 0);
      a.muted = false;
      a.play().catch(() => {});
      if (cue.wait) a.pause();
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
    setShowing({ at, run: true, review: false, owner });
  };

  const sound = useCallback((on: boolean) => {
    if (audio.current) audio.current.muted = !on;
  }, []);

  /** Leave the film: it fades, the page comes back, and the focus with it, unless booking took it to the form. */
  const leave = useCallback((back: boolean = true) => {
    audio.current?.pause();
    effectsPlayer.current?.audible(false);
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
      <div className="film-launch-options" role="group" aria-label="Choose your business">
        {OWNER_TRACKS.map((card) => (
          <button key={card.demo} type="button" className="act" onClick={(event) => watch(event.currentTarget, card)}>
            {card.title}
          </button>
        ))}
      </div>
      <button type="button" className="act film-launch-overview" onClick={(event) => watch(event.currentTarget)}>
        {label}
      </button>
      {showing &&
        createPortal(<Film {...showing} audio={audio} effectsPlayer={effectsPlayer} clips={clips} closing={closing} onLeave={leave} onSound={sound} />, document.body)}
    </>
  );
}

function Film({
  at,
  run,
  review,
  owner,
  audio,
  effectsPlayer,
  clips,
  closing,
  onLeave,
  onSound,
}: Showing & {
  audio: React.RefObject<HTMLAudioElement | null>;
  effectsPlayer: React.RefObject<FilmEffects>;
  clips: React.RefObject<Clips>;
  closing: boolean;
  onLeave: (refocus?: boolean) => void;
  onSound: (on: boolean) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const reel = useRef<HTMLDivElement>(null);
  const shut = useRef<HTMLButtonElement>(null);
  const book = useRef<HTMLAnchorElement>(null);
  const clock = useRef<{ align(): void; go(t: number, run: boolean): void } | null>(null);
  /** Leaving: her voice, stopped, stays stopped. */
  const gone = useRef(closing);
  useLayoutEffect(() => {
    gone.current = closing;
  }, [closing]);
  const [muted, setMuted] = useState(false);
  const [effectsOn, setEffectsOn] = useState(true);
  const [planSubject, setPlanSubject] = useState<PlanSubject>(owner?.plan ?? "business");
  const [activeOwner, setActiveOwner] = useState(owner);
  const ownerRun = useRef(owner ? { track: owner, index: 0 } : null);
  const [playbackMenu, setPlaybackMenu] = useState(false);
  useEffect(() => {
    if (!review && !closing) effectsPlayer.current?.audible(!muted && effectsOn);
  }, [effectsPlayer, muted, effectsOn, review, closing]);
  const [ended, setEnded] = useState(false);
  /** On the choice (or playing); the demos watched; the card to come back to. */
  const [choosing, setChoosing] = useState(() => segOf(at).id === "choice");
  const [menu, setMenu] = useState<keyof typeof choice>("owners");
  const examples = choice[menu];
  const [playingExample, setPlayingExample] = useState<DemoId | null>(() => {
    const id = segOf(at).id;
    return owner?.demo ?? (isDemo(id) ? id : null);
  });
  const shortOpening = useRef(!review);
  const [seen, setSeen] = useState<Record<keyof typeof choice, DemoId[]>>({ owners: [], services: [] });
  const [back, setBack] = useState<DemoId | null>(null);
  const markSeen = useCallback((menu: keyof typeof choice, id: DemoId) => {
    setSeen((had) => had[menu].includes(id) ? had : { ...had, [menu]: [...had[menu], id] });
  }, []);
  const toChoice = useCallback((from?: DemoId, watched = true) => {
    ownerRun.current = null;
    setActiveOwner(undefined);
    setPlaybackMenu(false);
    setChoosing(true);
    setPlayingExample(null);
    setBack(from ?? null);
    if (from && watched) markSeen("services", from);
  }, [markSeen]);
  const [near, setNear] = useState(() => scenesAt(at));
  const opening = !choosing && near.includes(0);
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
    const player = review ? null : effectsPlayer.current;
    // (Transitions, such as a loop fading in over its still, keep their own time.)
    const anims = () => el.getAnimations({ subtree: true }).filter((x) => !(typeof CSSTransition !== "undefined" && x instanceof CSSTransition));
    const tick0 = el.querySelector(".film-clock")?.getAnimations()[0];
    const now = () => Number(tick0?.currentTime ?? 0) / 1000;
    /** The part of the film playing: the first minute, the choice (stopped), a demo, or the plan and the close. */
    let seg: SegmentId = segOf(at).id;
    const start = seg === "choice" ? HOLD : at;
    let paused = !run || seg === "choice";
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
    // (Taps anywhere on the film count, the choice's cards too.)
    const host = el.parentElement ?? el;
    const onGesture = () => {
      for (const v of blocked) {
        v.play()?.catch(() => {});
        if (!v.paused) blocked.delete(v);
      }
      if (!blocked.size) for (const type of GESTURES) host.removeEventListener(type, onGesture, true);
      clock.current?.align();
    };
    const refused = (v: HTMLVideoElement) => (err: unknown) => {
      if (!(err instanceof DOMException) || err.name !== "NotAllowedError") return;
      if (!blocked.size) for (const type of GESTURES) host.addEventListener(type, onGesture, true);
      blocked.add(v);
    };
    const keepClips = (t: number, moving: boolean) => {
      if (still) return;
      for (const c of CLIP_AT) {
        const v = clips.current?.[c.id];
        if (!v) continue;
        // Load the cut for the current layout and switch to the other on rotation.
        if (seg === c.segment && t >= c.from - PREFETCH && t <= c.to) {
          const cut = CLIPS[c.id].cuts;
          const upright = window.matchMedia(TALL).matches;
          const src = budget() === "sd" ? (upright ? cut.mobileSd : cut.desktopSd) : upright ? cut.mobile : cut.desktop;
          if (!src) {
            if (v.dataset.src) {
              v.pause();
              delete v.dataset.src;
              v.classList.remove("is-on");
              v.removeAttribute("src");
              v.load();
            }
            continue;
          }
          if (v.dataset.src !== src) {
            v.dataset.src = src;
            v.classList.remove("is-on");
            v.preload = "auto";
            v.src = src;
          }
        }
        if (!v.dataset.src) continue;
        const dur = Number.isFinite(v.duration) ? v.duration : 0;
        const want = Math.max(0, t - c.from) + c.offset;
        // Played once: at its end it holds its last frame.
        const last = dur ? dur - 0.04 : Infinity;
        const pos = Math.min(want, last);
        const off = Math.abs(v.currentTime - pos);
        if (!moving || !v.isConnected || t < c.from || t > c.to || want >= last) {
          if (!v.paused) v.pause();
          if (t <= c.to && off > 0.05) v.currentTime = pos;
          continue;
        }
        if (v.paused) {
          if (off > 0.15) v.currentTime = pos;
          if (!blocked.has(v)) v.play()?.catch(refused(v));
        } else if (off > 1) v.currentTime = pos;
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
    /**
     * On her way in, after a wait: the film's time she's due (`due`), from
     * `parked` in her file. The pictures hold there until she's moving, as
     * they do for a stalled voice, so she's never behind them and they never
     * jump to meet her; it's in the quiet before her line, a moment at most.
     */
    let due = -1;
    let parked = 0;
    let watch = 0;
    let late = 0;
    const leads = () => !!a && !!VOICE[0].src && !a.paused && !a.ended && !stalled && due < 0;
    /** The film's time by her voice, while it leads. */
    const heard = () => filmOf(a!.currentTime, now(), a!.src);
    const at0 = !paused && leads() ? filmOf(a!.currentTime, start, a!.src) : start;
    let effectFrom = at0;
    if (paused) pauseAt(at0);
    else runAt(at0);
    if (tick0) tick0.onfinish = () => setEnded(true);

    /**
     * One file: her voice kept where the film is (script.ts, voiceStretches):
     * playing through each stretch, quiet where the film runs on past her
     * lines, on again as the film reaches her next one, from where she
     * stopped; should she pick up further on than that (Chrome can, by a
     * fifth of a second), she's put back before the pictures go on, while
     * she's still quiet. Timed to the moment, not the tick, so she's never
     * late in or cut short.
     *
     * Only her own waits start her again. Stopped any other way (not allowed
     * to play, or by the visitor's device: headphones out, a call, a media
     * key), she stays stopped (`off`) and the film goes on with its captions,
     * as it would without her; started again from outside, she catches up.
     */
    let hold = 0;
    let off = false;
    /** Started by the film, and not since stopped by it for a wait. */
    let on = false;
    const rest = (src: string, pos: number, until: number, t: number) => {
      on = false;
      if (!a!.paused) a!.pause();
      place(a!, src, pos, 0.08);
      if (until < Infinity) hold = window.setTimeout(keepVoice, Math.max(0, (until - t) * 1000));
    };
    const arrived = () => {
      due = -1;
      cancelAnimationFrame(watch);
      clearTimeout(late);
    };
    const keepVoice = () => {
      clearTimeout(hold);
      if (!a || !VOICE[0].src || paused || waiting || stalled || off || due >= 0 || gone.current) return;
      if (a.ended) {
        // A file played to its end (a line's own file): quiet until her next stretch, in its file.
        on = false;
        const t = now();
        const next = VOICE.find((s) => s.film > t + 0.05);
        if (next) rest(next.src, next.file, next.film, t);
        return;
      }
      if (a.paused && on) {
        off = true;
        return;
      }
      if (leads()) {
        // Speaking: on to the end of her stretch, then quiet, if the film runs on past it.
        const t = heard();
        const v = voiceAt(t);
        // Past the end of this file's stretch into one in another file: over to it, now.
        if (href(v.src) !== a.src) return rest(v.src, v.pos, t, t);
        if (v.wait) rest(v.src, v.pos, v.until, t);
        else if (v.stop !== undefined) hold = window.setTimeout(keepVoice, Math.max(0, (v.stop - t) * 1000));
        return;
      }
      if (!a.paused) return;
      const t = now();
      const v = voiceAt(t);
      if (v.wait) return rest(v.src, v.pos, v.until, t);
      // On again: from where she waited, or where she'd be by now, should the film have gone on.
      place(a, v.src, v.pos, 0.06);
      parked = a.currentTime;
      due = t;
      pauseAt(t);
      let last = parked;
      let mended = false;
      const moving = () => {
        if (due < 0) return;
        const pos = a.currentTime;
        if (a.paused) {
          // Stopped from outside before she got going.
          off = true;
          arrived();
          runAt(now());
          return;
        }
        if (!mended && pos - last > 0.05) {
          // Picked up further on than she stopped, in a single frame: back to where she was.
          mended = true;
          a.currentTime = parked;
        } else if (pos - parked > 0.06) {
          // Truly under way (a browser may nudge the time on a little before it really starts).
          arrived();
          runAt(heard());
          keepVoice();
          return;
        } else last = pos;
        watch = requestAnimationFrame(moving);
      };
      watch = requestAnimationFrame(moving);
      // Too slow to get going (a slow connection): the film goes on, and she catches up, as after a stall.
      late = window.setTimeout(() => {
        if (due < 0) return;
        arrived();
        stalled = true;
        runAt(now());
      }, STALL_MS);
      on = true;
      a.play().catch(() => {});
    };

    /**
     * The parts. The first minute plays to the choice and stops there (HOLD);
     * a demo plays from just before its start to just after its end, then
     * back to the choice; an owner path plays each chosen span then joins
     * the plan and the close. Check each boundary on every tick.
     */
    let endTimer = 0;
    const segEnd = () => {
      const path = ownerRun.current;
      if (path) return path.track.spans[path.index].end;
      if (seg === "main") return shortOpening.current ? OPEN_END : HOLD;
      return isDemo(seg) || seg === "winePhoto" ? SEG[seg].end + RETURN : Infinity;
    };
    const quiet = () => {
      clearTimeout(hold);
      clearTimeout(late);
      clearTimeout(stall);
      clearTimeout(endTimer);
      cancelAnimationFrame(watch);
      due = -1;
      waiting = false;
      stalled = false;
      off = false;
      on = false;
    };
    /** To `t` on the timeline, playing or stopped there: the pictures, then her voice, ready where she'll pick up. */
    const go = (t: number, play: boolean) => {
      quiet();
      seg = segOf(t).id;
      paused = !play;
      effectFrom = t;
      if (a && VOICE[0].src) {
        if (!a.paused) a.pause();
        const v = voiceAt(t);
        place(a, v.src, v.pos, 0.05);
      }
      if (play) runAt(t);
      else pauseAt(t);
      setNear(scenesAt(t));
      if (play) {
        keepVoice();
        armEnd();
      }
    };
    const checkEnd = (t: number) => {
      if (paused || t < segEnd()) return false;
      const path = ownerRun.current;
      if (path) {
        const next = path.track.spans[path.index + 1];
        if (next) {
          path.index++;
          go(next.start, true);
        } else {
          ownerRun.current = null;
          markSeen("owners", path.track.demo);
          go(PLAN_AT, true);
        }
        return true;
      }
      const from = isDemo(seg) ? seg : undefined;
      go(HOLD, false);
      toChoice(from);
      return true;
    };
    const armEnd = () => {
      clearTimeout(endTimer);
      const e = segEnd();
      if (paused || e === Infinity) return;
      endTimer = window.setTimeout(() => {
        if (!checkEnd(now())) armEnd();
      }, Math.max(20, (e - now()) * 1000 + 20));
    };
    // Scenes just put in the page: onto the clock before they're seen; and the jumps between parts.
    clock.current = { align: () => (paused || waiting || due >= 0 ? pauseAt(now()) : runAt(leads() ? heard() : now())), go };

    // One file: the pictures follow it, and wait for it if it stalls, for STALL_MS at most.
    const onWaiting = () => {
      if (!leads()) return;
      waiting = true;
      clearTimeout(hold);
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
      if ((stalled || off) && a) {
        stalled = off = false;
        on = true;
        const v = voiceAt(now());
        place(a, v.src, v.pos, 0);
      }
      if (leads()) runAt(heard());
      keepVoice();
    };
    const tick = () => {
      const t = now();
      if (checkEnd(t)) return;
      const want = scenesAt(t);
      setNear((had) => (same(had, want) ? had : want));
      if (paused) return;
      if (player && !gone.current && t - effectFrom <= 0.6) {
        for (const effect of EFFECTS) {
          if (effect.at > effectFrom && effect.at <= t) player.play(effect.cue);
        }
      }
      effectFrom = Math.max(effectFrom, t);
      if (leads()) {
        if (!waiting) runAt(heard());
        keepVoice();
      } else if (due < 0) {
        // (A wait she should be through by now, should its moment have been missed.)
        if (a?.paused && !on && !voiceAt(t).wait) keepVoice();
        keepFace(t);
        keepClips(t, true);
      }
    };
    a?.addEventListener("waiting", onWaiting);
    a?.addEventListener("playing", onPlaying);
    const timer = window.setInterval(tick, 200);
    if (!paused) {
      keepVoice();
      armEnd();
    }

    if (review) {
      window.__eloFilm = {
        seek: (t: number) => {
          quiet();
          seg = segOf(t).id;
          paused = true;
          pauseAt(t);
          setNear(scenesAt(t));
        },
        total,
        starts: parts.map((p) => p.start),
        hold: HOLD,
        segments: segments.map(({ id, start, end }) => ({ id, start, end })),
      };
    }
    return () => {
      clearInterval(timer);
      quiet();
      a?.removeEventListener("waiting", onWaiting);
      a?.removeEventListener("playing", onPlaying);
      for (const type of GESTURES) host.removeEventListener(type, onGesture, true);
      if (tick0) tick0.onfinish = null;
      clock.current = null;
      delete window.__eloFilm;
    };
  }, [at, run, review, sound, effectsPlayer, clips, still, toChoice, markSeen]);

  // Scenes just put in the page, or laid out anew for a turned screen: onto the clock before they're seen.
  useLayoutEffect(() => {
    clock.current?.align();
  }, [near, tall]);

  useEffect(() => {
    if (ended) book.current?.focus({ preventScroll: true });
  }, [ended]);

  // The choice: the focus on the card just watched, or the first; the cards pulse once if nothing's done for a while.
  const cards = useRef<Partial<Record<DemoId, HTMLButtonElement | null>>>({});
  const [nudge, setNudge] = useState(false);
  useEffect(() => {
    if (!choosing) return;
    if (!review) (cards.current[back ?? examples.cards[0].demo] ?? cards.current[examples.cards[0].demo])?.focus({ preventScroll: true });
    const host = root.current;
    let off = 0;
    let wait = 0;
    const idle = () => {
      clearTimeout(wait);
      wait = window.setTimeout(() => {
        setNudge(true);
        off = window.setTimeout(() => setNudge(false), 1800);
        for (const type of ["pointermove", "pointerdown", "keydown"]) host?.removeEventListener(type, idle);
      }, NUDGE_MS);
    };
    idle();
    for (const type of ["pointermove", "pointerdown", "keydown"]) host?.addEventListener(type, idle);
    return () => {
      clearTimeout(wait);
      clearTimeout(off);
      setNudge(false);
      for (const type of ["pointermove", "pointerdown", "keydown"]) host?.removeEventListener(type, idle);
    };
  }, [choosing, back, review, examples]);

  /** Start a service example or a full owner path from the choice. */
  const pick = (id: DemoId) => {
    const track = menu === "owners" ? OWNER_TRACKS.find((path) => path.demo === id) : undefined;
    ownerRun.current = track ? { track, index: 0 } : null;
    setActiveOwner(track);
    if (track) setPlanSubject(track.plan);
    setPlayingExample(id);
    startAt(track?.spans[0].start ?? demoAt(id));
  };
  const openChoice = () => {
    toChoice(playingExample ?? undefined, false);
    clock.current?.go(HOLD, false);
  };
  const startAt = (position: number) => {
    setPlaybackMenu(false);
    setChoosing(false);
    setEnded(false);
    shut.current?.focus({ preventScroll: true });
    clock.current?.go(position, true);
  };
  const watchFull = () => {
    ownerRun.current = null;
    setActiveOwner(undefined);
    setPlayingExample(null);
    shortOpening.current = false;
    startAt(0);
  };
  const next = () => {
    ownerRun.current = null;
    setActiveOwner(undefined);
    setPlayingExample(null);
    startAt(PLAN_AT);
  };
  const visibleScene = (id: SceneId) => !activeOwner || activeOwner.visibleScenes.has(id);
  const caption = (id: SceneId, first: boolean, text: string) =>
    first && id === activeOwner?.scenes[0] ? activeOwner.opening?.caption ?? text : text;
  const transcript: readonly SceneId[] = activeOwner ? [...activeOwner.scenes, "plan", "close"] : scenes.map((scene) => scene.id);

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
      if (SCROLL_KEYS.has(e.key) && !(e.key === " " && e.target instanceof HTMLButtonElement) &&
          !(e.target instanceof Element && e.target.closest(".film-choice"))) e.preventDefault();
    };
    const still = (e: Event) => {
      if (e.target instanceof Element && e.target.closest(".film-choice")) return;
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
      className={cn("film", hanken.variable, closing && "is-closing", opening && "is-opening", choosing && "is-choosing")}
      role="dialog"
      aria-modal="true"
      aria-label="How we work: a short film, narrated by Elora"
      aria-describedby="film-purpose"
      style={{ "--total": sec(total) } as Vars}
    >
      <p id="film-purpose" className="film-sr">
        Ashan and Jordan build websites, shoot photo and video, and help businesses handle booking and follow-up.
      </p>
      <div ref={reel} className="film-reel">
        <GoldDefs />

        <ClipContext.Provider value={attach}>
        {parts.map(({ scene, start, duration }, i) => {
          if (!near.includes(i) || !visibleScene(scene.id)) return null;
          const art = SCENE_ART[scene.id](tall, planSubject);
          const cam = CAMERA[scene.id];
          return (
            <section
              key={scene.id}
              className={cn("film-scene", i === 0 && "is-first", i === parts.length - 1 && "is-last")}
              data-scene={scene.id}
              data-demo={isDemo(scene.id as SegmentId) || scene.id === "winePhoto" ? "" : undefined}
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
                } as Vars
              }
            >
              <div className="film-lens">
                <div className="film-far">{art.far}</div>
                <div className="film-mid">
                  <div className="film-orbit">{art.mid}</div>
                </div>
                {art.near && <div className="film-near">{art.near}</div>}
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
              {hero.cta.label}
            </a>
            <Link className="film-look" href="/" onClick={() => onLeave(false)}>
              Take a quick look at us first
            </Link>
          </div>
        </div>

        <div className="film-top">
          <div className="film-labels" aria-hidden="true">
            {parts
              .filter((p) => p.scene.label && visibleScene(p.scene.id))
              .map((p) => (
                <p key={p.scene.id} className="film-label" style={{ "--from": sec(p.start + 0.35), "--len": sec(p.duration - 0.7) } as Vars}>
                  {p.scene.label}
                </p>
              ))}
          </div>
          <div className="film-ctls">
            {!choosing && (
              <>
                <button type="button" className="film-examples-button film-playback-trigger" onClick={openChoice}>
                  {opening ? "Choose an example" : "Back to examples"}
                </button>
                <button type="button" className="film-examples-button film-playback-trigger" aria-expanded={playbackMenu}
                  onClick={() => setPlaybackMenu((open) => !open)}>
                  Options
                </button>
              </>
            )}
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
          {playbackMenu && (
            <div className="film-playback-menu" role="group" aria-label="Film options">
              <button type="button" onClick={next}>See the plan</button>
              <a href="#contact" onClick={() => onLeave(false)}>Book a call</a>
              <button type="button" onClick={watchFull}>Watch full walkthrough</button>
            </div>
          )}
        </div>

        <div className="film-caps" aria-hidden="true">
          {CAPTIONS.map((c, i) => visibleScene(c.scene) && (
            <p key={c.from} className={cn("film-cap", i === CAPTIONS.length - 1 && "film-cap--last")} style={{ "--from": sec(c.from), "--len": sec(c.to - c.from) } as Vars}>
              <span>{caption(c.scene, c.first, c.text)}</span>
            </p>
          ))}
        </div>
        {/* How far into the part playing: the first minute, a demo, or the plan and the close; none on the choice. */}
        <div className={cn("film-progress", choosing && "is-hidden")} aria-hidden="true">
          {segments
            .filter((p) => p.id !== "choice")
            .map((p) => (
              <i key={p.id} className={p.id === "finale" ? "is-last" : undefined} style={{ "--from": sec(p.start), "--len": sec(p.end - p.start) } as Vars} />
            ))}
        </div>
        <span className="film-clock" aria-hidden="true" />
      </div>

      {choosing && (
        <div className="film-choice" role="group" aria-labelledby="film-choice-h">
          <h2 className="film-choice-h" id="film-choice-h">
            {examples.heading}
          </h2>
          <button type="button" className="film-menu-switch" onClick={() => { setBack(null); setMenu(menu === "owners" ? "services" : "owners"); }}>
            {menu === "owners" ? "Browse by service" : "Browse by business"}
          </button>
          <ul className={cn("film-cards", menu === "services" && "film-cards--services", examples.cards.length === 2 && "film-cards--pair")}>
            {examples.cards.map((c) => {
              const watched = seen[menu].includes(c.demo);
              return (
                <li key={c.demo}>
                  <button
                    ref={(n) => {
                      cards.current[c.demo] = n;
                    }}
                    type="button"
                    className={cn("film-card", watched && "is-seen", nudge && "is-nudge")}
                    onClick={() => pick(c.demo)}
                  >
                    <span className="film-card-look" aria-hidden="true">
                      <picture>
                        <img src={c.image} alt="" decoding="async" />
                      </picture>
                    </span>
                    <span className="film-card-words">
                      <span className="film-card-title">{c.title}</span>
                      <span className="film-card-line">{c.line}</span>
                    </span>
                    {watched && (
                      <span className="film-card-seen">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <circle cx="12" cy="12" r="11" />
                          <path d="M7 12.4l3.2 3.2L17.2 8.6" />
                        </svg>
                        <span className="film-sr">, watched</span>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="film-choice-actions">
            <button type="button" className="film-next is-main" onClick={next}>See the plan</button>
            <a className="film-next film-choice-book" href="#contact" onClick={() => onLeave(false)}>Book a call</a>
            <button type="button" className="film-next" onClick={watchFull}>Watch full walkthrough</button>
            {!review && <button type="button" className="film-next film-effects-switch" aria-pressed={effectsOn} onClick={() => setEffectsOn((on) => !on)}>Sound effects</button>}
          </div>
        </div>
      )}

      {/* What she says, for screen readers, all at once. */}
      <div className="film-sr">
        {transcript.map((id) =>
          scenes.find((scene) => scene.id === id)?.lines.map((line, i) => <p key={line.text}>{caption(id, i === 0, line.text)}</p>)
        )}
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
