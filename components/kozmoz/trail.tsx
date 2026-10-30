"use client";

import { useEffect, useRef } from "react";

/**
 * The cursor's trail: a fine gold thread behind the two rings while the
 * mouse moves. It runs back through the pointer's last few positions (at
 * most MAX, none older than FADE, and no longer than LONGEST), a few px wide
 * just behind the rings and tapering to nothing, in the gold type's golds
 * (kozmoz.css, .gold), light near the rings and deep and faint at its tail.
 * Each position fades as it ages, so the thread shortens and goes within
 * FADE of the mouse stopping. On the paper it's laid in under the ink
 * (kozmoz.css multiplies it), so where it crosses letters they stay whole.
 *
 * One fixed canvas over the page (and over the intro's black), drawn only
 * while there's a thread to draw. With a mouse or trackpad only; never on
 * touch or under reduced motion; not while the menu is open or over a text
 * field.
 */

/** How long a position stays in the thread, and how many it holds. */
const FADE = 260;
const MAX = 12;
/** However quick the mouse, the thread is never longer than this, in CSS px. */
const LONGEST = 140;
/** The thread's width just behind the rings, in CSS px. */
const HEAD = 2.6;
/** Where it starts: clear of the rings (22px across, the pointer between them). */
const CLEAR = 7;
/** At its strongest, it's this opaque. */
const PEAK = 0.55;
/** The gold type's golds: light, mid, deep (kozmoz.css). */
const GOLDS = ["190 150 69", "168 128 47", "135 97 34"];

type Point = { x: number; y: number; t: number };

export function Trail() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const fine = window.matchMedia("(pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const points: Point[] = [];
    let raf = 0;
    let dpr = 1;
    let blocked = false;

    /** The screen at its pixel density; nothing at all where the thread can't run. */
    const size = () => {
      const on = fine.matches && !still.matches;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = on ? Math.round(innerWidth * dpr) : 0;
      canvas.height = on ? Math.round(innerHeight * dpr) : 0;
    };
    const wipe = () => {
      points.length = 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    /** Not now: the menu is open, or the pointer is over a text field. */
    const off = () => blocked || document.documentElement.hasAttribute("data-menu");

    function frame() {
      raf = 0;
      const now = performance.now();
      while (points.length && now - points[0].t > FADE) points.shift();
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      if (off()) return wipe();
      if (points.length > 1) paint(now);
      if (points.length) raf = requestAnimationFrame(frame);
    }

    /** The thread, as one filled shape, so nothing overlaps and darkens. */
    function paint(now: number) {
      const line = trim(smooth(points), LONGEST);
      // From the head (the pointer) back: how far along, and the thread's width there.
      const dist = [0];
      for (let i = line.length - 2; i >= 0; i--) {
        dist.unshift(dist[0] + Math.hypot(line[i + 1].x - line[i].x, line[i + 1].y - line[i].y));
      }
      const length = dist[0];
      if (length < CLEAR + 2) return;
      const head = line[line.length - 1];
      const tail = line[0];
      const left: Point[] = [];
      const right: Point[] = [];
      for (let i = 0; i < line.length; i++) {
        const a = line[Math.max(0, i - 1)];
        const b = line[Math.min(line.length - 1, i + 1)];
        const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        const nx = -(b.y - a.y) / len;
        const ny = (b.x - a.x) / len;
        const along = (length - dist[i]) / length; // 1 at the head, 0 at the tail
        const w = (HEAD / 2) * along ** 1.3;
        left.push({ x: line[i].x + nx * w, y: line[i].y + ny * w, t: 0 });
        right.push({ x: line[i].x - nx * w, y: line[i].y - ny * w, t: 0 });
      }
      // It fades as a whole once the mouse stops, as its newest position ages.
      const life = Math.max(0, 1 - (now - points[points.length - 1].t) / FADE);
      const peak = PEAK * life;
      const gold = ctx!.createLinearGradient(head.x, head.y, tail.x, tail.y);
      const clear = Math.min(0.45, CLEAR / length);
      gold.addColorStop(0, `rgb(${GOLDS[0]} / 0)`);
      gold.addColorStop(clear, `rgb(${GOLDS[0]} / ${0.3 * peak})`);
      gold.addColorStop(clear + (1 - clear) * 0.2, `rgb(${GOLDS[0]} / ${peak})`);
      gold.addColorStop(clear + (1 - clear) * 0.55, `rgb(${GOLDS[1]} / ${0.55 * peak})`);
      gold.addColorStop(1, `rgb(${GOLDS[2]} / 0)`);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.beginPath();
      ctx!.moveTo(left[0].x, left[0].y);
      for (const p of left) ctx!.lineTo(p.x, p.y);
      for (let i = right.length - 1; i >= 0; i--) ctx!.lineTo(right[i].x, right[i].y);
      ctx!.closePath();
      ctx!.fillStyle = gold;
      ctx!.fill();
    }

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !fine.matches || still.matches) return;
      const target = e.target instanceof Element ? e.target : null;
      blocked = !!target?.closest("input:not([type=checkbox], [type=radio], [type=submit], [type=button]), textarea, [contenteditable]");
      if (off()) {
        if (points.length) wipe();
        return;
      }
      points.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (points.length > MAX) points.shift();
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      wipe();
      size();
    };

    size();
    addEventListener("resize", size);
    addEventListener("pointermove", move, { passive: true, capture: true });
    still.addEventListener("change", stop);
    fine.addEventListener("change", stop);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", size);
      removeEventListener("pointermove", move, true);
      still.removeEventListener("change", stop);
      fine.removeEventListener("change", stop);
    };
  }, []);

  return <canvas ref={ref} className="trail" aria-hidden="true" />;
}

/** The positions as a smooth curve (Catmull-Rom, four steps between each two). */
function smooth(points: Point[]) {
  const out: Point[] = [];
  const at = (i: number) => points[Math.max(0, Math.min(points.length - 1, i))];
  for (let i = 0; i < points.length - 1; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    for (let k = 0; k < 4; k++) {
      const t = k / 4;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (3 * b - a - 3 * c + d) * t3);
      out.push({ x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y), t: 0 });
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

/** The curve's last `most` px, up to its head (its end). */
function trim(line: Point[], most: number) {
  let run = 0;
  for (let i = line.length - 1; i > 0; i--) {
    const a = line[i];
    const b = line[i - 1];
    const step = Math.hypot(a.x - b.x, a.y - b.y);
    if (run + step >= most) {
      const k = (most - run) / step;
      return [{ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, t: 0 }, ...line.slice(i)];
    }
    run += step;
  }
  return line;
}
