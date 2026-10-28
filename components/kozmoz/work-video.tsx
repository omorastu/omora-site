"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A project's muted loop, laid over its still. Nothing downloads until the
 * card is near the screen; phones get the portrait cut. It fades in only once
 * it is actually playing, so a slow connection just keeps showing the still.
 * Under reduced motion it never loads (and kozmoz.css hides it).
 */
export function WorkVideo({ desktop, mobile }: { desktop: string; mobile: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (
      !v ||
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const small = window.matchMedia("(max-width: 1023px)");

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const want = small.matches ? mobile : desktop;
          if (v.dataset.loaded !== want) {
            v.muted = true;
            v.src = want;
            v.dataset.loaded = want;
          }
          v.play()?.catch(() => {});
        } else if (!v.paused) {
          v.pause();
        }
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [desktop, mobile]);

  return (
    <video
      ref={ref}
      className={playing ? "is-on" : undefined}
      muted
      playsInline
      loop
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
    />
  );
}
