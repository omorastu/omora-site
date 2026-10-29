/**
 * The intro's smoke: a Canvas 2D picture of the overlay — paper surface,
 * logo, letters, hairline — that the pointer can stir and that then breaks
 * into soft particles which blur, rise and fade away.
 *
 * The letters are drawn one by one, and the logo whole, at the positions the
 * browser laid them out at (measured from the DOM), so the moment the canvas
 * takes over from the real page is invisible. Stirred, the logo moves as
 * narrow upright strips; breaking up, its particles keep its golds (unless
 * the intro has taken the logo off whole, to fly it to the header).
 * Particle counts are capped by screen size, there is one
 * requestAnimationFrame loop, and destroy() frees everything.
 */

export type Smoke = {
  /** Take over from the DOM and let the pointer stir the letters. False if it can't yet (fonts). */
  interactive(): boolean;
  /** Pointer position in viewport px, or null when it leaves. */
  pointer(x: number | null, y?: number): void;
  /**
   * Break into particles over `ms`, then call `done`. With `pictures` false
   * the logo is left out, for the caller to carry off whole.
   */
  dissolve(ms: number, done: () => void, opts?: { pictures?: boolean }): void;
  destroy(): void;
};

/** Anything the pointer can push around: a letter, a piece of the hairline, or a strip of the logo. */
type Bit = { cx: number; cy: number; dx: number; dy: number; vx: number; vy: number };
type Glyph = Bit & { ch: string; font: string; x: number; base: number; top: number; w: number; h: number; alpha: number };
type Segment = Bit & { x: number; y: number; w: number; h: number; alpha: number };
/** A strip of a picture: where it's drawn, and its slice of the picture (sx, from the picture's left, in CSS px). */
type Strip = Segment & { sx: number };
type Picture = { img: HTMLImageElement; x: number; y: number; w: number; h: number; alpha: number; strips: Strip[] };
type Mote = { x: number; y: number; vx: number; vy: number; r: number; a: number };
type Puff = {
  x: number;
  y: number;
  r: number;
  a: number;
  vx: number;
  vy: number;
  delay: number;
  life: number;
  seed: number;
  /** Which dab it's stamped with (DABS): ink, or one of the logo's golds. */
  tone: number;
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** A soft round dab, pre-rendered once and stamped with drawImage. */
function dab(rgb: string, px: number, stops: [number, number][]) {
  const c = document.createElement("canvas");
  c.width = c.height = px;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(px / 2, px / 2, 0, px / 2, px / 2, px / 2);
  for (const [at, a] of stops) grad.addColorStop(at, `rgba(${rgb},${a})`);
  g.fillStyle = grad;
  g.fillRect(0, 0, px, px);
  return c;
}

/** Every visible character inside [data-glyphs], with its font and laid-out position. */
function measureGlyphs(root: HTMLElement, box: DOMRect, ctx: CanvasRenderingContext2D) {
  const out: Glyph[] = [];
  const range = document.createRange();
  const ascent = new Map<string, number>();

  for (const el of root.querySelectorAll<HTMLElement>("[data-glyphs]")) {
    const alpha = Number(getComputedStyle(el).opacity) || 0;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
      const cs = getComputedStyle(node.parentElement!);
      const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const upper = cs.textTransform === "uppercase";

      // Where the baseline sits inside the character's box: the font's ascent
      // as a share of ascent + descent, which is what the box is made of.
      let share = ascent.get(font);
      if (share === undefined) {
        ctx.font = font;
        const m = ctx.measureText("Hg");
        const a = m.fontBoundingBoxAscent;
        const d = m.fontBoundingBoxDescent;
        share = a && d ? a / (a + d) : 0.8;
        ascent.set(font, share);
      }

      const text = node.data;
      for (let i = 0; i < text.length; i++) {
        if (/\s/.test(text[i])) continue;
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const r = range.getClientRects()[0];
        if (!r || !r.width) continue;
        const x = r.left - box.left;
        const top = r.top - box.top;
        out.push({
          ch: upper ? text[i].toUpperCase() : text[i],
          font,
          x,
          base: top + r.height * share,
          top,
          w: r.width,
          h: r.height,
          cx: x + r.width / 2,
          cy: top + r.height / 2,
          alpha,
          dx: 0,
          dy: 0,
          vx: 0,
          vy: 0,
        });
      }
    }
  }
  range.detach();
  return out;
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
      alpha,
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

/** The hairline, cut into short pieces so the pointer can bend it. */
function measureLine(root: HTMLElement, box: DOMRect) {
  const el = root.querySelector<HTMLElement>("[data-hairline]");
  if (!el) return [];
  const r = el.getBoundingClientRect();
  const alpha = Number(getComputedStyle(el).opacity) || 0;
  const n = 16;
  const w = r.width / n;
  return Array.from({ length: n }, (_, i): Segment => {
    const x = r.left - box.left + i * w;
    const y = r.top - box.top;
    return { x, y, w: w + 0.4, h: r.height, alpha, cx: x + w / 2, cy: y, dx: 0, dy: 0, vx: 0, vy: 0 };
  });
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

  // Phones and touch screens get the lighter budget.
  const light = !fine || W < 700;
  const dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(8.3e6 / (W * H)));
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  // The surface is painted in the overlay's own ground from intro.css, read
  // here, before the canvas takes over and that ground turns transparent.
  const ground = getComputedStyle(root).backgroundColor.match(/[\d.]+/g)?.map(Number) ?? [];
  const surfaceRgb = ground.length >= 3 && (ground[3] ?? 1) > 0 ? ground.slice(0, 3).join(",") : "244,241,234";
  const surface = `rgb(${surfaceRgb})`;

  const glyphs = measureGlyphs(root, box, ctx);
  const line = measureLine(root, box);
  const strips = pictures.flatMap((p) => p.strips);
  const bits: Bit[] = [...glyphs, ...line, ...strips];
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
  // Readiness probes: each font with its primary family only — next/font's
  // local() fallback face never loads, so checking the full list never passes.
  const probes = [...new Set(glyphs.map((g) => g.font.replace(/,.*$/, "")))];

  const inkStops: [number, number][] = [
    [0, 1],
    [0.22, 0.62],
    [0.5, 0.22],
    [0.78, 0.05],
    [1, 0],
  ];
  const ink = dab("0,0,0", 32, inkStops);
  const mist = dab(surfaceRgb, 128, [
    [0, 1],
    [0.55, 0.9],
    [1, 0],
  ]);
  // The particles' dabs: ink for the letters; the logo's deep, mid and light golds for it.
  const DABS = [ink, ...["137,97,36", "203,154,62", "239,213,138"].map((rgb) => dab(rgb, 32, inkStops))];
  /** The dab for a sampled pixel: a gold by its lightness where the pixel is warm, else ink. */
  const toneOf = (r: number, g: number, b: number) => {
    if (r - b < 40) return 0;
    const l = 0.3 * r + 0.59 * g + 0.11 * b;
    return l < 120 ? 1 : l < 185 ? 2 : 3;
  };

  /* ── The pointer and its field ─────────────────────────────────────── */

  const P = { x: 0, y: 0, vx: 0, vy: 0, on: false, lx: 0, ly: 0, lt: 0 };
  const R = Math.max(90, Math.min(220, W * 0.12));
  const tgt = { x: 0, y: 0 };

  /**
   * Where the stir wants a point at (cx, cy) to be pushed: around the pointer
   * (a swirl), a little away from it, and along with its motion — so a slow
   * pass curls the letters, a fast one drags them like smoke. Returns falloff.
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

  /* ── Drawing the overlay itself ─────────────────────────────────────── */

  /** Whether the logo is still the canvas's to draw (dissolve() can hand it off). */
  let withPictures = true;

  function drawInk(c: CanvasRenderingContext2D) {
    // The logo: whole while nothing has moved it (exactly as the page drew
    // it), else strip by strip, each a hair wider so no gap opens between.
    c.imageSmoothingQuality = "high";
    if (withPictures) pictures!.forEach((p, i) => {
      const raster = rasters[i];
      c.globalAlpha = p.alpha;
      if (p.strips.every((s) => Math.abs(s.dx) + Math.abs(s.dy) < 0.05)) {
        c.drawImage(raster, p.x, p.y, p.w, p.h);
        return;
      }
      const k = raster.width / p.w;
      for (const s of p.strips) {
        const tilt = s.dx * 0.002;
        const w = Math.min(s.w + 0.6, p.w - s.sx);
        if (Math.abs(tilt) < 0.002) {
          c.drawImage(raster, s.sx * k, 0, w * k, raster.height, s.x + s.dx, s.y + s.dy, w, s.h);
        } else {
          c.save();
          c.translate(s.cx + s.dx, s.cy + s.dy);
          c.rotate(tilt);
          c.drawImage(raster, s.sx * k, 0, w * k, raster.height, s.x - s.cx, s.y - s.cy, w, s.h);
          c.restore();
        }
      }
    });
    c.fillStyle = "#000";
    for (const s of line) {
      c.globalAlpha = s.alpha;
      c.fillRect(s.x + s.dx, s.y + s.dy, s.w, s.h);
    }
    let font = "";
    for (const g of glyphs) {
      if (g.font !== font) c.font = font = g.font;
      c.globalAlpha = g.alpha;
      const still = Math.abs(g.dx) + Math.abs(g.dy) < 0.05;
      const tilt = g.dx * 0.0035;
      if (still) c.fillText(g.ch, g.x, g.base);
      else if (Math.abs(tilt) < 0.002) c.fillText(g.ch, g.x + g.dx, g.base + g.dy);
      else {
        c.save();
        c.translate(g.cx + g.dx, g.cy + g.dy);
        c.rotate(tilt);
        c.fillText(g.ch, g.x - g.cx, g.base - g.cy);
        c.restore();
      }
    }
    c.globalAlpha = 1;
  }

  /* ── Ambient smoke the pointer stirs (mouse only) ───────────────────── */

  const motes: Mote[] = [];
  if (!light) {
    const n = Math.round(Math.max(60, Math.min(150, (W * H) / 10000)));
    for (let i = 0; i < n; i++) {
      motes.push({ x: rand(0, W), y: rand(0, H), vx: 0, vy: rand(-14, -4), r: rand(8, 26), a: rand(0.025, 0.07) });
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
    for (const m of motes) {
      ctx!.globalAlpha = m.a * fade;
      ctx!.drawImage(ink, m.x - m.r, m.y - m.r, m.r * 2, m.r * 2);
    }
    ctx!.globalAlpha = 1;
  }

  /* ── The loop ───────────────────────────────────────────────────────── */

  let mode: "idle" | "live" | "dissolve" = "idle";
  let raf = 0;
  let last = 0;
  let liveAt = 0;
  let dissolveAt = 0;
  let dissolveMs = 1500;
  let onDone: (() => void) | null = null;
  let crisp: HTMLCanvasElement | null = null;
  let specks: Puff[] = [];
  let puffs: Puff[] = [];

  function stepBits(dt: number, time: number) {
    for (const b of bits) {
      field(b.cx, b.cy, time);
      b.vx += (90 * (tgt.x - b.dx) - 14 * b.vx) * dt;
      b.vy += (90 * (tgt.y - b.dy) - 14 * b.vy) * dt;
      b.dx += b.vx * dt;
      b.dy += b.vy * dt;
    }
  }

  function frameLive(now: number, dt: number) {
    const time = now / 1000;
    P.vx *= Math.exp(-dt * 6);
    P.vy *= Math.exp(-dt * 6);
    stepBits(dt, time);
    stepMotes(dt, time);
    ctx!.clearRect(0, 0, W, H);
    ctx!.fillStyle = surface;
    ctx!.fillRect(0, 0, W, H);
    drawMotes(smooth(0, 600, now - liveAt));
    drawInk(ctx!);
  }

  function frameDissolve(now: number, dt: number) {
    const c = ctx!;
    const total = dissolveMs / 1000;
    const t = (now - dissolveAt) / 1000;
    // Everything below is timed in the 1.5s frame; a different length scales it.
    const s = (t * 1.5) / total;
    const time = now / 1000;

    if (s >= 1.5) {
      c.clearRect(0, 0, W, H);
      stop();
      const done = onDone;
      onDone = null;
      done?.();
      return;
    }

    c.clearRect(0, 0, W, H);

    // The solid surface thins out first; the mist puffs carry it from there.
    const under = 1 - smooth(0.05, 0.5, s);
    if (under > 0) {
      c.globalAlpha = under;
      c.fillStyle = surface;
      c.fillRect(0, 0, W, H);
    }

    for (const p of puffs) {
      const k = s - p.delay;
      const life = clamp01(k / p.life);
      const a = 1 - Math.pow(life, 1.6);
      if (a <= 0.004) continue;
      const kk = Math.max(0, k);
      const x = p.x + p.vx * kk + Math.sin(p.seed + time * 1.6) * 18 * life;
      const y = p.y + p.vy * kk - 120 * kk * kk;
      const r = p.r * (1 + 1.3 * life);
      c.globalAlpha = a;
      c.drawImage(mist, x - r, y - r, r * 2, r * 2);
    }

    if (motes.length) {
      const fade = 1 - smooth(0, 0.6, s);
      if (fade > 0) {
        for (const m of motes) m.y += (m.vy - 40 * s) * dt;
        drawMotes(fade);
      }
    }

    // The crisp letters hand over to their particles in the first moments.
    const sharp = 1 - smooth(0, 0.22, s);
    if (crisp && sharp > 0) {
      c.globalAlpha = sharp;
      c.drawImage(crisp, 0, -14 * (1 - sharp), W, H);
    }

    // ...and the particles cross-fade in under them, rather than piling on top.
    const appear = smooth(0, 0.2, s);
    for (const p of specks) {
      const k = s - p.delay;
      const life = clamp01(k / p.life);
      if (life >= 1) continue;
      const kk = Math.max(0, k);
      let x = p.x + p.vx * kk + Math.sin(p.seed + time * 2.2 + p.y * 0.02) * 22 * life;
      let y = p.y + p.vy * kk - 110 * kk * kk + Math.cos(p.seed * 1.7 + time * 1.8) * 8 * life;
      if (P.on) {
        const f = field(x, y, time);
        if (f) {
          x += tgt.x * 1.6;
          y += tgt.y * 1.6;
        }
      }
      const r = p.r * (1 + 5 * life);
      c.globalAlpha = (appear * p.a * 0.85 * (1 - life) * (1 - life * 0.4)) / (1 + 2.2 * life);
      c.drawImage(DABS[p.tone], x - r, y - r, r * 2, r * 2);
    }
    c.globalAlpha = 1;
  }

  function tick(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    try {
      if (mode === "live") frameLive(now, dt);
      else if (mode === "dissolve") frameDissolve(now, dt);
    } catch {
      // A broken frame must not leave the overlay up: skip straight to the end.
      ctx!.clearRect(0, 0, W, H);
      stop();
      const done = onDone;
      onDone = null;
      done?.();
      return;
    }
    if (mode !== "idle") raf = requestAnimationFrame(tick);
  }

  function start() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    mode = "idle";
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  /** Draw the overlay as it stands and put the canvas in front of the DOM, in one go. */
  function takeOver() {
    ctx!.clearRect(0, 0, W, H);
    ctx!.fillStyle = surface;
    ctx!.fillRect(0, 0, W, H);
    drawInk(ctx!);
    root.dataset.mode = "canvas";
  }

  /* ── Breaking the overlay into particles ────────────────────────────── */

  function buildParticles() {
    // The logo, letters and line as they stand, crisp, for the hand-over.
    crisp = document.createElement("canvas");
    crisp.width = canvas.width;
    crisp.height = canvas.height;
    const cc = crisp.getContext("2d")!;
    cc.setTransform(dpr, 0, 0, dpr, 0, 0);
    cc.textBaseline = "alphabetic";
    drawInk(cc);

    // Sample the ink inside its own bounding box.
    let x0 = W, y0 = H, x1 = 0, y1 = 0;
    // Padded for italic overhang and for letters the pointer has pushed.
    for (const g of glyphs) {
      x0 = Math.min(x0, g.x + g.dx - 20);
      x1 = Math.max(x1, g.x + g.dx + g.w + 20);
      y0 = Math.min(y0, g.top + g.dy - 20);
      y1 = Math.max(y1, g.top + g.dy + g.h + 20);
    }
    for (const s of line) {
      x0 = Math.min(x0, s.x - 4);
      x1 = Math.max(x1, s.x + s.w + 4);
      y0 = Math.min(y0, s.y - 8);
      y1 = Math.max(y1, s.y + 8);
    }
    for (const s of withPictures ? strips : []) {
      x0 = Math.min(x0, s.x + s.dx - 8);
      x1 = Math.max(x1, s.x + s.dx + s.w + 8);
      y0 = Math.min(y0, s.y + s.dy - 8);
      y1 = Math.max(y1, s.y + s.dy + s.h + 8);
    }
    x0 = Math.max(0, Math.floor(x0));
    y0 = Math.max(0, Math.floor(y0));
    x1 = Math.min(W, Math.ceil(x1));
    y1 = Math.min(H, Math.ceil(y1));

    const found: Puff[] = [];
    if (x1 > x0 && y1 > y0) {
      const step = light ? 3 : 2;
      const px = (v: number) => Math.round(v * dpr);
      const bw = px(x1) - px(x0);
      const bh = px(y1) - px(y0);
      const data = cc.getImageData(px(x0), px(y0), bw, bh).data;
      for (let y = y0; y < y1; y += step) {
        for (let x = x0; x < x1; x += step) {
          const ix = px(x) - px(x0);
          const iy = px(y) - px(y0);
          if (ix >= bw || iy >= bh) continue;
          const i = (iy * bw + ix) * 4;
          const a = data[i + 3];
          if (a < 70) continue;
          found.push({
            x,
            y,
            r: step * 1.1,
            a: a / 255,
            vx: rand(-18, 18),
            vy: rand(-70, -20),
            delay: 0.02 + Math.random() * 0.28 + 0.1 * (x / W),
            life: rand(0.7, 1.0),
            seed: rand(0, 6.28),
            tone: toneOf(data[i], data[i + 1], data[i + 2]),
          });
        }
      }
    }
    // Cap the count: keep an even random sample.
    const cap = light ? 1100 : 3200;
    for (let i = found.length - 1; i > 0 && found.length > cap; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [found[i], found[j]] = [found[j], found[i]];
    }
    specks = found.length > cap ? found.slice(0, cap) : found;
    // Fewer, larger dabs keep the same ink when the sample was thinned.
    if (found.length > cap) {
      const grow = Math.sqrt(found.length / cap);
      for (const p of specks) p.r *= grow;
    }

    // The surface as overlapping mist, thinnest at the bottom first.
    const g = Math.max(light ? 58 : 52, Math.sqrt((W * H) / (light ? 160 : 320)));
    for (let y = g / 2; y < H + g; y += g) {
      for (let x = g / 2; x < W + g; x += g) {
        const px = x + rand(-0.25, 0.25) * g;
        const py = y + rand(-0.25, 0.25) * g;
        const noise = Math.sin(px * 0.013 + py * 0.007) * 0.5 + Math.sin(px * 0.004 - py * 0.011 + 1.7) * 0.5;
        puffs.push({
          x: px,
          y: py,
          r: g * 1.2,
          a: 1,
          vx: rand(-20, 20),
          vy: rand(-110, -40),
          delay: clamp01(0.06 + 0.36 * (1 - py / H) + 0.26 * noise) * 0.62,
          life: rand(0.7, 0.85),
          seed: rand(0, 6.28),
          tone: 0,
        });
      }
    }
  }

  return {
    interactive() {
      if (mode !== "idle" || !bits.length) return mode === "live";
      // Only once the real faces are in, or the hand-over would visibly swap fonts.
      try {
        if (!probes.every((f) => document.fonts?.check(f) ?? true)) return false;
      } catch {
        return false;
      }
      takeOver();
      mode = "live";
      liveAt = performance.now();
      start();
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

    dissolve(ms, done, opts) {
      if (mode === "dissolve") return;
      if (opts?.pictures === false) withPictures = false;
      if (mode === "idle") takeOver();
      buildParticles();
      dissolveMs = ms;
      dissolveAt = performance.now();
      onDone = done;
      mode = "dissolve";
      start();
    },

    destroy() {
      stop();
      onDone = null;
      ctx.clearRect(0, 0, W, H);
      canvas.width = canvas.height = 0;
      if (crisp) crisp.width = crisp.height = 0;
      crisp = null;
      for (const d of [...DABS, ...rasters]) d.width = d.height = 0;
      mist.width = mist.height = 0;
      specks = [];
      puffs = [];
      motes.length = 0;
    },
  };
}
