import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import type { ReactNode } from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { DENTIST_LETTER, DRAFT, FAMILY_LETTER, RECORD, type NavKey } from "./clinical/data";
import { DraftDialog, FollowUpsScreen, ProcessingScreen, RecordScreen, SummaryScreen, type Tab } from "./clinical/screens";
import { Viewport } from "./clinical/tw";
import { Clock, DemoBanner, PhoneHeader, RESET, Scale, Sidebar } from "./clinical/ui";

/**
 * The Clinical Scribe live card: one invented consult going through the
 * app — recording, the summary appearing, the referring dentist's letter
 * and the family's take-home letter drafting, then the follow-up list and
 * the message it suggests — and a fade back into frame 0, so the loop has
 * no seam.
 *
 * Not a recording. The real app talks to a live backend with real patient
 * data, so this is a replica built from its source (layout, Tailwind
 * classes, labels, states; see src/clinical/) and filled with invented
 * data from src/clinical/data.ts, the only place on-screen text comes from.
 *
 * Laid out in the app's own CSS px (1440 or 390 wide) and drawn at 1.5x and
 * 3x, as NumenLoop's captures are; scripts/render.mjs scales the finished
 * frames down to each file's size.
 */

loadGeist("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });
loadGeistMono("normal", { weights: ["400", "500"], subsets: ["latin"] });

export type Size = "desktop" | "phone";

export const FPS = 30;
export const FRAMES = 540; // 18s

export const FRAME_SIZE: Record<Size, { width: number; height: number }> = {
  desktop: { width: 2160, height: 1350 },
  phone: { width: 1170, height: 1462 },
};

/** The app's viewport in CSS px, and frame px per CSS px. */
const VIEW: Record<Size, { width: number; scale: number }> = {
  desktop: { width: 1440, scale: 1.5 },
  phone: { width: 390, scale: 3 },
};

/**
 * The beats, in frames. Both sizes share them; only the phone scrolls
 * (its 487px-tall view shows a slice of each page), see PHONE_SCROLL.
 */
const T = {
  flag: 24, // "Flag a moment" pressed; the marker lands 4 frames later
  stop: 52, // Stop pressed
  processing: [54, 66], // into the processing steps
  stepAt: (k: number) => 68 + k * 5, // step k is done (k = 0..5)
  summary: [100, 114], // into the summary
  revealAt: (i: number) => 114 + i * 6, // part i of the summary starts appearing
  reveal: 10, // frames each part takes
  dentist: [226, 234], // tab switch to the referring dentist letter
  dentistStream: [236, 288],
  family: [306, 314], // tab switch to the family letter
  familyStream: [316, 364],
  followUps: [374, 390], // into follow-ups
  scroll: [400, 426], // down to the recommendation (desktop) or the new row (phone)
  press: 442, // "Draft this message" pressed
  dialog: [446, 454],
  draftStream: [456, 480],
  end: [495, FRAMES - 1], // back into frame 0
  // Desktop camera: zoomed on the record and processing screens, easing
  // out as the summary comes in and back in during the dip to frame 0.
  zoomOut: [98, 124],
  zoomIn: [506, 536],
};

/**
 * Frames the reduced-motion still and the case-study extras are taken
 * from, each with both sizes at rest and nothing half-drawn.
 */
export const STILL_FRAME = 214; // the summary complete, the letters' tabs beside it
export const EXTRA_FRAMES = { summary: 214, doctorLetter: 298, followUps: 436 };

const ease = Easing.bezier(0.65, 0, 0.35, 1);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const progress = (frame: number, [a, b]: number[]) => clamp01((frame - a) / (b - a));

/** Eased keyframes: [frame, value] pairs, held before the first and after the last. */
function track(frame: number, keys: [number, number][]): number {
  if (frame <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f0, v0] = keys[i - 1];
    const [f1, v1] = keys[i];
    if (frame <= f1) return v0 + (v1 - v0) * ease(clamp01((frame - f0) / (f1 - f0)));
  }
  return keys[keys.length - 1][1];
}

/** Characters of a draft that have arrived by a frame. */
const chars = (frame: number, window: number[], text: string) => Math.round(progress(frame, window) * text.length);

/**
 * Where the phone's page sits (its scrollTop, CSS px) in each scene. The
 * desktop view shows each page whole, so only follow-ups moves there.
 */
const PHONE_SCROLL = {
  record: 0,
  // Follow the summary down as it appears, then come back up to the tabs
  // (the letters beside the summary), which is where the still is taken.
  summary: (f: number) =>
    track(f, [
      [T.revealAt(1), 0],
      [T.revealAt(8) + 10, 560],
      [T.revealAt(8) + 16, 560],
      [T.revealAt(8) + 38, 96],
    ]),
  // Tabs in view for the switch, then follow the draft down as it grows;
  // the first letter goes back up to the tabs for the next switch.
  letter: (f: number, stream: number[], end: number, back: boolean) =>
    track(f, [
      [stream[0] + 10, 96],
      [stream[1] + 4, end],
      ...(back
        ? ([
            [stream[1] + 8, end],
            [stream[1] + 18, 96],
          ] as [number, number][])
        : []),
    ]),
  // The list's top, then down to the consult that just joined it.
  followUps: (f: number) => track(f, [[T.scroll[0], 0], [T.scroll[1], 962]]),
};

