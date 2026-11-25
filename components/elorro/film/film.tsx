"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { hanken } from "@/components/elorro/fonts";
import { makeEffects } from "@/components/elorro/film/effects";
import { EloraAvatar } from "@/components/elorro/film/elora";
import { FilmWay } from "@/components/elorro/film/way";
import { ClipContext, MEDIA, SCENES, cameraOf, clipKey, type ArtProps, type MediaId } from "@/components/elorro/film/scenes";
import {
  ASK,
  INDUSTRIES,
  INDUSTRY,
  PICKER,
  SERVICE,
  SERVICES,
  captions,
  noteFor,
  timeline,
  voiceStretches,
  type Answers,
  type Industry,
  type SegmentId,
  type Service,
} from "@/components/elorro/film/script";
import { budget } from "@/components/elorro/work-video";
import { hero } from "@/lib/elorro";
import { cn } from "@/lib/utils";
import "@/components/elorro/film/film.css";

/**
 * "How we work", a short film narrated by Elora: the way in, and the film,
 * over the whole screen.
 *
 * The way in (way.tsx): /film opens on the home page's own intro, its line
 * drifting off as gold mist, then a door, and the welcome forming out of
 * gold dust over it. The tap that opens it (sound and the videos need one)
 * takes the camera through, into the film: her hook, then the picker asks
 * what kind of business they run (or the business is known already:
 * /film?for=…, straight on after her third line). Then one walkthrough,
 * every line and picture about their kind of business; after each of its
 * seven chapters the film stops on a question, "Is this something your
 * business needs?", Yes or No, until it's answered. Then their plan, what
 * they said yes to first, and the close; and if they said yes to anything, a
 * note to send us, already written, inside the film, which she talks them
 * through. The X and
 * Escape close the film, back to the door; booking leads to the page's
 * contact form. What they answer is kept for the visit, in memory only.
 *
 * The film's parts all sit on one timeline (script.ts, SEGMENTS), a few
 * seconds apart; the clock jumps between them (`go`) and stops on the
 * picker (HOLD), each question (ASKS), the close for a visitor who said no
 * to everything, and the note. It never moves on from a stop by itself.
 *
 * Every picture moves by CSS animations on one clock (film.css). This keeps
 * them all at one time, and that time with Elora's voice: the voice leads
 * while it plays, and should it stall the pictures wait for it, briefly;
 * where a scene runs on past her lines, she waits for it. Her lines are a
 * file each (script.ts): the first is fetched as the page loads and started
 * inside the door's tap, so a phone plays it; the next few are fetched as the
 * film nears them, and she moves to each in the quiet before it, on the same
 * audio element. Without her, the film runs as captions alone, on the same
 * timing. Only the scenes near the moment are in the page at all (WINDOW),
 * which keeps a phone's memory and work to two scenes at most.
 *
 * Scenes play videos (scenes.tsx, MEDIA): Elorro's real work, and the demos
 * of the tools (/demos), each once through. Their videos are made, and
 * started and stopped at once, inside the door's tap: an iPhone in Low Power
 * Mode lets a video play on its own later only if it was started in a
 * gesture (as work-video.tsx does on the pages). Each loads only shortly
 * before its scene, plays in step with the film, and stays on its still
 * under reduced motion or on a connection too slow for it. A phone upright
 * gets each video's phone cut, anything else its desktop cut.
 *
 * On a phone upright the scenes are laid out tall (scenes.tsx); the film
 * follows the screen if it turns.
 *
 * Outreach links: /film?for=winery (dental, contractor, general) opens on
 * the same way in; through the door, that business's version, after her
 * hook, with no picker. /film?for=dental&at=calls&play does the same from
 * that scene.
 *
 * For reviewing, silent, with no way in: /film?at=30 opens the film stopped
 * 30 seconds into the timeline, and /film?at=30&run plays it on from there;
 * /film?at=choice opens on the picker; /film?for=dental&at=booking stops one
 * second into that business's booking scene (&in=3: three seconds in;
 * &run: plays on; &ask: on its question); /film?for=winery&at=plan stops on
 * the winery's plan, and &run plays the plan and the close (&yes=found,photo:
 * as if they'd said yes to those and no to the rest; &yes=none, no to all);
 * /film?for=winery&yes=found,site&at=note opens on the note to send (&in=3:
 * three seconds into what she says over it).
 */

const { parts, segments, total } = timeline();
const CAPTIONS = captions();
type Seg = (typeof segments)[number];
const SEG = Object.fromEntries(segments.map((s) => [s.id, s])) as Record<SegmentId, Seg>;
const partOf = (id: string) => parts.find((p) => p.scene.id === id)!;
/** What each scene's pictures need: its lines' times, and (for the plan) what they've answered. */
const propsOf = (i: number, tall: boolean, ind: Industry, answers: Answers = {}): ArtProps => {
  const { scene, duration } = parts[i];
  return {
    id: scene.id,
    tall,
    ind: scene.ind ?? ind,
    at: scene.lines.map((l) => l.at),
    end: scene.lines.map((l) => l.end ?? l.at + 2),
    d: duration,
    content: scene.content,
    answers,
  };
};
/** The sound effects, in seconds into the film. */
const EFFECTS = parts.flatMap(({ scene, start }, i) =>
  (SCENES[scene.kind].sfx?.(propsOf(i, false, "general")) ?? []).map(([at, cue]) => ({ at: start + at, cue }))
);
/** Her glow follows what she says, not how long its caption stays up (and not a line she has no voice for yet). */
const SPOKEN = CAPTIONS.filter((c) => !c.silent).map((c) => ({ from: c.from, to: c.said }));
/** Where the film stops for the picker: once the hook has gone and its backdrop is in. */
const HOLD = SEG.pick.start + 0.6;
/**
 * The questions, in seconds into the film: each comes up as she starts
 * asking it (`show`), and the film stops once she has (`hold`), over the
 * scene's last frame.
 */
