"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/wordmark";

/**
 * The home page's sections (components/kozmoz/), root-relative so they work
 * from the inner pages too. Labels stay V3's; the ids are the new page's.
 */
const LINKS = [
  { href: "/#do", label: "What we do" },
  { href: "/#work", label: "Work" },
  { href: "/#us", label: "About" },
];

/**
 * Where on screen the nav samples what's behind it: the middle of its own bar.
 *
 * The seam is now instant, so the bar goes from fully-over-espresso to
 * fully-over-cream in the 64px of scroll it takes the edge to cross the bar.
 * Sampling at the midpoint splits that mismatch evenly instead of leaving the
 * bar wrong for the whole crossing — flip at the bar's bottom edge and it is
 * cream-on-espresso for 64px; flip at the top edge and it is dark-on-cream for
 * the same distance.
 */
const NAV_LINE = 32;

/**
 * The nav has to survive three backgrounds: the dark hero, the cream middle,
 * and the dark contact section.
 *
 * `settled` handles the hero — transparent at the top, solid once you scroll.
 * `overLight` handles the cream middle and swaps the whole bar to its light
 * treatment.
 *
 * The swap fires exactly on the seam. The gradient bands that used to sit at
 * each edge needed a lead-in — the bar had to change before it reached the
 * cream, because it was already over pale gradient — but with a hard edge the
 * seam and the colour change are the same line, so any lead-in would fire the
 * swap early over the wrong background.
 *
 * "Start a project" goes to the home page's contact section by default. A page
 * that closes on that same section — the case studies — passes "#contact" so
 * the button scrolls to its own form instead of leaving the page.
 */

export function Nav({ contactHref = "/#contact" }: { contactHref?: string }) {
  const [settled, setSettled] = useState(false);
  const [overLight, setOverLight] = useState(false);

  useEffect(() => {
    const zone = document.querySelector<HTMLElement>("[data-light-zone]");
    let frame = 0;

    const measure = () => {
      frame = 0;
      setSettled(window.scrollY > 40);

      if (!zone) return;
      const r = zone.getBoundingClientRect();
      setOverLight(r.top <= NAV_LINE && r.bottom >= NAV_LINE);
    };

    // Scroll fires far more often than the browser paints; coalesce to one
    // measurement per frame so this never becomes the reason scrolling stutters.
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        overLight
          ? "border-b border-cream-line bg-cream/85 backdrop-blur-md"
          : settled
          ? "border-b border-line/70 bg-bg/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-wrap items-center justify-between gap-6 px-6"
      >
        {/* The OMORA wordmark — the one place Cormorant Garamond is used.
            No trailing dot: the letterspacing is what makes it read as a mark. */}
        <a
          href="/"
          className={cn(
            "text-xl transition-colors duration-300",
            overLight ? "text-cream-ink hover:text-blue-ink" : "text-ink hover:text-violet"
          )}
        >
          <Wordmark />
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={cn(
                  "font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-300",
                  overLight
                    ? "text-cream-ink/75 hover:text-blue-ink"
                    : "text-muted hover:text-ink"
                )}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href={contactHref}
          className={cn(
            "rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-300",
            overLight
              ? "border-violet-line text-violet-ink hover:bg-violet-ink hover:text-cream"
              : "border-violet-deep text-violet hover:bg-violet hover:text-bg"
          )}
        >
          Start a project
        </a>
      </nav>
    </header>
  );
}
