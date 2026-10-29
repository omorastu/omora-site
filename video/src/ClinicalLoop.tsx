import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AbsoluteFill, continueRender, delayRender, Easing, useCurrentFrame } from "remotion";
import { DENTIST_LETTER, DRAFT, FAMILY_LETTER, RECORD, type NavKey } from "./clinical/data";
import { DraftDialog, FollowUpsScreen, RecordScreen, SUMMARY_LINES, SummaryScreen, type Tab } from "./clinical/screens";
import { COLORS, Viewport } from "./clinical/tw";
import { Clock, DemoBanner, PhoneHeader, RESET, Scale, Sidebar } from "./clinical/ui";

/**
 * The Clinical Scribe live card: one invented consult going through the
 * app, filmed in close-up. The recording (timer and level meter running),
 * the summary filling in line by line, the referring dentist's letter and
 * then the family's take-home letter drafting, and the follow-up list with
 * one case picked and its message drafting, which then holds, finished, for
 * four seconds as the last beat; then a fade back into frame 0, so the loop
 * has no seam.
 *
 * Not a recording. The real app talks to a live backend with real patient
 * data, so this is a replica built from its source (layout, Tailwind
 * classes, labels, states; see src/clinical/) and filled with invented
 * data from src/clinical/data.ts, the only place on-screen text comes from.
 *
 * The camera. On the site a card is about 584px wide, so a whole 1440px app
 * screen in it is text a few pixels high. So the app is laid out in a narrow
 * window (VIEW: 840 CSS px with its sidebar, 360 on the phone), where every
 * panel is one column, and the camera frames that column: on desktop about
 * 2.4× closer than the whole 1440px screen, on the phone the panel edge to
 * edge. It moves between panels on eased keyframes (CAMERA), finding each
 * one by its `cam` mark in the laid-out page, so the framing follows the
 * layout if the wording changes. The demo banner is pinned to the frame
 * above it.
 */

