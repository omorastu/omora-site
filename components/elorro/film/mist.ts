/**
 * Gold mist (the way in, way.tsx): words breaking up into fine gold dust that
 * drifts up and fades. The words are wiped away left to right (a mask on
 * them, `--wipe`, film.css "the way in"), and as the wipe reaches each part
 * of a letter, the dust it's made of lifts off from there. And the same in
 * reverse (`dust`): gold dust drifting in and settling into words, which
 * show through behind it, left to right, as it lands and fades.
 *
 * The dust is sampled from the words themselves: each character drawn
 * where the page set it (its own box, from a Range, so kerning and tracking
 * hold), in its own font, onto a canvas the words' size, and every few
 * pixels of ink is a mote. Kept light for a phone: a few thousand motes at
 * most, squares on one canvas, drawn in a handful of passes by brightness;
 * no blur, no glow. Restrained: slow, smooth, no sparkle.
 */

type Mote = { x: number; y: number; t0: number; life: number; vx: number; vy: number; ay: number; sway: number; freq: number; phase: number; size: number; tone: number };

/** The wipe's length, in seconds, and the longest a mote takes to rise and fade after it lifts. */
export const SWEEP = 1.15;
const LONGEST = 2.5;
/** The most motes, on a phone and on a bigger screen. */
const MAX_SMALL = 3200;
const MAX_LARGE = 6000;
/** The softness of the wipe's edge, either side of it, in CSS px. */
const SOFT = 28;
const TONES = ["#E8CE95", "#D9B66A", "#BE9645"];

/** Every character in `el`, drawn onto `ctx` (whose origin is `box`'s top left) where the page set it. */
function drawText(el: HTMLElement, ctx: CanvasRenderingContext2D, box: DOMRect) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    const parent = node.parentElement;
    if (!parent) continue;
    const cs = getComputedStyle(parent);
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const m = ctx.measureText("Hg");
    const descent = m.fontBoundingBoxDescent ?? m.actualBoundingBoxDescent;
    const text = node.data;
    for (let i = 0; i < text.length; i++) {
      if (!text[i].trim()) continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const r = range.getBoundingClientRect();
      if (!r.width) continue;
      ctx.fillText(text[i], r.left - box.left, r.bottom - descent - box.top);
    }
  }
}

/** A seeded random, so the mist is the same each time. */
function seeded(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

/**
 * Where the motes are: every few pixels of the words' ink (`ink`'s text,
 * drawn in `el`'s box), at most a few thousand; null if there's nothing to draw on.
 */
function sample(el: HTMLElement, ink: HTMLElement, rand: () => number) {
  const box = el.getBoundingClientRect();
  const W = Math.ceil(box.width);
  const H = Math.ceil(box.height);
  // The words' ink, at one sample a CSS pixel.
  const sheet = document.createElement("canvas");
  sheet.width = W;
  sheet.height = H;
  const ictx = sheet.getContext("2d", { willReadFrequently: true });
  if (!ictx || !W || !H) return { box, W, H, points: null };
  ictx.fillStyle = "#000";
  ictx.textBaseline = "alphabetic";
  drawText(ink, ictx, box);
  const data = ictx.getImageData(0, 0, W, H).data;
  let count = 0;
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (data[(y * W + x) * 4 + 3] > 120) count++;
  const max = innerWidth < 700 ? MAX_SMALL : MAX_LARGE;
  const step = Math.max(2, Math.ceil(2 * Math.sqrt(count / max)));
  const points: [number, number][] = [];
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      const jx = x + Math.floor(rand() * step);
      const jy = y + Math.floor(rand() * step);
      if (jx >= W || jy >= H || data[(jy * W + jx) * 4 + 3] <= 120) continue;
      points.push([jx, jy]);
    }
  }
  return { box, W, H, points };
}