const ASKS = parts.flatMap(({ scene, start, segment }) =>
  scene.ask
    ? [{ service: scene.ask.service, segment, scene: scene.id, show: start + scene.ask.at - 0.1, hold: +(start + scene.ask.end + 0.25).toFixed(3) }]
    : []
);
type Asked = (typeof ASKS)[number];
/** The question up at `t`, in part `seg`. */
const askAt = (t: number, seg: SegmentId) => ASKS.find((a) => a.segment === seg && t >= a.show && t <= a.hold + 0.02) ?? null;
/** Into a part a moment before its first scene, so it comes in out of the dark. */
const LEAD = 0.45;
/** On from a part once its pictures have all but gone. */
const EXIT = 0.45;
const PLAN_AT = SEG.finale.start - LEAD;
/** The close's last frame: the film ends there, or goes on to the note. */
const CLOSE_END = SEG.finale.end;
/** The note: she talks them through it, and the film stops once her last caption has had its moment and gone (SEND_CAP). */
const SEND = partOf("send");
const SEND_CAP = 1.4;
const SEND_HOLD = SEND.start + (SEND.scene.lines[SEND.scene.lines.length - 1]?.end ?? 1) + SEND_CAP + 0.5;
const isIndustry = (id: SegmentId): id is Industry => (INDUSTRIES as readonly string[]).includes(id);
/** The part of the film at `t`: each reaches half way into the quiet either side of it (none, where one plays into the next). */
const segOf = (t: number) => segments.find((s, i) => !segments[i + 1] || t < (s.end + segments[i + 1].start) / 2) ?? segments[segments.length - 1];
const CLOSE = partOf("close");
/** The buttons on the close come up as she says to book a call, her last line there. */
const BOOK_AT = CLOSE.start + (CLOSE.scene.lines[CLOSE.scene.lines.length - 1]?.at ?? 0);
/** Elora comes in, full size, as she starts her hook (through the door, or for a business already known), and goes to her corner as it ends. */
const eloraFor = (id: "opener" | "opener-direct") => {
  const p = partOf(id);
  return { arrive: Math.max(0, p.start + (p.scene.lines[0]?.at ?? 1.2) - 0.6), corner: p.start + p.duration - 1.1 };
};
const ELORA = { intro: eloraFor("opener"), direct: eloraFor("opener-direct") };
/** When each video plays, in seconds into the film, and where in it it starts. */
const CLIP_AT = parts.flatMap(({ scene, start, segment }, i) =>
  (SCENES[scene.kind].clips?.(propsOf(i, false, "general")) ?? []).map((u) => ({
    key: clipKey(scene.id, u.media),
    media: u.media as MediaId,
    segment,
    from: start + u.at,
    to: start + u.until,
    offset: u.offset ?? 0,
  }))
);
const CLIP_KEYS = CLIP_AT.map((c) => c.key);
/** A video loads shortly before it plays, on the part the visitor actually chose. */
const PREFETCH = 8;
/** Nothing done on the picker for this long, in ms: the cards pulse once. */
const NUDGE_MS = 20000;
/** A phone upright: the scenes' tall layout. Kept the same as film.css's. */
const TALL = "(max-width: 767px) and (max-aspect-ratio: 3/4)";
/** The longest the pictures wait for a stalled voice, in ms, before going on without it. */
const STALL_MS = 2000;
/** Her voice against the film (script.ts): the stretches of her files, and between them, where she waits. */
const VOICE = voiceStretches();
const HAS_VOICE = VOICE.length > 0;
/** A wait shorter than this, she plays through. */
const MIN_WAIT = 0.2;
const href = (src: string) => new URL(src, location.href).href;
/**
 * The film's time at `pos` in her file `src`, while she plays: of the
 * stretches of that file (a shared line plays in every business's
 * walkthrough, a question after every chapter), the one `pos` is in that's
 * nearest the film's time `t`.
 */
