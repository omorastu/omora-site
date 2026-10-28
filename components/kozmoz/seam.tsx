"use client";

import { useEffect, useRef } from "react";

/**
 * The seam down the middle of the page, desktop only. It draws as the page
 * scrolls (kozmoz.css); this sets where it starts, so at the top of the page
 * its drawn tip sits about three quarters of the way down the screen. Sits
 * first inside <main>, which it runs the length of.
 */
export function Seam() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const seam = ref.current;
    const main = seam?.parentElement;
    if (!seam || !main) return;

    const seamStart = () => {
      const top = main.getBoundingClientRect().top + scrollY;
      const from = (innerHeight * 0.74 - top) / main.offsetHeight;
      seam.style.setProperty("--seam-from", Math.max(0.02, Math.min(1, from)).toFixed(4));
    };

    seamStart();
    const ro = "ResizeObserver" in window ? new ResizeObserver(seamStart) : null;
    ro?.observe(main);
    addEventListener("resize", seamStart);
    return () => {
      ro?.disconnect();
      removeEventListener("resize", seamStart);
    };
  }, []);

  return <div ref={ref} className="seam" aria-hidden="true" />;
}
