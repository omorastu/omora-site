import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import captures from "./captures.json";

/**
 * The Numen Ventures live card: the real site, no device frame, scrolled the
 * way a visitor would — eased pauses on the hero, the "What we do" cards, the
 * partners and the Pitch Score band, a cross-fade into the Pitch Score page
 * and a short scroll down it, then a fade back to the top, which is frame 0,
 * so the loop has no seam.
 *
 * Everything is in the page's own CSS px (from scripts/capture.mjs) and scaled
 * to the frame: a 1440-wide page across 1280px, a 390-wide one across 720px.
 */

export type Size = "desktop" | "phone";
type PageName = "home" | "pitch";
type At = { page: PageName; y: number };
type Beat =
  | { hold: number }
  | { scroll: number; to: number }
  | { fade: number; page: PageName; to: number };

type Capture = (typeof captures.sizes)[Size];
type PageCapture = Capture["pages"][PageName] & {
  anchors: Record<string, number>;
};

export const FPS = 30;
export const FRAMES = 540; // 18s

/** The frame the reduced-motion still is taken from: the middle of the hero's hold. */
export const STILL_FRAME = 27;

export const FRAME_SIZE: Record<Size, { width: number; height: number }> = {
  desktop: { width: 1280, height: 800 },
  phone: { width: 720, height: 900 },
};

const page = (size: Size, name: PageName) => captures.sizes[size].pages[name] as PageCapture;

/** Video px per page CSS px. */
const scaleOf = (size: Size) => FRAME_SIZE[size].width / captures.sizes[size].width;

/** How much of the page the frame shows, in CSS px. */
const viewOf = (size: Size) => FRAME_SIZE[size].height / scaleOf(size);

/** Scroll position that puts a section's top just under the page's sticky header. */
function under(size: Size, name: PageName, anchor: string, nudge = 0) {
  const p = page(size, name);
  const y = p.anchors[anchor] - (p.stickyHeader ? p.header : 0) + nudge;
  return clampY(size, name, y);
}

/** Scroll position that centres a section in the frame below the header. */
function centred(size: Size, name: PageName, anchor: string, bottomAnchorHeight: number) {
  const p = page(size, name);
  const room = viewOf(size) - (p.stickyHeader ? p.header : 0);
  return clampY(size, name, p.anchors[anchor] - (p.stickyHeader ? p.header : 0) - (room - bottomAnchorHeight) / 2);
}

function clampY(size: Size, name: PageName, y: number) {
  return Math.max(0, Math.min(page(size, name).height - viewOf(size), y));
}

/**
 * The script, per size. Phones cover more of the page per screen, so their
 * long scrolls get more time and their pauses a little less; both add up to
 * FRAMES.
 */
function beats(size: Size): Beat[] {
  const pitchBand = { desktop: 319, phone: 378 }[size]; // the orange band's height
  const home = (anchor: string, nudge = 0) => under(size, "home", anchor, nudge);
  const airAboveCards = { desktop: -40, phone: -24 }[size];
  const pitchTo = under(size, "pitch", "howItWorks", -48);
  const pitchScore = centred(size, "home", "pitchScore", pitchBand);
  return size === "desktop"
    ? [
        { hold: 54 },
        { scroll: 42, to: home("whatWeDo", airAboveCards) },
        { hold: 54 },
        { scroll: 48, to: home("partners") },
        { hold: 48 },
        { scroll: 48, to: pitchScore },
        { hold: 54 },
        { fade: 24, page: "pitch", to: 0 },
        { hold: 36 },
        { scroll: 42, to: pitchTo },
        { hold: 42 },
        { fade: 48, page: "home", to: 0 },
      ]
    : [
        { hold: 54 },
        { scroll: 36, to: home("whatWeDo", airAboveCards) },
        { hold: 48 },
        { scroll: 66, to: home("partners") },
        { hold: 45 },
        { scroll: 60, to: pitchScore },
        { hold: 51 },
        { fade: 24, page: "pitch", to: 0 },
        { hold: 33 },
        { scroll: 36, to: pitchTo },
        { hold: 42 },
        { fade: 45, page: "home", to: 0 },
      ];
}

const ease = Easing.bezier(0.65, 0, 0.35, 1);

/** Where the loop is at a frame: one page, or two during a cross-fade. */
function stateAt(size: Size, frame: number): { base: At; over?: At; mix: number } {
  let at: At = { page: "home", y: 0 };
  let t = 0;
  for (const b of beats(size)) {
    const len = "hold" in b ? b.hold : "scroll" in b ? b.scroll : b.fade;
    if (frame < t + len) {
      const k = ease(interpolate(frame, [t, t + len], [0, 1]));
      if ("scroll" in b) return { base: { page: at.page, y: at.y + (b.to - at.y) * k }, mix: 0 };
      if ("fade" in b) return { base: at, over: { page: b.page, y: b.to }, mix: k };
      return { base: at, mix: 0 };
    }
    t += len;
    if ("scroll" in b) at = { page: at.page, y: b.to };
    if ("fade" in b) at = { page: b.page, y: b.to };
  }
  return { base: at, mix: 0 };
}

export const NumenLoop: React.FC<{ size: Size }> = ({ size }) => {
  const frame = useCurrentFrame();
  const { base, over, mix } = stateAt(size, frame);
  return (
    <AbsoluteFill style={{ background: "#16120E" }}>
      <PageView size={size} at={base} />
      {over && mix > 0 && (
        <AbsoluteFill style={{ opacity: mix }}>
          <PageView size={size} at={over} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/** One page, scrolled to `at.y`, drawn from whichever of its tiles are in view. */
const PageView: React.FC<{ size: Size; at: At }> = ({ size, at }) => {
  const p = page(size, at.page);
  const s = scaleOf(size);
  const { width } = FRAME_SIZE[size];
  const view = viewOf(size);
  // Whole video pixels, so text is as sharp in motion as at rest.
  const shift = Math.round(at.y * s);
  const tiles = p.tiles.filter((t) => t.y + t.h > at.y - 2 && t.y < at.y + view + 2);
  const first = p.tiles[0];

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {tiles.map((t) => (
        <Img
          key={t.file}
          src={staticFile(`captures/${t.file}`)}
          style={{ position: "absolute", left: 0, top: t.y * s - shift, width, height: t.h * s }}
        />
      ))}
      {/* A sticky header stays at the top while the page moves under it. */}
      {p.stickyHeader && at.y > 0 && (
        <div style={{ position: "absolute", left: 0, top: 0, width, height: p.header * s, overflow: "hidden" }}>
          <Img
            src={staticFile(`captures/${first.file}`)}
            style={{ position: "absolute", left: 0, top: 0, width, height: first.h * s }}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