loadGeist("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });
loadGeistMono("normal", { weights: ["400", "500"], subsets: ["latin"] });

export type Size = "desktop" | "phone";

export const FPS = 30;
export const FRAMES = 728; // 24.3s

export const FRAME_SIZE: Record<Size, { width: number; height: number }> = {
  desktop: { width: 2160, height: 1350 },
  phone: { width: 1170, height: 1462 },
};

/**
 * The app's window (CSS px), and the width of its page column there (the
 * window less the sidebar's 208 and the page's padding).
 */
const VIEW: Record<Size, { width: number; column: number }> = {
  desktop: { width: 840, column: 584 },
  phone: { width: 360, column: 328 },
};

/**
 * The demo banner, pinned across the top of the frame: its scale in frame px
 * per CSS px, and the lines it takes at that scale (one on desktop, two on
 * the phone, as in the app). The camera's view is the frame below it.
 */
const BANNER: Record<Size, { scale: number; lines: number }> = {
  desktop: { scale: 3.5, lines: 1 },
  phone: { scale: 3, lines: 2 },
};
/** The banner's height in frame px: py-1.5 and text-xs's 16px lines. */
const bannerHeight = (size: Size) => (12 + 16 * BANNER[size].lines) * BANNER[size].scale;

/** CSS px of page ground the camera keeps either side of a panel. */
const PAD = 10;
/** Tall enough for the longest page, so nothing the camera visits is cut off. */
const WORLD_HEIGHT = 2400;

/** Frame px per CSS px with a panel framed edge to edge, as the dialog is drawn. */
const closeUp = (size: Size) => FRAME_SIZE[size].width / (VIEW[size].column + 2 * PAD);

/** The beats, in frames. Both sizes share them. */
const T = {
  stop: 80, // Stop pressed
  summary: [86, 100], // into the summary
  revealAt: (line: number) => 104 + line * 7, // line i of the summary starts appearing
  reveal: 10, // frames each line takes
  dentist: [234, 242], // tab switch to the referring dentist letter
  dentistStream: [244, 306],
  family: [340, 348], // tab switch to the family letter
  familyStream: [350, 410],
  followUps: [438, 452], // into follow-ups
  point: 488, // the pointer reaches Zz-Maya's row
  pick: 496, // and picks it
  dialog: [504, 512],
  draftStream: [514, 574],
  end: [694, FRAMES - 1], // back into frame 0, once the finished message has held for 4s
};

/**
 * Frames the reduced-motion still and the case-study extras are taken
 * from, each at rest with nothing half-drawn. They are four different
 * screens, so the case study never shows one twice.
 */
export const STILL_FRAME = 436; // the family letter
export const EXTRA_FRAMES = { summary: 230, doctorLetter: 337, followUps: 640 };

const ease = Easing.bezier(0.65, 0, 0.35, 1);
/** For following a draft down as it arrives: steadier through the middle. */
const glide = Easing.bezier(0.45, 0, 0.55, 1);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const progress = (frame: number, [a, b]: number[]) => clamp01((frame - a) / (b - a));

/** Characters of a draft that have arrived by a frame. */
const chars = (frame: number, window: number[], text: string) => Math.round(progress(frame, window) * text.length);

/* -------------------------------------------------------------------------
 * The camera
 * ---------------------------------------------------------------------- */

type Rect = { x: number; y: number; w: number; h: number };

/**
 * What the camera frames: the panel(s) marked `id` (several are framed
 * together), the panel's width plus PAD across, and the panel's top,
 * middle or bottom against the frame's. `zoom` goes closer than that.
 */
type Shot = { id: string | string[]; align: "top" | "center" | "bottom"; zoom?: number };
type Key = [frame: number, shot: Shot, curve?: (x: number) => number];

const SHOT = {
  record: { id: ["rec-head", "rec"], align: "top" },
  summaryTop: { id: "sum-head", align: "top" },
  summaryEnd: { id: "sum-card", align: "bottom" },
  dentistEnd: { id: "letter-dentist", align: "bottom" },
  familyEnd: { id: "letter-family", align: "bottom" },
  followUpsTop: { id: "fu-head", align: "top" },
  maya: { id: "row-maya", align: "center" },
} satisfies Record<string, Shot>;

/**
 * The camera's path: a shot at each frame, eased between (`curve`, for the
 * move that ends at that key). Every move between pages happens inside
 * that page change, while both are on screen to be found.
 */
const CAMERA: Key[] = [
  [0, SHOT.record],
  [T.summary[0], SHOT.record],
  [T.summary[1], SHOT.summaryTop],
  [T.revealAt(1), SHOT.summaryTop],
  [T.revealAt(SUMMARY_LINES - 2) + T.reveal, SHOT.summaryEnd, glide], // down with the lines as they appear
  [T.revealAt(SUMMARY_LINES - 2) + T.reveal + 10, SHOT.summaryEnd],
  [T.dentist[0] - 8, SHOT.summaryTop], // back up to the tabs: the whole summary at rest
  [T.dentistStream[0] + 6, SHOT.summaryTop],
  [T.dentistStream[1], SHOT.dentistEnd, glide], // down with the letter as it drafts
  [T.dentistStream[1] + 8, SHOT.dentistEnd],
  [T.family[0] - 6, SHOT.summaryTop], // back up: the dentist letter at rest
  [T.familyStream[0] + 6, SHOT.summaryTop],
  [T.familyStream[1], SHOT.familyEnd, glide],
  [T.familyStream[1] + 6, SHOT.familyEnd],
  [T.followUps[0] - 4, SHOT.summaryTop], // back up: the family letter at rest
  [T.followUps[0], SHOT.summaryTop],
  [T.followUps[1], SHOT.followUpsTop],
  [T.followUps[1] + 10, SHOT.followUpsTop],
  [T.point - 2, SHOT.maya], // down the list to the case about to be picked
  [T.end[0], SHOT.maya],
  [FRAMES - 1, SHOT.record], // home to frame 0's shot
];

/** Where a marked panel (or several, together) sits in the page, in CSS px. */
function rectOf(world: HTMLElement, id: string | string[]): Rect {
  const o = world.getBoundingClientRect();
  const k = o.width / world.offsetWidth; // the page's current scale on screen
  const rects = [id].flat().map((name) => {
    const el = world.querySelector(`[data-cam="${name}"]`);
    if (!el) throw new Error(`Clinical camera: nothing marked "${name}" on screen`);
    return el.getBoundingClientRect();
  });
  const left = Math.min(...rects.map((r) => r.left));
  const top = Math.min(...rects.map((r) => r.top));
  const right = Math.max(...rects.map((r) => r.right));
  const bottom = Math.max(...rects.map((r) => r.bottom));
  return { x: (left - o.left) / k, y: (top - o.top) / k, w: (right - left) / k, h: (bottom - top) / k };
}

/** The part of the page a shot shows, in CSS px, for a frame `aspect` (height / width). */
function viewOf(shot: Shot, r: Rect, aspect: number): Rect {
  const w = (r.w + 2 * PAD) / (shot.zoom ?? 1);
  const h = w * aspect;
  const x = r.x + r.w / 2 - w / 2;
  const y = shot.align === "top" ? r.y - PAD : shot.align === "bottom" ? r.y + r.h + PAD - h : r.y + r.h / 2 - h / 2;
  return { x, y, w, h };
}

/** The camera's view at a frame. Scale eases evenly (in log), position linearly. */
function cameraAt(frame: number, find: (id: string | string[]) => Rect, aspect: number): Rect {
  let i = 0;
  while (i + 1 < CAMERA.length && frame >= CAMERA[i + 1][0]) i++;
  const [f0, a] = CAMERA[i];
  const at = (shot: Shot) => viewOf(shot, find(shot.id), aspect);
  if (i + 1 === CAMERA.length) return at(a);
  const [f1, b, curve = ease] = CAMERA[i + 1];
  const k = curve(clamp01((frame - f0) / (f1 - f0)));
  if (k === 0 || a === b) return at(a);
  const [va, vb] = [at(a), at(b)];
  const w = Math.exp(Math.log(va.w) + (Math.log(vb.w) - Math.log(va.w)) * k);
  const cx = va.x + va.w / 2 + (vb.x + vb.w / 2 - va.x - va.w / 2) * k;
  const cy = va.y + va.h / 2 + (vb.y + vb.h / 2 - va.y - va.h / 2) * k;
  return { x: cx - w / 2, y: cy - (w * aspect) / 2, w, h: w * aspect };
}

/**
 * The page (`children`, laid out at the app's window width) seen through the
 * camera. It is aimed after layout, from where the marked panels actually
 * are, and only once the fonts have loaded, so the text it frames is the
 * text in the video.
 */
const Camera: React.FC<{ size: Size; frame: number; children: ReactNode; overlay?: ReactNode }> = ({ size, frame, children, overlay }) => {
  const world = useRef<HTMLDivElement>(null);
  const aim = useRef(() => {});
  const fontsReady = useRef(false);
  const [handle] = useState(() => delayRender("Clinical camera: waiting for fonts"));

  useLayoutEffect(() => {
    // The view's size comes from the frame's, not from layout: the frame
    // isn't sized yet when this first runs. The page has a fixed width, so
    // where its panels sit is already known.
    const width = FRAME_SIZE[size].width;
    const height = FRAME_SIZE[size].height - bannerHeight(size);
    aim.current = () => {
      const w = world.current;
      if (!w) return;
      const v = cameraAt(frame, (id) => rectOf(w, id), height / width);
      const s = width / v.w;
      // Whole frame pixels, so text is as sharp in motion as at rest.
      w.style.transform = `translate(${Math.round(-v.x * s)}px, ${Math.round(-v.y * s)}px) scale(${s})`;
    };
    aim.current();
    if (!fontsReady.current) {
      document.fonts.ready.then(() => {
        aim.current();
        if (!fontsReady.current) {
          fontsReady.current = true;
          continueRender(handle);
        }
      });
    }
  }, [frame, handle, size]);

  const top = bannerHeight(size);
  return (
    <div style={{ position: "absolute", left: 0, top, right: 0, bottom: 0, overflow: "hidden", background: COLORS["zinc-50"] }}>
      <div
        ref={world}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: VIEW[size].width,
          height: WORLD_HEIGHT,
          display: "flex",
          flexDirection: size === "desktop" ? "row" : "column",
          transformOrigin: "0 0",
        }}
      >
        {children}
      </div>
      {overlay}
    </div>
  );
};

