"use client";

import { useEffect, useRef } from "react";

/**
 * The seam down the middle, desktop only. It draws as the page scrolls
 * (kozmoz.css), its tip kept about three quarters of the way down the screen
 * until it reaches the bottom of what it runs the length of, the home page's
 * hero. It sits first inside that element; this sets where the drawing
 * starts (--seam-from, a share of its length) and the scroll at which it's
 * done (--seam-end).
 */
export function Seam() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const seam = ref.current;
    const box = seam?.parentElement;
    if (!seam || !box) return;

    const place = () => {
      const top = box.getBoundingClientRect().top + scrollY;
      const tip = innerHeight * 0.74;
      const from = (tip - top) / box.offsetHeight;
      const end = Math.min(top + box.offsetHeight - tip, document.documentElement.scrollHeight - innerHeight);
      seam.style.setProperty("--seam-from", Math.max(0.02, Math.min(1, from)).toFixed(4));
      seam.style.setProperty("--seam-end", `${Math.max(1, Math.round(end))}px`);
    };

    place();
    const ro = "ResizeObserver" in window ? new ResizeObserver(place) : null;
    ro?.observe(box);
    ro?.observe(document.documentElement);
    addEventListener("resize", place);
    return () => {
      ro?.disconnect();
      removeEventListener("resize", place);
    };
  }, []);

  return <div ref={ref} className="seam" aria-hidden="true" />;
}