/** How far down the desktop's follow-ups page goes, to bring the recommendation into view. */
const DESKTOP_FOLLOW_UPS_SCROLL = 390;

/**
 * The desktop camera on the record and processing screens.
 *
 * At 1440x900 those pages fill only the top third of the frame, which left
 * the poster (frame 0) mostly empty grey. So the area under the banner is
 * scaled by 1.5 around the content column: the column (cards at x 400-1248,
 * centre 824) lands centred in the frame, the sidebar falls off the left,
 * and the block sits a little above the middle of the space under the
 * banner. The banner itself is never scaled.
 */
const ZOOM = { z: 1.5, centreX: 824, offsetY: 112 };

/** How zoomed the desktop camera is, 0 (1:1) → 1 (ZOOM). */
function zoomAt(frame: number): number {
  if (frame < T.zoomOut[1]) return 1 - ease(progress(frame, T.zoomOut));
  if (frame < T.zoomIn[0]) return 0;
  return ease(progress(frame, T.zoomIn));
}

type Camera = { z: number; x: number; y: number };

/**
 * The transform for a zoom amount. Horizontally it is a plain zoom about one
 * point, so nothing drifts. It only moves the page down (to centre it) once
 * the zoom has pushed the sidebar out of frame, so the space that opens
 * above the page is only ever the page's own grey. Offsets are snapped to
 * whole master pixels, as the scrolling is.
 */
function cameraAt(e: number, scale: number): Camera {
  if (e <= 0) return { z: 1, x: 0, y: 0 };
  const z = 1 + (ZOOM.z - 1) * e;
  const x = (VIEW.desktop.width / 2 - ZOOM.z * ZOOM.centreX) * e;
  const late = clamp01((e - 0.55) / 0.45);
  const y = ZOOM.offsetY * late * late * (3 - 2 * late);
  const snap = (v: number) => Math.round(v * scale) / scale;
  return { z, x: snap(x), y: snap(y) };
}

type Scene = {
  key: string;
  nav: NavKey | null;
  node: ReactNode;
  scroll: number;
  /** A dialog over the frame, drawn at a visibility (its own fade times the page's). */
  overlay?: (visible: number) => ReactNode;
  t: number;
};

/** A tab switch in progress: the card being left, and how far the new one has faded in. */
type TabSwitch = { from: Tab; outgoing: number; incoming: number };

