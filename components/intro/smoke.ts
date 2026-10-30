/**
 * The intro's stir: a Canvas 2D copy of the logo that a mouse pointer bends,
 * gently: a slow ripple of a few pixels, strongest under the pointer and
 * easing out to nothing at a distance, that settles back when the pointer
 * goes.
 *
 * The bend is drawn one screen pixel column at a time: each column takes the
 * column of the logo the bend says belongs there, moved up or down and
 * stretched a touch. The bend changes smoothly from one column to the next,
 * so the logo stays whole: no seams, no letter torn.
 *
 * It takes over from the page's logo only when asked (interactive()),
 * drawing it exactly where the browser laid it out, so the hand-over can't
 * be seen; the canvas is clear everywhere else, over the overlay's own
 * black. release() stops drawing the logo (the intro carries its copy off
 * to the header). One requestAnimationFrame loop; destroy() frees everything.
 */

export type Smoke = {
  /** Take over the logo from the page and let the pointer bend it. False if it can't yet (the image). */
  interactive(): boolean;
  /** Pointer position in viewport px, or null when it leaves. */
  pointer(x: number | null, y?: number): void;
  /** Hand the logo back: stop drawing it. */
  release(): void;
  destroy(): void;
};

type Picture = { img: HTMLImageElement; x: number; y: number; w: number; h: number; alpha: number };
type Shift = { dx: number; dy: number };

const TAU = Math.PI * 2;

/** The bend, in CSS px: the ripple up and down, the swell of the letters nearest the pointer, and the most it drags them along. */
const RIPPLE = 4;
const SWELL = 2.5;
const DRAG = 2.5;
/** Seconds: the bend gliding after the pointer, coming in, and dying away. */
const FOLLOW = 0.12;
const RISE = 0.35;
const FALL = 0.5;
/** The ripple's travel, in waves a second. */
const SPEED = 0.45;

/** Every [data-picture] image. Null while any of them hasn't loaded: the canvas would draw a gap. */
function measurePictures(root: HTMLElement, box: DOMRect): Picture[] | null {
  const out: Picture[] = [];
  for (const img of root.querySelectorAll<HTMLImageElement>("img[data-picture]")) {
    if (!img.complete || !img.naturalWidth) return null;
    const r = img.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const alpha = Number(getComputedStyle(img).opacity) || 0;
    out.push({ img, x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height, alpha });
  }
  return out;
}