const filmOf = (pos: number, t: number, src: string) => {
  let best = t;
  let gap = Infinity;
  for (const s of VOICE) {
    if (href(s.src) !== src || pos < s.file - 0.05 || pos > s.file + s.len + 0.3) continue;
    const f = s.film + pos - s.file;
    if (Math.abs(f - t) < gap) {
      gap = Math.abs(f - t);
      best = f;
    }
  }
  return best;
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
  const waits = !next || next.film - end >= MIN_WAIT || next.src !== s.src;
  if (off >= s.len && waits)
    return !next
      ? { src: s.src, pos: s.file + s.len, wait: true as const, until: Infinity }
      : next.src === s.src
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
/** Her files, fetched ahead so each is at hand when the film reaches it (once each). */
const warmed = new Set<string>();
const warm = (src: string) => {
  if (warmed.has(src)) return;
  warmed.add(src);
  fetch(src).catch(() => warmed.delete(src));
};
/** Her next files from `t`, as far as `ahead` seconds on. */
const warmFrom = (t: number, ahead: number) => {
  for (const s of VOICE) if (s.film + s.len >= t && s.film <= t + ahead) warm(s.src);
};
/** A scene is in the page from this many seconds before its start to as many after its end. */
const WINDOW = 2.5;
/** What counts as the visitor's say-so for a video the browser held back. */
const GESTURES = ["touchend", "pointerup", "click", "keydown"] as const;
/** Keys that would scroll the page under the film. */
const SCROLL_KEYS = new Set([" ", "PageDown", "PageUp", "Home", "End", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"]);
/** Scenes that hold their last frame (the film stops on them), rather than giving way to the next. */
const HOLDS = new Set(["close", "send"]);

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;
const sec = (t: number) => `${t.toFixed(3)}s`;
/** The scenes to have in the page at `t`. */
const scenesAt = (t: number) => parts.flatMap((p, i) => (t >= p.start - WINDOW && t <= p.start + p.duration + WINDOW ? [i] : []));
const same = (a: number[], b: number[]) => a.length === b.length && a.every((x, i) => x === b[i]);

/** Over the film, stopped: the picker, or neither. */
type Screen = "pick" | null;
const screenAt = (t: number): Screen => (segOf(t).id === "pick" ? "pick" : null);
/** The note to send: being written, or sent. */
type Note = "form" | "sent" | null;
type Showing = { at: number; run: boolean; review: boolean; ind?: Industry; answers?: Answers; note?: boolean; memory?: Visit };
type FilmEffects = ReturnType<typeof makeEffects>;
type Clips = Partial<Record<string, HTMLVideoElement>>;
/** What's kept for the visit, in memory only (nothing in the browser's storage): their business, their answers, the note as they left it. */
export type Visit = { ind?: Industry; answers: Answers; draft?: Draft };
type Draft = { name: string; business: string; contact: string; message: string; key: string };

/** The seven questions' short names, over each (the chapter it's about). */
const ASK_LABEL: Record<Service, string> = {
  found: "Getting found",
  reviews: "Reviews",
  site: "The website",
  booking: "Booking",
  calls: "Calls",
  tools: "Behind the scenes",
  photo: "Photo & video",
};

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
    /** The film's timing, to check a recording of it against: where each scene and part is, the questions, and her voice's stretches. */
    __eloFilmPlan?: {
      starts: Record<string, number>;
      segments: { id: string; start: number; end: number }[];
      hold: number;
      asks: Asked[];
      closeEnd: number;
      sendHold: number;
      voice: typeof VOICE;
      captions: typeof CAPTIONS;
    };
    /** Set only while reviewing (?at=): stops the film at a time, in seconds. */
    __eloFilm?: {
      seek(t: number): void;
      total: number;
      starts: Record<string, number>;
      hold: number;
      segments: { id: string; start: number; end: number }[];
    };
  }
}

const asIndustry = (v: string | null): Industry | undefined => (v && (INDUSTRIES as readonly string[]).includes(v) ? (v as Industry) : undefined);
/** A review link's answers (&yes=found,photo, or &yes=none): yes to those, no to the rest. */
const asAnswers = (v: string | null): Answers | undefined => {
  if (v === null) return undefined;
  const yes = new Set(v.split(","));
  return Object.fromEntries(SERVICES.map((s) => [s, yes.has(s)]));
};

/**
 * What a link opens on (see the top of this file). `door`: the way in
 * first, and the film from its tap; otherwise, a review, straight in.
 */
export function opening(q: URLSearchParams): (Showing & { door: boolean }) | null {
  const at = q.get("at");
  const ind = asIndustry(q.get("for"));
  const run = q.has("run");
  const answers = asAnswers(q.get("yes"));
  // The way in: through the door, her hook, then the picker; or, for a business already known, its walkthrough.
  if (at === null) return { at: ind ? SEG.direct.start : 0, run: true, review: false, ind, door: true };
  if (at === "choice" || at === "pick") return { at: HOLD, run: false, review: true, door: false };
  if (at === "plan") return { at: run ? PLAN_AT : SEG.finale.start + Number(q.get("in") ?? 1.2), run, review: true, ind, answers, door: false };
  // (&in=3: three seconds into her lines over it, a caption up.)
  if (at === "note") return { at: q.has("in") ? SEND.start + Number(q.get("in")) : SEND_HOLD, run: false, review: true, ind, answers: answers ?? { found: true }, note: true, door: false };
  const into = Number(q.get("in") ?? 1);
  if (at === "opener") return { at: (ind ? SEG.direct.start : 0) + into, run, review: true, ind, door: false };
  const named = parts.find((p) => p.scene.id === (ind ? `${at}-${ind}` : at)) ?? parts.find((p) => p.scene.id === at);
  // With &play, a scene opens on the way in, and plays from there with her voice once the door's open.
  if (named && q.has("play")) return { at: named.start + into, run: true, review: false, ind: named.scene.ind ?? ind, door: true };
  // With &ask, on its question, stopped there.
  const asked = named && q.has("ask") ? ASKS.find((a) => a.scene === named.scene.id) : undefined;
  if (asked) return { at: asked.hold, run: false, review: true, ind: named!.scene.ind ?? ind, answers, door: false };
  if (named) return { at: named.start + into, run, review: true, ind: named.scene.ind ?? ind, answers, door: false };
  return { at: Math.min(total, Math.max(0, Number(at) || 0)), run, review: true, ind, answers, door: false };
}

if (typeof window !== "undefined")
  window.__eloFilmPlan = {
    starts: Object.fromEntries(parts.map((p) => [p.scene.id, p.start])),
    segments: segments.map(({ id, start, end }) => ({ id, start, end })),
    hold: HOLD,
    asks: ASKS,
    closeEnd: CLOSE_END,
    sendHold: SEND_HOLD,
    voice: VOICE,
    captions: CAPTIONS,
  };

/**
 * /film: the way in, over the whole page, then the film from its door; a
 * review link (?at=…) opens the film straight away. Closed, the film goes
 * back to the door; booking a call puts both away for the page's form, and
 * `label` (in the page) brings the door back.
 */
export function FilmDoor({ label }: { label: string }) {
  const [showing, setShowing] = useState<Showing | null>(null);
  const [closing, setClosing] = useState(false);
  /** The way in: playing, at its door, going through it (the film opening behind), or away (the page). */
  const [way, setWay] = useState<"in" | "door" | "through" | "away" | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const clips = useRef<Clips>({});
  const effectsPlayer = useRef<FilmEffects>(null);
  const leaving = useRef(0);
  const entering = useRef(0);
  /** Where the door leads: the link's business, or the hook and the picker. */
  const target = useRef<Showing>({ at: 0, run: true, review: false });
  const visit = useRef<Visit>({ answers: {} });
  const again = useRef<HTMLButtonElement>(null);
  const refocus = useRef(false);

  useEffect(() => {
    let warmup = 0;
    if (HAS_VOICE) {
      const a = new Audio();
      a.preload = "auto";
      a.src = VOICE[0].src;
      audio.current = a;
      // Her hook's other lines, once the page has settled.
      warmup = window.setTimeout(() => warmFrom(0, 30), 3000);
    }
    const open = opening(new URLSearchParams(location.search));
    const timer = window.setTimeout(() => {
      if (open && !open.door) {
        if (open.ind) visit.current.ind = open.ind;
        setShowing(open);
        setWay("away");
        return;
      }
      if (open) target.current = open;
      if (open?.ind) visit.current.ind = open.ind;
      setWay("in");
    });
    return () => {
      audio.current?.pause();
      effectsPlayer.current?.close();
      effectsPlayer.current = null;
      clearTimeout(leaving.current);
      clearTimeout(entering.current);
      clearTimeout(timer);
      clearTimeout(warmup);
    };
  }, []);

  // The way in is the page while it's up: nothing under it scrolls, or is reached by a screen reader or the keyboard.
  useEffect(() => {
    if (way === null || way === "away") return;
    const page = document.querySelector<HTMLElement>(".elo");
    const root = document.documentElement;
    page?.setAttribute("inert", "");
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      page?.removeAttribute("inert");
      root.style.overflow = overflow;
    };
  }, [way, showing]);

  /** Inside the door's tap: her voice, the sound effects and the videos, unlocked, so a phone lets them play later. */
  const prime = useCallback((at: number) => {
    const player = (effectsPlayer.current ??= makeEffects());
    player?.unlock();
    player?.audible(true);
    const a = audio.current;
    if (a && HAS_VOICE) {
      const cue = voiceAt(at);
      place(a, cue.src, cue.pos, 0);
      a.muted = false;
      a.play().catch(() => {});
      if (cue.wait) a.pause();
    }
    // The videos, started and stopped here, so they may play on their own later: each one, even one already loaded.
    if (!reducedMotion()) {
      for (const key of CLIP_KEYS) {
        const v = (clips.current[key] ??= makeClip());
        v.play()?.catch(() => {});
        v.pause();
      }
    }
  }, []);

  /** What the film keeps for the visit, as it changes. */
  const remember = useCallback((patch: Partial<Visit>) => {
    visit.current = { ...visit.current, ...patch };
  }, []);

  /** The door, opened: the film starts behind it as the camera goes through (or at once, under reduced motion). */
  const enter = useCallback(() => {
    const go = { ...target.current, ind: target.current.ind ?? visit.current.ind, memory: { ...visit.current } };
    prime(go.at);
    clearTimeout(leaving.current);
    setClosing(false);
    setShowing(go);
    if (reducedMotion()) setWay(null);
    else {
      setWay("through");
      entering.current = window.setTimeout(() => setWay(null), 1700);
    }
  }, [prime]);

  const sound = useCallback((on: boolean) => {
    if (audio.current) audio.current.muted = !on;
  }, []);

  /** Leave the film: it fades, back to the door; or, booking a call, to the page's form. */
  const leave = useCallback((toDoor: boolean = true) => {
    audio.current?.pause();
    effectsPlayer.current?.audible(false);
    setClosing(true);
    // (From a review link, the page: there's no way in to go back to.)
    setWay(toDoor && !showing?.review ? "door" : "away");
    refocus.current = toDoor && !!showing?.review;
    leaving.current = window.setTimeout(() => {
      setShowing(null);
      setClosing(false);
    }, 450);
  }, [showing]);

  // A review closed: the focus back on the page, on what brings the door back. (Booking takes it to the form.)
  useEffect(() => {
    if (way !== "away" || showing || !refocus.current) return;
    refocus.current = false;
    again.current?.focus({ preventScroll: true });
  }, [way, showing]);

  return (
    <>
      <button ref={again} type="button" className="act film-launch" onClick={() => setWay("door")}>
        {label}
      </button>
      {way &&
        way !== "away" &&
        createPortal(<FilmWay stage={way} onOpen={enter} />, document.body)}
      {showing &&
        createPortal(
          <Film
            {...showing}
            onRemember={remember}
            audio={audio}
            effectsPlayer={effectsPlayer}
            clips={clips}
            closing={closing}
            onLeave={leave}
            onSound={sound}
          />,
          document.body
        )}
    </>
  );
}

