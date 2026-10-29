"use client";

import { useEffect, useRef } from "react";

/**
 * The gold behind the page: soft fields of champagne, honey and bronze that
 * drift on slow cycles (30–60s) under a fine grain, with the paper panel
 * (components/kozmoz/panel.tsx) floating over them.
 *
 * kozmoz.css paints it still (.art: the same fields at rest, and the grain),
 * which is all there is without scripting or under reduced motion. Otherwise
 * this draws the moving fields on a canvas a quarter of the screen's size,
 * stretched to fill it: they're soft enough that the stretch never shows, so
 * a frame costs a few gradient fills and the compositor does the rest. As the
 * page scrolls the fields slide up a little, slower than the page, so the
 * panel reads as lifted off them. Nothing runs while the tab is hidden.
 */

/** Canvas px per screen px. */
const SCALE = 1 / 4;

/**
 * Each field: its colour (a custom property on .art), size (a share of the
 * screen's diagonal), strength, and path: a resting point (shares of the
 * screen), how far it wanders from it, and over how many seconds.
 */
const FIELDS = [
  { color: "--art-champagne", r: 0.55, a: 0.95, at: [0.18, 0.12], wander: [0.16, 0.1], period: [47, 38], phase: 0 },
  { color: "--art-honey", r: 0.5, a: 0.85, at: [0.78, 0.3], wander: [0.14, 0.16], period: [53, 41], phase: 1.7 },
  { color: "--art-bronze", r: 0.62, a: 0.7, at: [0.82, 0.95], wander: [0.18, 0.08], period: [59, 44], phase: 3.1 },
  { color: "--art-bronze", r: 0.42, a: 0.45, at: [0.08, 0.86], wander: [0.1, 0.12], period: [37, 51], phase: 4.4 },
  { color: "--art-champagne", r: 0.32, a: 0.6, at: [0.5, 0.55], wander: [0.22, 0.14], period: [31, 57], phase: 2.3 },
] as const;

/** How far the fields slide up over the page's whole scroll, as a share of the screen's height. */
const DRIFT_ON_SCROLL = 0.14;

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
      ctx.fillStyle = css.getPropertyValue(name).trim() || "#c9a35a";
      const hex = String(ctx.fillStyle);
      return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(",");
    };
    const ground = css.getPropertyValue("--art-ground").trim() || "#d6ad62";
    const fields = FIELDS.map((f) => ({ ...f, rgb: rgb(f.color) }));

    let W = 0;
    let H = 0;
    const size = () => {
      W = Math.max(8, Math.ceil(innerWidth * SCALE));
      H = Math.max(8, Math.ceil(innerHeight * SCALE));
      cv.width = W;
      cv.height = H;
    };

    let raf = 0;
    const draw = (now: number) => {
      const t = now / 1000;
      const room = document.documentElement.scrollHeight - innerHeight;
      const lift = room > 0 ? (Math.min(scrollY, room) / room) * DRIFT_ON_SCROLL * H : 0;
      const diag = Math.hypot(W, H);
      ctx.fillStyle = ground;
      ctx.fillRect(0, 0, W, H);
      for (const f of fields) {
        const x = (f.at[0] + f.wander[0] * Math.sin((t / f.period[0]) * 2 * Math.PI + f.phase)) * W;
        const y = (f.at[1] + f.wander[1] * Math.cos((t / f.period[1]) * 2 * Math.PI + f.phase)) * H - lift;
        const r = f.r * diag;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${f.rgb},${f.a})`);
        g.addColorStop(0.45, `rgba(${f.rgb},${f.a * 0.55})`);
        g.addColorStop(1, `rgba(${f.rgb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }
      raf = requestAnimationFrame(draw);
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