/* -------------------------------------------------------------------------
 * The scenes
 * ---------------------------------------------------------------------- */

type Scene = {
  key: string;
  nav: NavKey | null;
  node: ReactNode;
  /** A dialog over the view, drawn at a visibility (its own fade times the page's). */
  overlay?: (visible: number) => ReactNode;
  t: number;
};

/** A tab switch in progress: the card being left, and how far the new one has faded in. */
type TabSwitch = { from: Tab; outgoing: number; incoming: number };

/** The scene at a frame. `t` is the loop clock in seconds. */
function sceneAt(size: Size, frame: number, name: string, tabSwitch?: TabSwitch): Scene {
  const t = frame / FPS;
  switch (name) {
    case "record":
      return {
        key: "record",
        nav: "record",
        t,
        node: <RecordScreen seconds={RECORD.startSeconds + Math.floor(frame / FPS)} stopPressed={frame >= T.stop && frame < T.stop + 4} />,
      };
    case "summary":
    case "dentist":
    case "family": {
      const tab = name as Tab;
      const stream = tab === "dentist" ? T.dentistStream : T.familyStream;
      const body = tab === "dentist" ? DENTIST_LETTER.body : FAMILY_LETTER.body;
      const letterChars = tab === "summary" ? 0 : chars(frame, stream, body);
      return {
        key: "summaryPage",
        nav: null,
        t,
        node: (
          <SummaryScreen
            tab={tab}
            shown={(line) => (frame - T.revealAt(line)) / T.reveal}
            letterChars={letterChars}
            drafting={tab !== "summary" && letterChars < body.length}
            opacity={tabSwitch?.incoming ?? 1}
            from={tabSwitch && { tab: tabSwitch.from, opacity: tabSwitch.outgoing }}
          />
        ),
      };
    }
    case "followUps": {
      const open = progress(frame, T.dialog);
      return {
        key: "followUps",
        nav: "followups",
        t,
        node: <FollowUpsScreen pointed={frame >= T.point && frame < T.pick + 6} picked={frame >= T.pick} />,
        overlay:
          open > 0
            ? (visible) => (
                <DraftDialog
                  chars={chars(frame, T.draftStream, DRAFT.body)}
                  visible={ease(open) * visible}
                  zoom={closeUp(size)}
                  width={VIEW[size].column + 2 * PAD - 32}
                />
              )
            : undefined,
      };
    }
  }
  throw new Error(`no scene ${name}`);
}