/** The canvas over the whole screen, at the screen's resolution (to 2×). */
function fit(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(innerWidth * dpr);
  canvas.height = Math.round(innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/**
 * Turns `el`'s words to mist, over `canvas` (fixed, over the whole screen).
 * The dust is drawn from `ink`'s text (`el`'s own by default: give another
 * where the words are set twice over, one on the other). Resolves once the
 * last mote has gone; `stop()` ends it at once.
 */
export function mist(el: HTMLElement, canvas: HTMLCanvasElement, ink: HTMLElement = el) {
  let raf = 0;
  let stopped = false;
  const done = new Promise<void>((resolve) => {
    const rand = seeded(7);
    const { box, W, points } = sample(el, ink, rand);
    const ctx = canvas.getContext("2d");
    if (!points || !ctx) {
      el.style.setProperty("--wipe", `${W + 2 * SOFT}px`);
      resolve();
      return;
    }
    const motes: Mote[] = [];
    for (const [jx, jy] of points) {
      motes.push({
        x: box.left + jx,
        y: box.top + jy,
        // It lifts as the wipe reaches it.
        t0: (SWEEP * (jx + SOFT)) / (W + 2 * SOFT) + rand() * 0.1,
        life: 1.3 + rand() * (LONGEST - 1.3),
        vx: (rand() - 0.5) * 18,
        vy: -(24 + rand() * 46),
        ay: -(8 + rand() * 22),
        sway: 2 + rand() * 6,
        freq: 0.5 + rand() * 0.9,
        phase: rand() * Math.PI * 2,
        size: 0.9 + rand() * 1.1,
        tone: Math.floor(rand() * TONES.length),
      });
    }
    fit(canvas, ctx);
    const start = performance.now();
    // The motes in passes of a like brightness and tone: few state changes a frame.
    const LEVELS = 6;
    const passes: number[][] = Array.from({ length: LEVELS * TONES.length }, () => []);
    const frame = (now: number) => {
      if (stopped) return;
      const t = (now - start) / 1000;
      el.style.setProperty("--wipe", `${(t / SWEEP) * (W + 2 * SOFT) - SOFT}px`);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const p of passes) p.length = 0;
      let alive = false;
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        const age = t - m.t0;
        if (age < 0) {
          alive = true;
          continue;
        }
        const k = age / m.life;
        if (k >= 1) continue;
        alive = true;
        const a = k < 0.08 ? 1 : Math.pow(1 - (k - 0.08) / 0.92, 1.5);
        passes[m.tone * LEVELS + Math.min(LEVELS - 1, Math.floor(a * LEVELS))].push(i);
      }
      for (let tone = 0; tone < TONES.length; tone++) {
        ctx.fillStyle = TONES[tone];
        for (let level = 0; level < LEVELS; level++) {
          const list = passes[tone * LEVELS + level];
          if (!list.length) continue;
          ctx.globalAlpha = ((level + 0.5) / LEVELS) * 0.9;
          for (const i of list) {
            const m = motes[i];
            const age = t - m.t0;
            const x = m.x + m.vx * age + Math.sin(m.phase + age * m.freq * Math.PI * 2) * m.sway * Math.min(1, age);
            const y = m.y + m.vy * age + 0.5 * m.ay * age * age;
            ctx.fillRect(x, y, m.size, m.size);
          }
        }
      }
      ctx.globalAlpha = 1;
      if (alive || t < SWEEP) raf = requestAnimationFrame(frame);
      else {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        resolve();
      }
    };
    raf = requestAnimationFrame(frame);
  });
  return {
    done,
    stop() {
      stopped = true;
      cancelAnimationFrame(raf);
    },
  };
}

/* ── The same, in reverse ──────────────────────────────────────────────── */

type Speck = { x: number; y: number; land: number; flight: number; vx: number; vy: number; ay: number; sway: number; freq: number; phase: number; size: number; tone: number };

/** When the first dust lands, and how long its landing takes to cross the words, in seconds. */
export const SETTLE_FROM = 1.15;
export const SETTLE = 1.35;
/** How long a mote shines on in its place once it's landed, fading as the letter shows through. */
const AFTERGLOW = 0.55;

