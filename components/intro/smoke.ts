/**
 * The intro's stir: a Canvas 2D copy of the logo, cut into narrow upright
 * strips that a mouse pointer pushes around like smoke.
 *
 * It takes over from the page's logo only when asked (interactive()),
 * drawing it exactly where the browser laid it out, so the hand-over can't
 * be seen; the canvas is clear everywhere else, over the overlay's own
 * black. release() stops drawing the logo (the intro carries its copy off
 * to the header). One requestAnimationFrame loop; destroy() frees everything.
 */

export type Smoke = {
  /** Take over the logo from the page and let the pointer stir it. False if it can't yet (the image). */
  interactive(): boolean;
  /** Pointer position in viewport px, or null when it leaves. */
  pointer(x: number | null, y?: number): void;
  /** Hand the logo back: stop drawing it. */
  release(): void;
  destroy(): void;
};

/** A strip of the logo: where it's drawn, its slice of the picture (sx, from the left, in CSS px), and how far it's been pushed. */
type Strip = { x: number; y: number; w: number; h: number; sx: number; cx: number; cy: number; dx: number; dy: number; vx: number; vy: number };
type Picture = { img: HTMLImageElement; x: number; y: number; w: number; h: number; alpha: number; strips: Strip[] };

/**
 * Every [data-picture] image, cut into upright strips so the pointer can
 * bend it. Null while any of them hasn't loaded: the canvas would draw a gap.
 */
function measurePictures(root: HTMLElement, box: DOMRect): Picture[] | null {
  const out: Picture[] = [];
  for (const img of root.querySelectorAll<HTMLImageElement>("img[data-picture]")) {
    if (!img.complete || !img.naturalWidth) return null;
    const r = img.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const alpha = Number(getComputedStyle(img).opacity) || 0;
    const x = r.left - box.left;
    const y = r.top - box.top;
    const n = Math.max(8, Math.round(r.width / 20));
    const w = r.width / n;
    const strips = Array.from({ length: n }, (_, i): Strip => ({
      x: x + i * w,
      y,
      w,
      h: r.height,
      sx: i * w,
      cx: x + i * w + w / 2,
      cy: y + r.height / 2,
      dx: 0,
      dy: 0,
      vx: 0,
      vy: 0,
    }));
    out.push({ img, x, y, w: r.width, h: r.height, alpha, strips });
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
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const strips = pictures.flatMap((p) => p.strips);
  // Each picture drawn once at its size on screen, to cut the strips from. (An
  // image picked from a srcset reports its size on the page, not its file's,
  // so slicing the image itself would cut in the wrong places.)
  const rasters = pictures.map((p) => {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(p.w * dpr));
    c.height = Math.max(1, Math.round(p.h * dpr));
    const g = c.getContext("2d")!;
    g.imageSmoothingQuality = "high";
    g.drawImage(p.img, 0, 0, c.width, c.height);
    return c;
  });

  /* ── The pointer and its field ─────────────────────────────────────── */

  const P = { x: 0, y: 0, vx: 0, vy: 0, on: false, lx: 0, ly: 0, lt: 0 };
  const R = Math.max(90, Math.min(220, W * 0.12));
  const tgt = { x: 0, y: 0 };

  /**
   * Where the stir wants a point at (cx, cy) to be pushed: around the pointer
   * (a swirl), a little away from it, and along with its motion — so a slow
   * pass curls the strips, a fast one drags them like smoke.
   */
  function field(cx: number, cy: number, time: number) {
    if (!P.on) {
      tgt.x = tgt.y = 0;
      return;
    }
    const ox = cx - P.x;
    const oy = cy - P.y;
    const f = Math.exp(-(ox * ox + oy * oy) / (R * R));
    if (f < 0.003) {
      tgt.x = tgt.y = 0;
      return;
    }
    const d = Math.hypot(ox, oy) || 1;
    const nx = ox / d;
    const ny = oy / d;
    const wobble = Math.sin(time * 2.1 + cx * 0.05 + cy * 0.03) * 4;
    tgt.x = f * (-ny * 26 + nx * 10 + P.vx * 0.05 + wobble);
    tgt.y = f * (nx * 26 + ny * 10 + P.vy * 0.05 - wobble);
  }

  /* ── Drawing ────────────────────────────────────────────────────────── */

  function drawLogo() {
    // Whole while nothing has moved it (exactly as the page drew it), else
    // strip by strip, each a hair wider so no gap opens between.
    ctx!.imageSmoothingQuality = "high";
    pictures!.forEach((p, i) => {
      const raster = rasters[i];
      ctx!.globalAlpha = p.alpha;
      if (p.strips.every((s) => Math.abs(s.dx) + Math.abs(s.dy) < 0.05)) {
        ctx!.drawImage(raster, p.x, p.y, p.w, p.h);
        return;
      }
      const k = raster.width / p.w;
      for (const s of p.strips) {
        const tilt = s.dx * 0.002;
        const w = Math.min(s.w + 0.6, p.w - s.sx);
        if (Math.abs(tilt) < 0.002) {
          ctx!.drawImage(raster, s.sx * k, 0, w * k, raster.height, s.x + s.dx, s.y + s.dy, w, s.h);
        } else {
          ctx!.save();
          ctx!.translate(s.cx + s.dx, s.cy + s.dy);
          ctx!.rotate(tilt);
          ctx!.drawImage(raster, s.sx * k, 0, w * k, raster.height, s.x - s.cx, s.y - s.cy, w, s.h);
          ctx!.restore();
        }
      }
    });
    ctx!.globalAlpha = 1;
  }

  /* ── The loop ───────────────────────────────────────────────────────── */

  let live = false;
  let raf = 0;
  let last = 0;

  function stepStrips(dt: number, time: number) {
    for (const s of strips) {
      field(s.cx, s.cy, time);
      s.vx += (90 * (tgt.x - s.dx) - 14 * s.vx) * dt;
      s.vy += (90 * (tgt.y - s.dy) - 14 * s.vy) * dt;
      s.dx += s.vx * dt;
      s.dy += s.vy * dt;
    }
  }

  function tick(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    const time = now / 1000;
    P.vx *= Math.exp(-dt * 6);
    P.vy *= Math.exp(-dt * 6);
    stepStrips(dt, time);
    ctx!.clearRect(0, 0, W, H);
    drawLogo();
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
      ctx.clearRect(0, 0, W, H);
      drawLogo();
      root.dataset.mode = "canvas";
      live = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
      return true;
    },

    pointer(x, y) {
      const now = performance.now();
      if (x === null || y === undefined) {
        P.on = false;
        return;
      }
      x -= box.left;
      y -= box.top;
      if (P.on && P.lt) {
        const dt = Math.max(8, now - P.lt) / 1000;
        P.vx += ((x - P.lx) / dt - P.vx) * 0.35;
        P.vy += ((y - P.ly) / dt - P.vy) * 0.35;
      }
      P.x = P.lx = x;
      P.y = P.ly = y;
      P.lt = now;
      P.on = true;
    },

    release() {
      stop();
      ctx.clearRect(0, 0, W, H);
    },

    destroy() {
      stop();
      ctx.clearRect(0, 0, W, H);
      canvas.width = canvas.height = 0;
      for (const c of rasters) c.width = c.height = 0;
    },
  };
}