/**
 * The scenes in order, with the frames their transition in runs over. A
 * "page" change is a navigation: the content dips out and the next page
 * fades in under the same chrome. A "tab" change keeps the header and tabs
 * still and dips only the card below them, as clicking a tab does.
 */
const ORDER: { name: string; fade: number[]; kind: "page" | "tab" }[] = [
  { name: "record", fade: [0, 0], kind: "page" },
  { name: "summary", fade: T.summary, kind: "page" },
  { name: "dentist", fade: T.dentist, kind: "tab" },
  { name: "family", fade: T.family, kind: "tab" },
  { name: "followUps", fade: T.followUps, kind: "page" },
];

/** A dip: the old content is gone by `split` of the way, the new one starts at 1 - `split`. */
const dipOut = (k: number, split = 0.6) => 1 - ease(clamp01(k / split));
const dipIn = (k: number, split = 0.6) => ease(clamp01((k - (1 - split)) / split));

type Content = { scene: Scene; opacity: number };

/**
 * What the page area holds at a frame: one scene's content, or two during a
 * page change. Both stay laid out for the whole change, even while one is
 * invisible, so the camera can find its way from one to the other.
 */
function contentsAt(size: Size, frame: number): Content[] {
  let i = 0;
  while (i + 1 < ORDER.length && frame >= ORDER[i + 1].fade[0]) i++;
  const current = ORDER[i];
  const k = i === 0 ? 1 : progress(frame, current.fade);
  let contents: Content[];
  if (k < 1 && current.kind === "page") {
    contents = [
      { scene: sceneAt(size, frame, ORDER[i - 1].name), opacity: dipOut(k) },
      { scene: sceneAt(size, frame, current.name), opacity: dipIn(k) },
    ];
  } else if (k < 1) {
    const tabSwitch = { from: ORDER[i - 1].name as Tab, outgoing: dipOut(k), incoming: dipIn(k) };
    contents = [{ scene: sceneAt(size, frame, current.name, tabSwitch), opacity: 1 }];
  } else {
    contents = [{ scene: sceneAt(size, frame, current.name), opacity: 1 }];
  }
  // The last second: the page dips back to frame 0's screen, its clock
  // running up to the moment the loop restarts, so the last frame leads into 0.
  if (frame >= T.end[0]) {
    const e = progress(frame, T.end);
    contents = [
      ...contents.map((c) => ({ ...c, opacity: c.opacity * dipOut(e, 0.45) })),
      { scene: sceneAt(size, frame - FRAMES, "record"), opacity: dipIn(e, 0.65) },
    ];
  }
  return contents;
}

