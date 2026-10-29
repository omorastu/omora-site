/**
 * The intro's stir: a Canvas 2D copy of the logo, cut into narrow upright
 * strips that a mouse pointer pushes around like smoke, over a few faint
 * motes of warm smoke drifting up the black.
 *
 * It takes over from the page's logo only when asked (interactive()),
 * drawing it exactly where the browser laid it out, so the hand-over can't
 * be seen; the canvas is clear everywhere else, over the overlay's own
 * black. release() stops drawing the logo (the intro carries its copy off
 * to the header) and lets the motes fade. One requestAnimationFrame loop;
 * destroy() frees everything.
 */

export type Smoke = {
  /** Take over the logo from the page and let the pointer stir it. False if it can't yet (the image). */
  interactive(): boolean;
  /** Pointer position in viewport px, or null when it leaves. */
  pointer(x: number | null, y?: number): void;
  /** Hand the logo back: stop drawing it, and fade the motes out. */
  release(): void;
  destroy(): void;
};

/** A strip of the logo: where it's drawn, its slice of the picture (sx, from the left, in CSS px), and how far it's been pushed. */
type Strip = { x: number; y: number; w: number; h: number; sx: number; cx: number; cy: number; dx: number; dy: number; vx: number; vy: number };
type Picture = { img: HTMLImageElement; x: number; y: number; w: number; h: number; alpha: number; strips: Strip[] };
type Mote = { x: number; y: number; vx: number; vy: number; r: number; a: number };

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** The motes' colour: the logo's palest gold, barely there on the black. */
const MOTE_RGB = "226,198,140";

/** A soft round dab, pre-rendered once and stamped with drawImage. */
function dab(rgb: string, px: number) {
  const c = document.createElement("canvas");
  c.width = c.height = px;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(px / 2, px / 2, 0, px / 2, px / 2, px / 2);
  for (const [at, a] of [[0, 1], [0.22, 0.62], [0.5, 0.22], [0.78, 0.05], [1, 0]]) grad.addColorStop(at, `rgba(${rgb},${a})`);
  g.fillStyle = grad;
  g.fillRect(0, 0, px, px);
  return c;
}

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

export function createSmoke(
  root: HTMLElement,
  canvas: HTMLCanvasElement,
  { fine }: { fine: boolean }
): Smoke | null {
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
  const mote = dab(MOTE_RGB, 32);

  /* ── The pointer and its field ─────────────────────────────────────── */

  const P = { x: 0, y: 0, vx: 0, vy: 0, on: false, lx: 0, ly: 0, lt: 0 };
  const R = Math.max(90, Math.min(220, W * 0.12));
  const tgt = { x: 0, y: 0 };

  /**
   * Where the stir wants a point at (cx, cy) to be pushed: around the pointer
   * (a swirl), a little away from it, and along with its motion — so a slow
   * pass curls the strips, a fast one drags them like smoke. Returns falloff.
   */
  function field(cx: number, cy: number, time: number) {
    if (!P.on) {
      tgt.x = tgt.y = 0;
      return 0;
    }
    const ox = cx - P.x;
    const oy = cy - P.y;
    const f = Math.exp(-(ox * ox + oy * oy) / (R * R));
    if (f < 0.003) {
      tgt.x = tgt.y = 0;
      return 0;
    }
    const d = Math.hypot(ox, oy) || 1;
    const nx = ox / d;
    const ny = oy / d;
    const wobble = Math.sin(time * 2.1 + cx * 0.05 + cy * 0.03) * 4;
    tgt.x = f * (-ny * 26 + nx * 10 + P.vx * 0.05 + wobble);
    tgt.y = f * (nx * 26 + ny * 10 + P.vy * 0.05 - wobble);
    return f;
  }

  /* ── Drawing ────────────────────────────────────────────────────────── */

  /** Whether the logo is still the canvas's to draw (release() hands it back). */
  let withLogo = true;

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

  /* ── Ambient smoke the pointer stirs (mouse only, on larger screens) ── */

  const motes: Mote[] = [];
  if (fine && W >= 700) {
    const n = Math.round(Math.max(60, Math.min(150, (W * H) / 10000)));
    for (let i = 0; i < n; i++) {
      motes.push({ x: rand(0, W), y: rand(0, H), vx: 0, vy: rand(-14, -4), r: rand(8, 26), a: rand(0.03, 0.08) });
    }
  }

  function stepMotes(dt: number, time: number) {
    for (const m of motes) {
      const f = field(m.x, m.y, time);
      if (f) {
        m.vx += tgt.x * 9 * dt;
        m.vy += tgt.y * 9 * dt;
      }
      const damp = Math.exp(-dt * 1.4);
      m.vx *= damp;
      m.vy = m.vy * damp + -9 * (1 - damp);
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      if (m.y < -m.r) m.y = H + m.r;
      if (m.x < -m.r) m.x = W + m.r;
      if (m.x > W + m.r) m.x = -m.r;
    }
  }

  function drawMotes(fade: number) {
    if (fade <= 0) return;
    for (const m of motes) {
      ctx!.globalAlpha = m.a * fade;
      ctx!.drawImage(mote, m.x - m.r, m.y - m.r, m.r * 2, m.r * 2);
    }
    ctx!.globalAlpha = 1;
  }

  /* ── The loop ───────────────────────────────────────────────────────── */

  let live = false;
  let raf = 0;
  let last = 0;
  let liveAt = 0;
  let releasedAt = 0;

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
    stepMotes(dt, time);
    ctx!.clearRect(0, 0, W, H);
    const out = releasedAt ? 1 - smooth(0, 300, now - releasedAt) : 1;
    drawMotes(smooth(0, 600, now - liveAt) * out);
    if (withLogo) drawLogo();
    if (releasedAt && out <= 0) return stop();
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
      liveAt = last = performance.now();
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
      withLogo = false;
      if (live && !releasedAt) releasedAt = performance.now();
      if (!raf) ctx.clearRect(0, 0, W, H);
    },

    destroy() {
      stop();
      ctx.clearRect(0, 0, W, H);
      canvas.width = canvas.height = 0;
      for (const c of [mote, ...rasters]) c.width = c.height = 0;
      motes.length = 0;
    },
  };
}
