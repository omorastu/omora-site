"use client";

import { useEffect, useRef } from "react";

/**
 * The white behind the page: frosted glass. A near-white ground with a few
 * very large, very soft shapes of pearl, pale silver and the faintest warm
 * grey, like light through the glass, under a barely-there grain, with the
 * paper panel (components/kozmoz/panel.tsx) floating over it.
 *
 * kozmoz.css paints it still (.art: the same shapes at rest, and the grain),
 * which is all there is without scripting or under reduced motion. Otherwise
 * this draws the shapes on a canvas a quarter of the screen's size, stretched
 * to fill it: they're soft enough that the stretch never shows. They drift on
 * cycles of a minute or more, so slowly that a fresh frame every 50ms is
 * plenty, and nothing runs while the tab is hidden.
 */

/** Canvas px per screen px. */
const SCALE = 1 / 4;

/** The shapes move less than a pixel between frames this far apart. */
const FRAME_MS = 50;

/**
 * Each shape: its colour (a custom property on .art), its size across and
 * down (shares of the screen's diagonal), strength, and path: a resting point
 * (shares of the screen), how far it wanders from it, and over how many seconds.
 */
const FIELDS = [
  { color: "--art-pearl", r: [0.62, 0.4], a: 0.95, at: [0.2, 0.16], wander: [0.08, 0.06], period: [83, 71], phase: 0 },
  { color: "--art-silver", r: [0.36, 0.62], a: 0.5, at: [0.9, 0.4], wander: [0.05, 0.1], period: [97, 67], phase: 1.7 },
  { color: "--art-warm", r: [0.56, 0.36], a: 0.45, at: [0.1, 0.86], wander: [0.09, 0.05], period: [113, 79], phase: 3.1 },
  { color: "--art-silver", r: [0.5, 0.3], a: 0.4, at: [0.76, 0.98], wander: [0.08, 0.04], period: [89, 103], phase: 4.4 },
  { color: "--art-pearl", r: [0.7, 0.22], a: 0.7, at: [0.52, 0.58], wander: [0.12, 0.08], period: [127, 61], phase: 2.3 },
] as const;

export function Art() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current;
    const art = cv?.parentElement;
    const ctx = cv?.getContext("2d", { alpha: false });
    if (!cv || !art || !ctx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // The colours are kozmoz.css's, read off .art (a canvas normalises each to #rrggbb).
    const css = getComputedStyle(art);
    const rgb = (name: string) => {
      ctx.fillStyle = css.getPropertyValue(name).trim() || "#f2f2f1";
      const hex = String(ctx.fillStyle);
      return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(",");
    };
    const ground = css.getPropertyValue("--art-ground").trim() || "#fafaf9";
    const fields = FIELDS.map((f) => ({ ...f, rgb: rgb(f.color) }));

    let W = 0;
    let H = 0;
    let last = -Infinity;
    const size = () => {
      W = Math.max(8, Math.ceil(innerWidth * SCALE));
      H = Math.max(8, Math.ceil(innerHeight * SCALE));
      cv.width = W;
      cv.height = H;
      last = -Infinity; // resizing clears the canvas: paint the next frame
    };

    const paint = (t: number) => {
      const diag = Math.hypot(W, H);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = ground;
      ctx.fillRect(0, 0, W, H);
      for (const f of fields) {
        const x = (f.at[0] + f.wander[0] * Math.sin((t / f.period[0]) * 2 * Math.PI + f.phase)) * W;
        const y = (f.at[1] + f.wander[1] * Math.cos((t / f.period[1]) * 2 * Math.PI + f.phase)) * H;
        const rx = f.r[0] * diag;
        const ry = f.r[1] * diag;
        // A unit circle, stretched into the shape's ellipse.
        ctx.setTransform(rx, 0, 0, ry, x, y);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
        g.addColorStop(0, `rgba(${f.rgb},${f.a})`);
        g.addColorStop(0.45, `rgba(${f.rgb},${f.a * 0.55})`);
        g.addColorStop(1, `rgba(${f.rgb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(-x / rx, -y / ry, W / rx, H / ry);
      }
    };

    let raf = 0;
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (now - last < FRAME_MS) return;
      last = now;
      paint(now / 1000);
    };

    size();
    raf = requestAnimationFrame((now) => {
      draw(now);
      cv.dataset.live = ""; // fades in over the still version
    });
    addEventListener("resize", size);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", size);
    };
  }, []);

  return (
    <div className="art" aria-hidden="true">
      <canvas ref={canvas} className="art-fields" />
    </div>
  );
}