/** One frame: the pinned banner, then the app (navigation and page content) through the camera, then any dialog. */
const AppFrame: React.FC<{ size: Size; frame: number; contents: Content[] }> = ({ size, frame, contents }) => {
  // The navigation follows whichever page is more in view.
  const nav = contents.reduce((a, b) => (b.opacity > a.opacity ? b : a)).scene.nav;
  const page = (
    <div style={{ position: "relative", flex: 1, minWidth: 0, background: COLORS["zinc-50"] }}>
      {contents.map(({ scene, opacity }, index) => (
        <Clock.Provider key={`${scene.key}-${index}`} value={scene.t}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, opacity }}>{scene.node}</div>
        </Clock.Provider>
      ))}
    </div>
  );
  // No opacity wrapper on the dialog: it would cut the scrim's backdrop blur off from the page.
  const overlay = contents.map(({ scene, opacity }, index) =>
    scene.overlay ? (
      <Clock.Provider key={`overlay-${index}`} value={scene.t}>
        {scene.overlay(opacity)}
      </Clock.Provider>
    ) : null
  );
  return (
    <div className="cs" style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* Pinned to the frame, so every frame carries the demo label. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: bannerHeight(size), overflow: "hidden", zIndex: 40 }}>
        <div style={{ zoom: BANNER[size].scale }}>
          <DemoBanner />
        </div>
      </div>
      <Camera size={size} frame={frame} overlay={overlay}>
        {size === "desktop" ? <Sidebar active={nav} /> : <PhoneHeader active={nav} />}
        {page}
      </Camera>
    </div>
  );
};

export const ClinicalLoop: React.FC<{ size: Size }> = ({ size }) => {
  const frame = useCurrentFrame();
  return (
    <Viewport.Provider value={VIEW[size].width}>
      <Scale.Provider value={closeUp(size)}>
        <AbsoluteFill style={{ background: "#fff" }}>
          <style>{RESET}</style>
          <AppFrame size={size} frame={frame} contents={contentsAt(size, frame)} />
        </AbsoluteFill>
      </Scale.Provider>
    </Viewport.Provider>
  );
};
