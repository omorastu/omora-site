"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A project's muted loop, laid over its still. Nothing downloads until the
 * card is near the screen; phones get the portrait cut, or keep the still when
 * there isn't one. It fades in only once
 * it is actually playing, so a slow connection just keeps showing the still.
 * Under reduced motion it never loads (and kozmoz.css hides it).
 */
export function WorkVideo({ desktop, mobile }: { desktop: string; mobile?: string }) {
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
    let inView = false;

    // Play the cut for the current width while the card is near the screen.
    // With no cut for this width, unload, so the still shows again — also
    // after a resize or a tablet rotated across 1024px.
    const sync = () => {
      const want = small.matches ? mobile : desktop;
      if (!want) {
        if (v.dataset.loaded) {
          v.pause();
          v.removeAttribute("src");
          v.load();
          delete v.dataset.loaded;
          setPlaying(false);
        }
        return;
      }
      if (!inView) {
        if (!v.paused) v.pause();
        return;
      }
      if (v.dataset.loaded !== want) {
        v.muted = true;
        v.src = want;
        v.dataset.loaded = want;
        setPlaying(false);
      }
      v.play()?.catch(() => {});
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(v);
    small.addEventListener("change", sync);
    return () => {
      io.disconnect();
      small.removeEventListener("change", sync);
    };
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