/**
 * Gold dust forming `el`'s words, over `canvas` (fixed, over the whole
 * screen): the mist in reverse. Each mote comes in from where the mist
 * would have taken it, up and away, faint at first, drifting down and in,
 * and settles on its pixel of a letter, slowing as it lands; the dust lands
 * across the words left to right, and behind it the words show through
 * (`--wipe`, a mask, film.css), as each mote fades into its letter.
 * Resolves once the words are whole; `stop()` ends it at once.
 */
export function dust(el: HTMLElement, canvas: HTMLCanvasElement) {
  let raf = 0;
  let stopped = false;
  const whole = () => el.style.setProperty("--wipe", "100000px");
  const done = new Promise<void>((resolve) => {
    const rand = seeded(11);
    const { box, W, points } = sample(el, el, rand);
    const ctx = canvas.getContext("2d");
    if (!points || !ctx) {
      whole();
      resolve();
      return;
    }
    const specks: Speck[] = points.map(([jx, jy]) => {
      const flight = 0.75 + rand() * 0.4;
      return {
        x: box.left + jx,
        y: box.top + jy,
        // It lands as the landing reaches its part of the words: never before it's had its flight.
        land: Math.max(flight, SETTLE_FROM + (SETTLE * (jx + SOFT)) / (W + 2 * SOFT) + rand() * 0.12),
        flight,
        vx: (rand() - 0.5) * 70,
        vy: -(26 + rand() * 50),
        ay: -(10 + rand() * 26),
        sway: 2 + rand() * 6,
        freq: 0.5 + rand() * 0.9,
        phase: rand() * Math.PI * 2,
        size: 0.9 + rand() * 1.1,
        tone: Math.floor(rand() * TONES.length),
      };
    });
    const last = specks.reduce((t, s) => Math.max(t, s.land), 0) + AFTERGLOW;
    fit(canvas, ctx);
    const start = performance.now();
    const LEVELS = 6;
    const passes: number[][] = Array.from({ length: LEVELS * TONES.length }, () => []);
    /** Where a mote is, `a` seconds before it lands (eased, so it slows as it settles). */
    const at = (s: Speck, a: number) => {
      const u = Math.min(1, a / s.flight);
      const e = s.flight * u * u * (1.6 - 0.6 * u);
      return [s.x + s.vx * e + Math.sin(s.phase + e * s.freq * Math.PI * 2) * s.sway * Math.min(1, e), s.y + s.vy * e + 0.5 * s.ay * e * e];
    };
    const frame = (now: number) => {
      if (stopped) return;
      const t = (now - start) / 1000;
      // The words show through just behind the landing.
      el.style.setProperty("--wipe", `${((t - SETTLE_FROM - 0.12) / SETTLE) * (W + 2 * SOFT) - SOFT}px`);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const p of passes) p.length = 0;
      for (let i = 0; i < specks.length; i++) {
        const s = specks[i];
        const a = s.land - t;
        if (a > s.flight || a < -AFTERGLOW) continue;
        // Brightening as it comes in; fading into its letter once it's landed.
        const k = a > 0 ? Math.pow(1 - a / s.flight, 1.3) : 1 - -a / AFTERGLOW;
        passes[s.tone * LEVELS + Math.min(LEVELS - 1, Math.floor(k * LEVELS))].push(i);
      }
      for (let tone = 0; tone < TONES.length; tone++) {
        ctx.fillStyle = TONES[tone];
        for (let level = 0; level < LEVELS; level++) {
          const list = passes[tone * LEVELS + level];
          if (!list.length) continue;
          ctx.globalAlpha = ((level + 0.5) / LEVELS) * 0.95;
          for (const i of list) {
            const s = specks[i];
            const [x, y] = at(s, Math.max(0, s.land - t));
            ctx.fillRect(x, y, s.size, s.size);
          }
        }
      }
      ctx.globalAlpha = 1;
      if (t < last) raf = requestAnimationFrame(frame);
      else {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        whole();
        resolve();
      }
    };
    raf = requestAnimationFrame(frame);
  });
  return {
    done,
    stop() {
      stopped = true;
      cancelAnimationFrame(raf);
      whole();
    },
  };
}
