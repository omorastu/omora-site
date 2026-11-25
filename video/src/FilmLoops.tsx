import { AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import captures from "./film-captures.json";

/**
 * Four of the film's loops (/film), from scripts/film-capture.mjs's captures:
 *
 * PearlsSite: Pearls Farm Labor's site as one flow, for the website scene.
 * The hero, then one smooth scroll down the homepage through every section
 * to its last, "Let's talk about your block", then into the Request a crew
 * page, where it rests. Played once (the scene is shorter than a loop), so
 * it has no seam to hide.
 *
 * PearlsCrew: the same site from its crew side, for a contractor's
 * walkthrough: it starts on the crews (the services: harvest crews, orchard
 * crews, labor crews), scrolls on past the founder's crew and the crews at
 * work, to "Let's talk about your block" and its Request a crew, then into
 * the Request a crew page, where it rests. It never shows the vineyard year.
 *
 * PracticeSite: Brightline Orthodontics, the made-up practice's concept site
 * (/demos/practice), for a practice's walkthrough: its top, then one smooth
 * scroll down the whole site, resting on its Book a consult form.
 *
 * PhotoReel: the capture, then the results, for the Photo & video demo.
 * Jordan's drone footage of a Pearls crew in the rows (from the hero video
 * on pearlsfarminc.com, as scripts/pearls-drone.mjs cuts it), dissolving
 * into Pearls' Instagram profile, scrolled from its header down its grid of
 * posts.
 *
 * Pages are drawn as NumenLoop draws Numen's: from their tiles, in the
 * page's CSS px at the capture's own resolution, on whole frame pixels.
 */

export type Size = "desktop" | "phone";
type PageName = "pearls" | "pearlsRequest" | "instagram" | "practice";
type At = { page: PageName; y: number };

export const FPS = 30;
export const SITE_FRAMES = 270; // 9 s
export const REEL_FRAMES = 330; // 11 s
export const CREW_FRAMES = 270; // 9 s
export const PRACTICE_FRAMES = 270; // 9 s

export const FRAME_SIZE: Record<Size, { width: number; height: number }> = {
  desktop: { width: 2160, height: 1350 },
  phone: { width: 1170, height: 1462 },
};

type PageCapture = {
  height: number;
  header: number;
  stickyHeader: boolean;
  /** Where a sticky header sits before it sticks, when that isn't the very top (a notice bar above it). */
  headerTop?: number;
  anchors: Record<string, number>;
  tiles: { file: string; y: number; h: number }[];
};
const page = (size: Size, name: PageName) => (captures.sizes as Record<Size, { width: number; pages: Record<string, PageCapture> }>)[size].pages[name];
/**
 * The part of a page's width the frame shows, in CSS px: all of it, except
 * Instagram's on a wide screen, framed to its column of posts (1065 px of
 * 1440, centred) so the posts aren't lost in white.
 */
const cropOf = (size: Size, name: PageName): [number, number] =>
  name === "instagram" && size === "desktop" ? [167, 1272] : [0, captures.sizes[size].width];
const scaleOf = (size: Size, name: PageName) => {
  const [x0, x1] = cropOf(size, name);
  return FRAME_SIZE[size].width / (x1 - x0);
};
const viewOf = (size: Size, name: PageName) => FRAME_SIZE[size].height / scaleOf(size, name);
const clampY = (size: Size, name: PageName, y: number) => Math.max(0, Math.min(page(size, name).height - viewOf(size, name), y));

const ease = Easing.bezier(0.65, 0, 0.35, 1);
/** A long scroll: eased in and out, but even through the middle, so no stretch of the page rushes past. */
const cruise = Easing.bezier(0.42, 0, 0.58, 1);

/** One page, scrolled to `at.y`, drawn from whichever of its tiles are in view. */
const PageView: React.FC<{ size: Size; at: At }> = ({ size, at }) => {
  const p = page(size, at.page);
  const s = scaleOf(size, at.page);
  const [x0] = cropOf(size, at.page);
  const width = captures.sizes[size].width * s;
  const left = Math.round(-x0 * s);
  const view = viewOf(size, at.page);
  const shift = Math.round(at.y * s);
  const tiles = p.tiles.filter((t) => t.y + t.h > at.y - 2 && t.y < at.y + view + 2);
  const first = p.tiles[0];
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#fff" }}>
      {tiles.map((t) => (
        <Img key={t.file} src={staticFile(`film-captures/${t.file}`)} style={{ position: "absolute", left, top: t.y * s - shift, width, height: t.h * s }} />
      ))}
      {/* A sticky header stays at the top while the page moves under it. */}
      {p.stickyHeader && at.y > (p.headerTop ?? 0) && (
        <div style={{ position: "absolute", left: 0, top: 0, width, height: Math.round(p.header * s), overflow: "hidden" }}>
          <Img src={staticFile(`film-captures/${first.file}`)} style={{ position: "absolute", left: 0, top: p.headerTop ? -Math.round(p.headerTop * s) : 0, width, height: first.h * s }} />
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ── Pearls' site, as one flow ─────────────────────────────────────────── */

/**
 * The site's beats, in frames: the hero; the scroll to the last section; a
 * moment; into Request a crew; resting there. The page is in by 7.2 s, a
 * little before the website scene starts to give way (scenes.tsx).
 */
const SITE = { hold: 18, scroll: 174, rest: 9, fade: 15 };

export const PearlsSite: React.FC<{ size: Size }> = ({ size }) => {
  const frame = useCurrentFrame();
  const home = page(size, "pearls");
  // The last section's top just under the sticky header.
  const last = clampY(size, "pearls", home.anchors.close - (home.stickyHeader ? home.header : 0));
  const s0 = SITE.hold;
  const s1 = s0 + SITE.scroll;
  const f0 = s1 + SITE.rest;
  const f1 = f0 + SITE.fade;
  const y = frame < s0 ? 0 : frame < s1 ? last * cruise(interpolate(frame, [s0, s1], [0, 1])) : last;
  const mix = ease(interpolate(frame, [f0, f1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <PageView size={size} at={{ page: "pearls", y }} />
      {mix > 0 && (
        <AbsoluteFill style={{ opacity: mix }}>
          <PageView size={size} at={{ page: "pearlsRequest", y: 0 }} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ── Pearls' site from its crew side, for a contractor ──────────────────── */

/**
 * Where the crew side starts, in CSS px down the homepage: the top of
 * "Vineyard and orchard services." (the crews), read off the captures' tiles
 * (the homepage's capture has no anchor of its own there).
 */
const CREW_FROM: Record<Size, number> = { desktop: 5874, phone: 4433 };
/** Its beats, in frames: the crews; the scroll to the last section; a moment; into Request a crew. In by 7.2 s, as PearlsSite is. */
const CREW = { hold: 24, scroll: 168, rest: 9, fade: 15 };

export const PearlsCrew: React.FC<{ size: Size }> = ({ size }) => {
  const frame = useCurrentFrame();
  const home = page(size, "pearls");
  const stuck = home.stickyHeader ? home.header : 0;
  const from = clampY(size, "pearls", CREW_FROM[size] - stuck);
  const last = clampY(size, "pearls", home.anchors.close - stuck);
  const s0 = CREW.hold;
  const s1 = s0 + CREW.scroll;
  const f0 = s1 + CREW.rest;
  const f1 = f0 + CREW.fade;
  const y = frame < s0 ? from : frame < s1 ? from + (last - from) * cruise(interpolate(frame, [s0, s1], [0, 1])) : last;
  const mix = ease(interpolate(frame, [f0, f1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <PageView size={size} at={{ page: "pearls", y }} />
      {mix > 0 && (
        <AbsoluteFill style={{ opacity: mix }}>
          <PageView size={size} at={{ page: "pearlsRequest", y: 0 }} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ── The practice concept site ─────────────────────────────────────────── */

/** Its beats, in frames: the top; the one scroll down to the form, in and resting by 7.5 s; then resting there. */
const PRACTICE = { hold: 18, scroll: 207 };

/**
 * Where it rests. On a wide screen: the Book a consult section just under
 * the header, the whole form in view. On a phone (too short for all of it):
 * the section's heading just under the header, the form's first fields
 * below it.
 */
const practiceEnd = (size: Size) => {
  const p = page(size, "practice");
  const stuck = p.stickyHeader ? p.header : 0;
  // (The section's padding above its heading, on a phone: practice.css, .bl-section.)
  const y = size === "desktop" ? p.anchors.book - stuck + 24 : p.anchors.book + 72 - stuck - 16;
  return clampY(size, "practice", y);
};

export const PracticeSite: React.FC<{ size: Size }> = ({ size }) => {
  const frame = useCurrentFrame();
  const end = practiceEnd(size);
  const s0 = PRACTICE.hold;
  const s1 = s0 + PRACTICE.scroll;
  const y = frame < s0 ? 0 : frame < s1 ? end * cruise(interpolate(frame, [s0, s1], [0, 1])) : end;
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <PageView size={size} at={{ page: "practice", y }} />
    </AbsoluteFill>
  );
};

/* ── The capture, then the results ─────────────────────────────────────── */

/** The reel's beats, in frames: the drone footage; the dissolve; the profile's header; the scroll down the grid. */
const REEL = { drone: 108, dissolve: 18, hold: 24, scroll: 150 };
/** Where the crew's stretch starts in the drone footage, in seconds (scripts/pearls-drone.mjs). */
const DRONE_FROM = 5.4;
/** Each size's crop of the 2560 × 1440 footage, as object-position (pearls-drone.mjs's crops: 16:10 from x 128, 4:5 from x 960). */
const DRONE_CROP: Record<Size, string> = { desktop: "50% 50%", phone: `${((960 / (2560 - 1152)) * 100).toFixed(2)}% 50%` };

export const PhotoReel: React.FC<{ size: Size }> = ({ size }) => {
  const frame = useCurrentFrame();
  const ig = page(size, "instagram");
  // Down the grid: on a phone to its last row; on a wide screen, framed closer,
  // five rows down (at an easy pace, which keeps the file in its budget too).
  const last = ig.anchors.gridEnd + 12 - viewOf(size, "instagram");
  const end = clampY(size, "instagram", size === "desktop" ? Math.min(last, ig.anchors.grid + 1750) : last);
  const d1 = REEL.drone;
  const i0 = d1 + REEL.dissolve + REEL.hold;
  const i1 = i0 + REEL.scroll;
  const mix = ease(interpolate(frame, [d1, d1 + REEL.dissolve], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const y = frame < i0 ? 0 : frame < i1 ? end * cruise(interpolate(frame, [i0, i1], [0, 1])) : end;
  return (
    <AbsoluteFill style={{ background: "#0C0A08" }}>
      {mix < 1 && (
        <OffthreadVideo
          src={staticFile("film-captures/drone-src.mp4")}
          startFrom={Math.round(DRONE_FROM * FPS)}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: DRONE_CROP[size] }}
        />
      )}
      {mix > 0 && (
        <AbsoluteFill style={{ opacity: mix }}>
          <PageView size={size} at={{ page: "instagram", y }} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