function Film({
  at,
  run,
  review,
  ind: given,
  answers: reviewed,
  note: noting,
  memory,
  onRemember,
  audio,
  effectsPlayer,
  clips,
  closing,
  onLeave,
  onSound,
}: Showing & {
  onRemember: (patch: Partial<Visit>) => void;
  audio: React.RefObject<HTMLAudioElement | null>;
  effectsPlayer: React.RefObject<FilmEffects>;
  clips: React.RefObject<Clips>;
  closing: boolean;
  onLeave: (toDoor?: boolean) => void;
  onSound: (on: boolean) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const reel = useRef<HTMLDivElement>(null);
  const shut = useRef<HTMLButtonElement>(null);
  const book = useRef<HTMLElement>(null);
  const yes = useRef<HTMLButtonElement>(null);
  const clock = useRef<{ align(): void; go(t: number, run: boolean): void } | null>(null);
  /** Leaving: her voice, stopped, stays stopped. */
  const gone = useRef(closing);
  useLayoutEffect(() => {
    gone.current = closing;
  }, [closing]);
  const [muted, setMuted] = useState(false);
  const [effectsOn, setEffectsOn] = useState(true);
  /** Their business: picked, or given by the link (or earlier this visit). Until then, the general version's plan. */
  const known = given ?? memory?.ind;
  const [ind, setInd] = useState<Industry>(known ?? "general");
  const chosen = useRef<Industry | null>(known ?? null);
  /** Whether it's been picked (or given), for what's drawn. */
  const [picked, setPicked] = useState(!!known);
  /** What they've said to the questions, this visit (kept with the visit, in memory only). */
  const [answers, setAnswers] = useState<Answers>(() => reviewed ?? memory?.answers ?? {});
  const said = useRef(answers);
  useEffect(() => {
    said.current = answers;
    if (!review) onRemember({ answers });
  }, [answers, review, onRemember]);
  /** The question up, if any. */
  const [asking, setAsking] = useState<Asked | null>(() => askAt(at, segOf(at).id));
  /** The note to send (said yes to something): being written, or sent; and back on the close from it. */
  const [note, setNote] = useState<Note>(noting ? "form" : null);
  const [backed, setBacked] = useState(false);
  /** The note as they've written it so far: kept through Back, and for the visit. */
  const [draft, setDraft] = useState<Draft | undefined>(memory?.draft);
  const keepDraft = useCallback(
    (d: Draft | undefined) => {
      setDraft(d);
      onRemember({ draft: d });
    },
    [onRemember]
  );
  const [playbackMenu, setPlaybackMenu] = useState(false);
  useEffect(() => {
    if (!review && !closing) effectsPlayer.current?.audible(!muted && effectsOn);
  }, [effectsPlayer, muted, effectsOn, review, closing]);
  const [ended, setEnded] = useState(false);
  /** Over the film: the picker, or neither (playing). */
  const [screen, setScreen] = useState<Screen>(() => screenAt(at));
  /** The part of the film playing. */
  const [part, setPart] = useState<SegmentId>(() => segOf(at).id);
  const toScreen = useCallback((s: Screen) => {
    setPlaybackMenu(false);
    setScreen(s);
  }, []);
  const [near, setNear] = useState(() => scenesAt(at));
  const tall = useTall();
  // The videos stay on their stills under reduced motion, and on a connection too slow for them.
  const [still] = useState(() => reducedMotion() || budget() === "none");
  const sound = review ? null : audio;
  /** Said yes to anything: the close goes on to the note. */
  const anyYes = SERVICES.some((s) => answers[s] === true);

  /** A video's place on the set, as its scene comes in (or null, as it goes): its video goes in, or comes out. */
  const attach = useCallback(
    (key: string, slot: HTMLElement | null) => {
      if (still) return;
      const v = (clips.current[key] ??= makeClip());
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
    // (Transitions, such as a video fading in over its still, keep their own time.)
    const anims = () => el.getAnimations({ subtree: true }).filter((x) => !(typeof CSSTransition !== "undefined" && x instanceof CSSTransition));
    const tick0 = el.querySelector(".film-clock")?.getAnimations()[0];
    const now = () => Number(tick0?.currentTime ?? 0) / 1000;
    /** The part of the film playing, as the clock goes: the hook, the picker (stopped), a walkthrough, the plan and the close, or the note. */
    let seg: SegmentId = segOf(at).id;
    const start = seg === "pick" ? HOLD : at;
    let paused = !run || seg === "pick";
    /** Where it last went to: the walkthrough stops at the next question on from here. */
    let from = start;
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
     * The videos, at `t`: each loads PREFETCH seconds before it plays; while
     * it plays it runs on its own, put back only if it drifts a second off;
     * stopped, or not yet on, it waits on the right frame. One the browser
     * won't start (an iPhone in Low Power Mode, despite the click) starts on
     * the visitor's next tap.
     */
    const blocked = new Set<HTMLVideoElement>();
    // (Taps anywhere on the film count, the cards too.)
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
        const v = clips.current?.[c.key];
        if (!v) continue;
        // Load the cut for the current layout and switch to the other on rotation.
        if (seg === c.segment && t >= c.from - PREFETCH && t <= c.to) {
          const cut = MEDIA[c.media].cuts;
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
        const run = Math.max(0, t - c.from) + c.offset;
        // Played once, it holds its last frame; a loop made to repeat goes round.
        const loops = !!MEDIA[c.media].loop && dur > 0;
        const want = loops ? run % dur : run;
        const last = dur ? dur - 0.04 : Infinity;
        const pos = Math.min(want, last);
        const off = Math.abs(v.currentTime - pos);
        if (!moving || !v.isConnected || t < c.from || t > c.to || (!loops && want >= last)) {
          if (!v.paused) v.pause();
          if (t <= c.to && off > 0.05) v.currentTime = pos;
          continue;
        }
        if (loops && !v.loop) v.loop = true;
        if (v.paused) {
          if (off > 0.15) v.currentTime = pos;
          if (!blocked.has(v)) v.play()?.catch(refused(v));
        } else if (off > 1 && !(loops && dur - off < 1)) v.currentTime = pos;
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
    const leads = () => !!a && HAS_VOICE && !a.paused && !a.ended && !stalled && due < 0;
    /** The film's time by her voice, while it leads. */
    const heard = () => filmOf(a!.currentTime, now(), a!.src);
    const at0 = !paused && leads() ? filmOf(a!.currentTime, start, a!.src) : start;
    let effectFrom = at0;
    if (paused) pauseAt(at0);
    else runAt(at0);

    /**
     * Her voice kept where the film is (script.ts, voiceStretches): playing
     * through each stretch, quiet where the film runs on past her lines, on
     * again as the film reaches her next one, from where she stopped, or from
     * the next file; should she pick up further on than that (Chrome can, by
     * a fifth of a second), she's put back before the pictures go on, while
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
      if (!a || !HAS_VOICE || paused || waiting || stalled || off || due >= 0 || gone.current) return;
      if (a.ended) {
        // A file played to its end: quiet until her next stretch, in its file.
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
        if (href(v.src) !== a.src) return rest(v.src, v.pos, v.wait ? v.until : t, t);
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
        if (a.ended) {
          // Played out to the end of its file before she got going: on to her next stretch.
          arrived();
          runAt(now());
          keepVoice();
          return;
        }
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
     * The parts. The hook plays to the picker and stops there (HOLD); for a
     * business already known, it plays on into its walkthrough. A
     * walkthrough stops on each question once she has asked it, until it's
     * answered, and after its last goes on to the plan and the close. Said
     * yes to anything: the close goes on to the note, which stops once she's
     * said her line (SEND_HOLD); said no to everything, the film stops on the
     * close's last frame. Each boundary is checked on every tick.
     */
    let endTimer = 0;
    const nextAsk = () => (isIndustry(seg) ? ASKS.find((a) => a.segment === seg && a.hold > from + 0.01) : undefined);
    const segEnd = () => {
      if (seg === "intro") return HOLD;
      if (seg === "direct") return SEG.direct.end + EXIT;
      if (isIndustry(seg)) return nextAsk()?.hold ?? SEG[seg].end + EXIT;
      if (seg === "finale") return CLOSE_END;
      if (seg === "send") return SEND_HOLD;
      return Infinity;
    };
    /** The question up, as the clock reaches it (and down once it's been left). */
    let askTimer = 0;
    const keepAsk = (t: number) => {
      const up = askAt(t, seg);
      setAsking((had) => (had?.hold === up?.hold ? had : up));
      clearTimeout(askTimer);
      const next = !paused && ASKS.find((a) => a.segment === seg && a.show > t);
      if (next) askTimer = window.setTimeout(() => keepAsk(now()), Math.max(20, (next.show - t) * 1000 + 20));
    };
    const quiet = () => {
      clearTimeout(hold);
      clearTimeout(late);
      clearTimeout(stall);
      clearTimeout(endTimer);
      clearTimeout(askTimer);
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
      setPart(seg);
      paused = !play;
      from = t;
      effectFrom = t;
      if (a && HAS_VOICE) {
        if (!a.paused) a.pause();
        const v = voiceAt(t);
        place(a, v.src, v.pos, 0.05);
        warmFrom(t, 12);
      }
      if (play) runAt(t);
      else pauseAt(t);
      setNear(scenesAt(t));
      keepAsk(t);
      if (play) {
        keepVoice();
        armEnd();
      }
    };
    const checkEnd = (t: number) => {
      if (paused || t < segEnd()) return false;
      if (seg === "intro") {
        go(HOLD, false);
        toScreen("pick");
      } else if (seg === "direct") go(SEG[chosen.current ?? "general"].start - LEAD, true);
      else if (isIndustry(seg)) {
        const ask = nextAsk();
        // Stopped on the question, once she's asked it; after the last, on to their plan.
        if (ask) go(ask.hold, false);
        else go(PLAN_AT, true);
      } else if (seg === "finale") {
        if (SERVICES.some((x) => said.current[x] === true)) {
          setBacked(false);
          setNote("form");
          go(SEND.start - LEAD, true);
        } else {
          go(CLOSE_END, false);
          setEnded(true);
        }
      } else if (seg === "send") go(SEND_HOLD, false);
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

    // The pictures follow her voice, and wait for it if it stalls, for STALL_MS at most.
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
    let warmAt = -10;
    const tick = () => {
      const t = now();
      if (checkEnd(t)) return;
      const want = scenesAt(t);
      setNear((had) => (same(had, want) ? had : want));
      if (paused) return;
      const id = segOf(t).id;
      setPart((had) => (had === id ? had : id));
      const up = askAt(t, seg);
      setAsking((had) => (had?.hold === up?.hold ? had : up));
      if (HAS_VOICE && t - warmAt > 4) {
        warmAt = t;
        warmFrom(t, 12);
      }
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
        if (HAS_VOICE && a?.paused && !on && !voiceAt(t).wait) keepVoice();
        keepFace(t);
        keepClips(t, true);
      }
    };
    a?.addEventListener("waiting", onWaiting);
    a?.addEventListener("playing", onPlaying);
    const timer = window.setInterval(tick, 200);
    keepAsk(at0);
    if (!paused) {
      keepVoice();
      armEnd();
    }

    if (review) {
      window.__eloFilm = {
        seek: (t: number) => {
          quiet();
          seg = segOf(t).id;
          setPart(seg);
          paused = true;
          from = t;
          pauseAt(t);
          setNear(scenesAt(t));
          keepAsk(t);
        },
        total,
        starts: Object.fromEntries(parts.map((p) => [p.scene.id, p.start])),
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
      clock.current = null;
      delete window.__eloFilm;
    };
  }, [at, run, review, sound, effectsPlayer, clips, still, toScreen]);

  // Scenes just put in the page, or laid out anew for a turned screen: onto the clock before they're seen.
  useLayoutEffect(() => {
    clock.current?.align();
  }, [near, tall, ind]);

  useEffect(() => {
    if (ended) book.current?.focus({ preventScroll: true });
  }, [ended]);

  // On the picker: each walkthrough's start fetched ahead; the focus on the first card; the cards pulse once if nothing's done for a while.
  const cards = useRef<Record<string, HTMLButtonElement | null>>({});
  const [nudge, setNudge] = useState(false);
  useEffect(() => {
    if (!screen) return;
    if (HAS_VOICE) for (const i of INDUSTRIES) warmFrom(SEG[i].start, 4);
    if (!review) cards.current[PICKER[0]]?.focus({ preventScroll: true });
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
  }, [screen, review]);

  // A question up: the focus on Yes, so a keyboard or a screen reader is there to answer it.
  useEffect(() => {
    if (asking && !review) yes.current?.focus({ preventScroll: true });
  }, [asking, review]);

  const startAt = (position: number) => {
    setPlaybackMenu(false);
    setScreen(null);
    setNote(null);
    setBacked(false);
    setEnded(false);
    shut.current?.focus({ preventScroll: true });
    clock.current?.go(position, true);
  };
  /** Their business, picked: its walkthrough, its questions asked afresh. */
  const pick = (i: Industry) => {
    chosen.current = i;
    onRemember({ ind: i });
    setInd(i);
    setPicked(true);
    setAnswers({});
    said.current = {};
    startAt(SEG[i].start - LEAD);
  };
  /** A question answered: kept, and on to the next chapter. */
  const answer = (q: Asked, yes: boolean) => {
    const next = { ...said.current, [q.service]: yes };
    said.current = next;
    setAnswers(next);
    setAsking(null);
    shut.current?.focus({ preventScroll: true });
    clock.current?.go(q.hold + 0.06, true);
  };
  const toPlan = () => startAt(PLAN_AT);
  /** Back to the picker, stopped. */
  const toPicker = () => {
    setNote(null);
    toScreen("pick");
    clock.current?.go(HOLD, false);
  };
  /** From the note, back to the close's last frame, its buttons up (the gold one back to the note). */
  const toClose = () => {
    setNote(null);
    setBacked(true);
    setEnded(true);
    clock.current?.go(CLOSE_END, false);
  };
  /** From the close, back to the note (she doesn't say her line again). */
  const toNote = () => {
    setBacked(false);
    setEnded(false);
    setNote("form");
    clock.current?.go(SEND_HOLD, false);
  };
  /** The top bar's way back (or on): out of the hook, or the walkthrough. */
  const way = screen || note ? null : part === "intro" || part === "pick" ? "Pick your business" : part === "direct" ? "Skip intro" : isIndustry(part) || part === "finale" ? "Change business" : null;
  const onWay = () => {
    if (part === "direct") startAt(SEG[ind].start - LEAD);
    else toPicker();
  };

  // What she says, for screen readers, all at once: her hook, their walkthrough (each question once), the plan and the close.
  const transcript = [
    ...partOf("opener").scene.lines,
    ...parts.filter((p) => p.segment === ind).flatMap((p) => p.scene.lines.filter((l) => !l.heading)),
    { text: ASK },
    ...partOf("plan").scene.lines,
    ...CLOSE.scene.lines,
  ];

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
        const stops = [...el.querySelectorAll<HTMLElement>("button, a[href], input, textarea")].filter((n) => getComputedStyle(n).visibility !== "hidden");
        const i = stops.indexOf(document.activeElement as HTMLElement);
        const next = e.shiftKey ? (i <= 0 ? stops.length - 1 : i - 1) : i >= stops.length - 1 ? 0 : i + 1;
        e.preventDefault();
        stops[next]?.focus();
        return;
      }
      // A button's own Space still presses it; a field takes every key it's typed.
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (SCROLL_KEYS.has(e.key) && !typing && !(e.key === " " && e.target instanceof HTMLButtonElement) && !(e.target instanceof Element && e.target.closest(".film-choice, .film-note")))
        e.preventDefault();
    };
    const still = (e: Event) => {
      if (e.target instanceof Element && e.target.closest(".film-choice, .film-note")) return;
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
  const elora = part === "direct" ? ELORA.direct : ELORA.intro;

  return (
    <div
      ref={root}
      className={cn("film", hanken.variable, closing && "is-closing", (screen || note) && "is-choosing", note && "is-noting")}
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
            if (!near.includes(i)) return null;
            const p = propsOf(i, tall, ind, answers);
            const art = SCENES[scene.kind].art(p);
            const cam = cameraOf(scene.kind);
            return (
              <section
                key={scene.id}
                className={cn("film-scene", i === 0 && "is-first", HOLDS.has(scene.id) && "is-last")}
                data-scene={scene.kind}
                data-id={scene.id}
                aria-hidden="true"
                style={
                  {
                    "--s": sec(start),
                    "--d": sec(duration),
                    // (The camera's move ends with the scene's own pictures: still, under its question.)
                    "--cd": sec(Math.max(0.5, scene.content - (scene.ask ? 1 : 0))),
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

        <div className="film-grain" aria-hidden="true" />

        <EloraAvatar lines={SPOKEN} arrive={elora.arrive} toCorner={elora.corner} />

        <div className="film-frame">
          {/* The close's two ways on. Said yes to anything, the film goes on to the note instead, and they're here only on the way back from it. */}
          {(!anyYes || backed) && !note && (
            <div className="film-end" style={{ "--from": sec(BOOK_AT) } as Vars}>
              {anyYes ? (
                <button ref={book as React.RefObject<HTMLButtonElement>} type="button" className="film-book" onClick={toNote}>
                  Send your note
                </button>
              ) : (
                <a ref={book as React.RefObject<HTMLAnchorElement>} className="film-book" href="#contact" onClick={() => onLeave(false)}>
                  {hero.cta.label}
                </a>
              )}
              <Link className="film-look" href="/" onClick={() => onLeave(false)}>
                Take a quick look at us first
              </Link>
            </div>
          )}
        </div>

        <div className="film-top">
          <div className="film-labels" aria-hidden="true">
            {parts.map(({ scene, start, duration }, i) => {
              if (!near.includes(i)) return null;
              // Each label from its time (the first a moment in) to the next's, the last to a moment before the scene ends.
              return scene.labels.map(({ text, at }, k) => {
                const next = scene.labels[k + 1];
                const from = k ? at : 0.35;
                const to = next ? next.at - 0.05 : duration - 0.35;
                return (
                  <p key={`${scene.id}-${k}`} className="film-label" style={{ "--from": sec(start + from), "--len": sec(Math.max(0.5, to - from)) } as Vars}>
                    {text}
                  </p>
                );
              });
            })}
          </div>
          <div className="film-ctls">
            {way && (
              <button type="button" className="film-examples-button film-playback-trigger" onClick={onWay}>
                {way}
              </button>
            )}
            {!note && (
              <button type="button" className="film-examples-button film-playback-trigger" aria-expanded={playbackMenu} onClick={() => setPlaybackMenu((open) => !open)}>
                Options
              </button>
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
              {picked && part !== "finale" && (
                <button type="button" onClick={toPlan}>
                  See my plan
                </button>
              )}
              {screen !== "pick" && (
                <button type="button" onClick={toPicker}>
                  {picked ? "Change business" : "Pick your business"}
                </button>
              )}
              <a href="#contact" onClick={() => onLeave(false)}>
                Book a call
              </a>
              {!review && (
                <button type="button" className="film-effects-switch" aria-pressed={effectsOn} onClick={() => setEffectsOn((on) => !on)}>
                  Sound effects: {effectsOn ? "on" : "off"}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="film-caps" aria-hidden="true">
          {CAPTIONS.map((c, i) => {
            if (!near.includes(c.part) || c.heading) return null;
            // The film's last caption stays on its final frame; on the note, hers goes once said, out of the way of the form.
            const last = i === CAPTIONS.length - 1;
            const len = last && c.segment === "send" ? c.said - c.from + SEND_CAP : c.to - c.from;
            return (
              <p key={c.from} className={cn("film-cap", last && c.segment !== "send" && "film-cap--last")} style={{ "--from": sec(c.from), "--len": sec(len) } as Vars}>
                <span>{c.text}</span>
              </p>
            );
          })}
        </div>
        {/* How far into the part playing: the hook, a walkthrough, or the plan and the close; none on the picker or the note. */}
        <div className={cn("film-progress", (screen || note) && "is-hidden")} aria-hidden="true">
          {segments
            .filter((p) => p.id !== "pick" && p.id !== "send")
            .map((p) => (
              <i key={p.id} className={p.id === "finale" ? "is-last" : undefined} style={{ "--from": sec(p.start), "--len": sec(p.end - p.start) } as Vars} />
            ))}
        </div>
        <span className="film-clock" aria-hidden="true" />
      </div>

      {screen === "pick" && (
        <div className="film-choice" role="group" aria-labelledby="film-choice-h">
          <h2 className="film-choice-h" id="film-choice-h">
            What kind of business do you run?
          </h2>
          <ul className="film-cards">
            {PICKER.map((i) => (
              <FilmCard
                key={i}
                {...INDUSTRY[i]}
                nudge={nudge}
                onClick={() => pick(i)}
                place={(n) => {
                  cards.current[i] = n;
                }}
              />
            ))}
          </ul>
          <button type="button" className="film-choice-other" onClick={() => pick("general")}>
            Don’t see yours? <span>Watch the general version</span>
          </button>
          <div className="film-choice-actions">
            <a className="film-next film-choice-book" href="#contact" onClick={() => onLeave(false)}>
              Book a call
            </a>
          </div>
        </div>
      )}

      {/* After each chapter: is this something they need? The film waits on it. */}
      {asking && !note && (
        <div className="film-ask" role="group" aria-labelledby="film-ask-q" key={asking.hold}>
          <div className="film-ask-words">
            <p className="film-ask-label">{ASK_LABEL[asking.service]}</p>
            <h2 className="film-ask-q" id="film-ask-q">
              {ASK}
            </h2>
          </div>
          <div className="film-ask-answers">
            <button ref={yes} type="button" className="film-ask-yes" onClick={() => answer(asking, true)}>
              Yes
            </button>
            <button type="button" className="film-ask-no" onClick={() => answer(asking, false)}>
              No
            </button>
          </div>
        </div>
      )}

      {note && (
        <FilmNote
          ind={ind}
          answers={answers}
          kept={draft}
          onDraft={keepDraft}
          sent={note === "sent"}
          review={review}
          onSent={() => setNote("sent")}
          onBack={toClose}
          onLeave={onLeave}
        />
      )}

      <div className="film-sr">
        {transcript.map((line, i) => (
          <p key={i}>{line.text}</p>
        ))}
      </div>
    </div>
  );
}

/**
 * The note to send, inside the film, once they've said yes to something:
 * their name, their business, how to reach them, and the message, already
 * written from their business and their yeses, for them to add to. It goes
 * through the site's contact form's route (app/api/lead, Resend), with their
 * kind of business and every answer, and then says thank you. Kept as it's
 * written for the visit (in memory), should they leave and come back.
 */
function FilmNote({
  ind,
  answers,
  kept: before,
  onDraft,
  sent,
  review,
  onSent,
  onBack,
  onLeave,
}: {
  ind: Industry;
  answers: Answers;
  kept?: Draft;
  onDraft: (draft: Draft | undefined) => void;
  sent: boolean;
  review: boolean;
  onSent: () => void;
  onBack: () => void;
  onLeave: (toDoor?: boolean) => void;
}) {
  const yesTo = SERVICES.filter((s) => answers[s] === true);
  const key = `${ind}:${yesTo.join(",")}`;
  const kept = before?.key === key ? before : undefined;
  const [draft, setDraft] = useState<Draft>(() => kept ?? { name: "", business: "", contact: "", message: noteFor(ind, yesTo), key });
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const startedAt = useRef(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const thanks = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    startedAt.current = Date.now();
    if (!review) heading.current?.focus({ preventScroll: true });
  }, [review]);
  useEffect(() => {
    if (sent && !review) thanks.current?.focus({ preventScroll: true });
  }, [sent, review]);
  const edit = (field: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...draft, [field]: e.target.value };
    setDraft(next);
    onDraft(next);
  };
  /** Into the message: the cursor at its end, to add to it (unless they've put it somewhere). */
  const toEnd = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const t = e.currentTarget;
    requestAnimationFrame(() => {
      if (t.selectionStart === 0 && t.selectionEnd === 0) t.setSelectionRange(t.value.length, t.value.length);
    });
  };
  const send = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError("");
    setFieldErrors({});
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          business: draft.business,
          contact: draft.contact,
          message: draft.message,
          website: String(form.get("website") ?? ""),
          startedAt: startedAt.current,
          source: "elorro.com/film",
          film: {
            industry: INDUSTRY[ind].title,
            yes: SERVICES.filter((s) => answers[s] === true).map((s) => SERVICE[s].title),
            no: SERVICES.filter((s) => answers[s] === false).map((s) => SERVICE[s].title),
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFieldErrors(data.fieldErrors ?? {});
        throw new Error(data.error ?? "That didn’t send.");
      }
      onDraft(undefined);
      setStatus("idle");
      onSent();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "That didn’t send.");
    }
  };
  if (sent)
    return (
      <div className="film-note is-sent">
        <div className="film-note-card">
          <h2 ref={thanks} className="film-note-h" tabIndex={-1}>
            Got it. One of us will get back to you within the hour.
          </h2>
          <Link className="film-book film-note-home" href="/" onClick={() => onLeave(false)}>
            Take a quick look at us
          </Link>
        </div>
      </div>
    );
  const field = (name: "name" | "business" | "contact", label: string, autoComplete: string, type = "text") => (
    <div className={cn("film-note-field", fieldErrors[name] && "has-error")}>
      <label htmlFor={`film-note-${name}`}>{label}</label>
      <input
        id={`film-note-${name}`}
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={draft[name]}
        onChange={edit(name)}
        aria-invalid={!!fieldErrors[name] || undefined}
        aria-describedby={fieldErrors[name] ? `film-note-${name}-error` : undefined}
        required={name !== "business"}
      />
      {fieldErrors[name] && (
        <p className="film-note-error" id={`film-note-${name}-error`}>
          {fieldErrors[name]}
        </p>
      )}
    </div>
  );
  return (
    <div className="film-note">
      <button type="button" className="film-note-back" onClick={onBack}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14.5 6l-6 6 6 6" />
        </svg>
        Back
      </button>
      <form className="film-note-card" onSubmit={send} noValidate aria-labelledby="film-note-h" aria-describedby="film-note-sub">
        <h2 ref={heading} className="film-note-h" id="film-note-h" tabIndex={-1}>
          Send it now. We’ll get back to you within an hour.
        </h2>
        <p className="film-note-sub" id="film-note-sub">
          You said yes, so we’ve written your message for you. Add your name, your business and how to reach you.
        </p>
        <div className="film-note-row">
          {field("name", "Name", "name")}
          {field("business", "Business", "organization")}
        </div>
        {field("contact", "Email or phone", "email")}
        <div className={cn("film-note-field", fieldErrors.message && "has-error")}>
          <label htmlFor="film-note-message">Message</label>
          <textarea
            id="film-note-message"
            name="message"
            rows={5}
            value={draft.message}
            onChange={edit("message")}
            onFocus={toEnd}
            aria-invalid={!!fieldErrors.message || undefined}
            aria-describedby={fieldErrors.message ? "film-note-message-error" : undefined}
            required
          />
          {fieldErrors.message && (
            <p className="film-note-error" id="film-note-message-error">
              {fieldErrors.message}
            </p>
          )}
        </div>
        {/* A field a person never sees, so never fills (app/api/lead). */}
        <div className="film-note-trap" aria-hidden="true">
          <label htmlFor="film-note-website">Website</label>
          <input id="film-note-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <button type="submit" className="film-book film-note-send" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send"}
        </button>
        <p className="film-note-status" role="status" aria-live="polite">
          {status === "error" ? error : ""}
        </p>
      </form>
    </div>
  );
}

/** A card on the picker: its look, its name, a line. */
function FilmCard({
  title,
  line,
  image,
  nudge,
  onClick,
  place,
}: {
  title: string;
  line: string;
  image: string;
  nudge: boolean;
  onClick: () => void;
  place: (n: HTMLButtonElement | null) => void;
}) {
  return (
    <li>
      <button ref={place} type="button" className={cn("film-card", nudge && "is-nudge")} onClick={onClick}>
        <span className="film-card-look" aria-hidden="true">
          <picture>
            <img src={image} alt="" decoding="async" />
          </picture>
        </span>
        <span className="film-card-words">
          <span className="film-card-title">{title}</span>
          <span className="film-card-line">{line}</span>
        </span>
      </button>
    </li>
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