/** The scene at a frame. `t` is the loop clock in seconds. */
function sceneAt(size: Size, frame: number, name: string, tabSwitch?: TabSwitch): Scene {
  const t = frame / FPS;
  const phone = size === "phone";
  switch (name) {
    case "record": {
      const markers = [RECORD.firstMarker, ...(frame >= T.flag + 4 ? [RECORD.startSeconds + Math.floor((T.flag + 4) / FPS)] : [])];
      return {
        key: "record",
        nav: "record",
        t,
        scroll: PHONE_SCROLL.record,
        node: (
          <RecordScreen
            seconds={RECORD.startSeconds + Math.floor(frame / FPS)}
            markers={markers}
            flagPressed={frame >= T.flag && frame < T.flag + 4}
            stopPressed={frame >= T.stop && frame < T.stop + 4}
          />
        ),
      };
    }
    case "processing": {
      let done = 0;
      while (done < RECORD.steps.length && frame >= T.stepAt(done)) done++;
      return { key: "processing", nav: "record", t, scroll: 0, node: <ProcessingScreen stepsDone={done} /> };
    }
    case "summary":
    case "dentist":
    case "family": {
      const tab = name as Tab;
      const shown = (i: number) => (frame - T.revealAt(i)) / T.reveal;
      const stream = tab === "dentist" ? T.dentistStream : T.familyStream;
      const body = tab === "dentist" ? DENTIST_LETTER.body : FAMILY_LETTER.body;
      const letterChars = tab === "summary" ? 0 : chars(frame, stream, body);
      return {
        key: "summaryPage",
        nav: null,
        t,
        scroll: !phone
          ? 0
          : tab === "summary"
            ? PHONE_SCROLL.summary(frame)
            : PHONE_SCROLL.letter(frame, stream, tab === "dentist" ? 470 : 520, tab === "dentist"),
        node: (
          <SummaryScreen
            tab={tab}
            shown={shown}
            letterChars={letterChars}
            drafting={tab !== "summary" && letterChars < body.length}
            opacity={tabSwitch?.incoming ?? 1}
            from={tabSwitch && { tab: tabSwitch.from, opacity: tabSwitch.outgoing }}
          />
        ),
      };
    }
    case "followUps": {
      const scroll = phone
        ? PHONE_SCROLL.followUps(frame)
        : track(frame, [[T.scroll[0], 0], [T.scroll[1], DESKTOP_FOLLOW_UPS_SCROLL]]);
      const open = progress(frame, T.dialog);
      return {
        key: "followUps",
        nav: "followups",
        t,
        scroll,
        node: <FollowUpsScreen draftPressed={!phone && frame >= T.press && frame < T.press + 4} />,
        overlay:
          open > 0 ? (visible) => <DraftDialog chars={chars(frame, T.draftStream, DRAFT.body)} visible={ease(open) * visible} /> : undefined,
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
  { name: "processing", fade: T.processing, kind: "page" },
  { name: "summary", fade: T.summary, kind: "page" },
  { name: "dentist", fade: T.dentist, kind: "tab" },
  { name: "family", fade: T.family, kind: "tab" },
  { name: "followUps", fade: T.followUps, kind: "page" },
];

/** A dip: the old content is gone by `split` of the way, the new one starts at 1 - `split`. */
const dipOut = (k: number, split = 0.6) => 1 - ease(clamp01(k / split));
const dipIn = (k: number, split = 0.6) => ease(clamp01((k - (1 - split)) / split));

type Content = { scene: Scene; opacity: number };

/** What the page area shows at a frame: one scene's content, or two during a dip. */
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
  // The last 1.5s: the page dips back to frame 0's screen, its clock
  // running up to the moment the loop restarts, so frame 539 leads into 0.
  if (frame >= T.end[0]) {
    const e = progress(frame, T.end);
    contents = [
      ...contents.map((c) => ({ ...c, opacity: c.opacity * dipOut(e, 0.45) })),
      { scene: sceneAt(size, frame - FRAMES, "record"), opacity: dipIn(e, 0.65) },
    ];
  }
  return contents.filter((c) => c.opacity > 0);
}

/** One frame of the app: banner, navigation, the page content(s) under it, any dialog. */
const AppFrame: React.FC<{ size: Size; contents: Content[]; camera: Camera }> = ({ size, contents, camera }) => {
  const { width, scale } = VIEW[size];
  const height = FRAME_SIZE[size].height / scale;
  // The navigation follows whichever page is more in view.
  const nav = contents.reduce((a, b) => (b.opacity > a.opacity ? b : a)).scene.nav;
  const page = (
    <div style={{ position: "relative", flex: 1, minWidth: 0, overflow: "hidden", background: "oklch(98.5% 0 none)" }}>
      {contents.map(({ scene, opacity }, index) => (
        <Clock.Provider key={`${scene.key}-${index}`} value={scene.t}>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              opacity,
              // Whole frame pixels, so text is sharp in motion as at rest.
              transform: `translateY(${-Math.round(scene.scroll * scale) / scale}px)`,
            }}
          >
            {scene.node}
          </div>
        </Clock.Provider>
      ))}
    </div>
  );
  return (
    <div
      className="cs"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        height,
        transform: `scale(${scale})`,
        transformOrigin: "0 0",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Pinned, and above any dialog's scrim, so every frame carries the demo label. */}
      <div style={{ position: "relative", zIndex: 40 }}>
        <DemoBanner />
      </div>
      {size === "desktop" ? (
        // The camera moves everything under the banner; where it uncovers
        // the space above the page, that space is the page's own grey.
        <div style={{ position: "relative", flex: 1, minHeight: 0, overflow: "hidden", background: "oklch(98.5% 0 none)" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              transformOrigin: "0 0",
              transform: camera.z === 1 ? undefined : `translate(${camera.x}px, ${camera.y}px) scale(${camera.z})`,
            }}
          >
            <Sidebar active={nav} />
            {page}
          </div>
        </div>
      ) : (
        <>
          <PhoneHeader active={nav} />
          {page}
        </>
      )}
      {/* No opacity wrapper here: it would cut the scrim's backdrop blur off from the page. */}
      {contents.map(({ scene, opacity }, index) =>
        scene.overlay ? (
          <Clock.Provider key={`overlay-${index}`} value={scene.t}>
            {scene.overlay(opacity)}
          </Clock.Provider>
        ) : null
      )}
    </div>
  );
};

export const ClinicalLoop: React.FC<{ size: Size }> = ({ size }) => {
  const frame = useCurrentFrame();
  const { width, scale } = VIEW[size];
  return (
    <Viewport.Provider value={width}>
      <Scale.Provider value={scale}>
        <AbsoluteFill style={{ background: "#fff" }}>
          <style>{RESET}</style>
          <AppFrame
            size={size}
            contents={contentsAt(size, frame)}
            camera={size === "desktop" ? cameraAt(zoomAt(frame), scale) : { z: 1, x: 0, y: 0 }}
          />
        </AbsoluteFill>
      </Scale.Provider>
    </Viewport.Provider>
  );
};