export function createSmoke(root: HTMLElement, canvas: HTMLCanvasElement): Smoke | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const box = root.getBoundingClientRect();
  const W = box.width;
  const H = box.height;
  if (!W || !H) return null;
  const pictures = measurePictures(root, box);
  if (!pictures) return null;

  const dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(8.3e6 / (W * H)));
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);

  // Each picture drawn once at its size on screen, to take the columns from.
  // (An image picked from a srcset reports its size on the page, not its
  // file's, so slicing the image itself would cut in the wrong places.)
  const rasters = pictures.map((p) => {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(p.w * dpr));
    c.height = Math.max(1, Math.round(p.h * dpr));
    const g = c.getContext("2d")!;
    g.imageSmoothingQuality = "high";
    g.drawImage(p.img, 0, 0, c.width, c.height);
    return c;
  });

  /* ── The pointer and the bend ───────────────────────────────────────── */

  // Where the pointer is (P), and where the bend is centred (S), gliding after it.
  const P = { x: 0, y: 0, on: false };
  const S = { x: 0, y: 0, vx: 0 };
  /** How much of the bend there is, 0 to 1. */
  let amount = 0;
  let phase = 0;
  /** How far the bend reaches from its centre. */
  const R = Math.max(110, Math.min(190, W * 0.1));
  const WAVE = R * 0.9;

  /** Whether the pointer is over the logo or close to it. */
  const near = () =>
    P.on && pictures.some((p) => P.x > p.x - R / 2 && P.x < p.x + p.w + R / 2 && P.y > p.y - R / 2 && P.y < p.y + p.h + R / 2);

  /**
   * How far the bend moves the logo at (x, y), in CSS px. Strongest at its
   * centre, and easing out to nothing at R, so nothing past it is touched.
   */
  function bend(x: number, y: number, out: Shift) {
    const ox = x - S.x;
    const oy = y - S.y;
    const q = (ox * ox + oy * oy) / (R * R);
    if (q >= 1) {
      out.dx = out.dy = 0;
      return;
    }
    const f = amount * (1 - q) * (1 - q);
    out.dx = f * ((ox / R) * SWELL + Math.max(-DRAG, Math.min(DRAG, S.vx * 0.006)));
    out.dy = f * (Math.sin((TAU * ox) / WAVE - phase) * RIPPLE + (oy / R) * SWELL);
  }

  /* ── Drawing ────────────────────────────────────────────────────────── */

  const top: Shift = { dx: 0, dy: 0 };
  const foot: Shift = { dx: 0, dy: 0 };

  function drawLogo() {
    // In the canvas's own pixels, so each column fills exactly one.
    ctx!.setTransform(1, 0, 0, 1, 0, 0);
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    ctx!.imageSmoothingQuality = "high";
    pictures!.forEach((p, i) => {
      const raster = rasters[i];
      ctx!.globalAlpha = p.alpha;
      const x0 = p.x * dpr;
      const y0 = p.y * dpr;
      const w = p.w * dpr;
      const h = p.h * dpr;
      const k = raster.width / w;
      // The columns the bend reaches. Unbent, the logo is drawn whole, exactly as the page drew it.
      const a = Math.max(Math.ceil(x0), Math.floor((S.x - R) * dpr));
      const b = Math.min(Math.floor(x0 + w), Math.ceil((S.x + R) * dpr));
      if (amount < 0.001 || b <= a) {
        ctx!.drawImage(raster, x0, y0, w, h);
        return;
      }
      // Either side of the bend, as it is; within it, column by column, each
      // from where the bend says it came from, its top and foot moved apart.
      if (a > x0) ctx!.drawImage(raster, 0, 0, (a - x0) * k, raster.height, x0, y0, a - x0, h);
      if (b < x0 + w) ctx!.drawImage(raster, (b - x0) * k, 0, (x0 + w - b) * k, raster.height, b, y0, x0 + w - b, h);
      for (let c = a; c < b; c++) {
        const x = (c + 0.5) / dpr;
        bend(x, p.y, top);
        bend(x, p.y + p.h, foot);
        const from = Math.min(Math.max((c - x0 - ((top.dx + foot.dx) / 2) * dpr) * k, 0), raster.width - k);
        const y1 = y0 + top.dy * dpr;
        const y2 = y0 + h + foot.dy * dpr;
        ctx!.drawImage(raster, from, 0, k, raster.height, c, y1, 1, y2 - y1);
      }
    });
    ctx!.globalAlpha = 1;
  }

  /* ── The loop ───────────────────────────────────────────────────────── */

  let live = false;
  let raf = 0;
  let last = 0;
  /** Drawn whole and at rest: nothing to redraw until the pointer comes back. */
  let still = false;

  function tick(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    // Near the logo, the bend glides after the pointer and comes in; away
    // from it (or off the page), it stays where it was and dies away.
    const close = near();
    if (close) {
      const glide = 1 - Math.exp(-dt / FOLLOW);
      const x = S.x + (P.x - S.x) * glide;
      S.vx += ((x - S.x) / dt - S.vx) * (1 - Math.exp(-dt / 0.15));
      S.x = x;
      S.y += (P.y - S.y) * glide;
    } else S.vx *= Math.exp(-dt / 0.15);
    const want = close ? 1 : 0;
    amount += (want - amount) * (1 - Math.exp(-dt / (close ? RISE : FALL)));
    if (!close && amount < 0.002) amount = 0;
    phase += dt * TAU * SPEED;
    if (amount || !still) drawLogo();
    still = !amount;
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  return {
    interactive() {
      if (live) return true;
      // Draw the logo as it stands and put the canvas in front of the page's, in one go.
      drawLogo();
      still = true;
      root.dataset.mode = "canvas";
      live = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
      return true;
    },

    pointer(x, y) {
      if (x === null || y === undefined) {
        P.on = false;
        return;
      }
      P.x = x - box.left;
      P.y = y - box.top;
      P.on = true;
      // Coming back after the bend has died away: it starts where the pointer is.
      if (amount < 0.05) {
        S.x = P.x;
        S.y = P.y;
        S.vx = 0;
      }
    },

    release() {
      stop();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },

    destroy() {
      stop();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = canvas.height = 0;
      for (const c of rasters) c.width = c.height = 0;
    },
  };
}
