"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Service } from "@/lib/content";
import { previewFor } from "@/components/previews";
import { useInView } from "@/components/motion";

/**
 * One service card, on the cream surface.
 *
 * Shared by the home page's "What we do" row and the /services index, so the
 * two can't drift — same preview, same featured treatment, same proportions.
 * Both now point at the service page; `href` stays a prop so a future surface
 * can send them somewhere else.
 */
export function ServiceCard({
  item,
  index,
  href,
}: {
  item: Service;
  index: number;
  href: string;
}) {
  const { ref, inView } = useInView<HTMLLIElement>({ threshold: 0.35 });
  const [hot, setHot] = useState(false);
  // Both of these are data: which animation to draw, and whether this card
  // carries the resting violet-line border. Neither is keyed off a specific id.
  const Preview = previewFor(item.previewId);
  const featured = item.featured === true;

  return (
    <li
      ref={ref}
      className="transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none"
      style={{
        transitionDelay: inView ? `${index * 90}ms` : "0ms",
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(24px)",
      }}
    >
      <a
        href={href}
        onMouseEnter={() => setHot(true)}
        onMouseLeave={() => setHot(false)}
        onFocus={() => setHot(true)}
        onBlur={() => setHot(false)}
        className={cn(
          "group relative flex h-full flex-col rounded-xl border bg-cream-raised p-5",
          "transition-[transform,border-color,box-shadow] duration-400 ease-out",
          "hover:-translate-y-1.5 hover:border-violet-line focus-visible:-translate-y-1.5 focus-visible:border-violet-line",
          // Drop shadows rather than glows: a glow reads as haze on cream.
          "hover:shadow-[0_8px_28px_rgba(123,92,176,0.18)] focus-visible:shadow-[0_8px_28px_rgba(123,92,176,0.18)]",
          "motion-reduce:hover:translate-y-0 motion-reduce:focus-visible:translate-y-0",
          featured
            ? "border-violet-line shadow-[0_4px_20px_rgba(123,92,176,0.18)]"
            : "border-cream-line"
        )}
      >
        {/* Violet edge-line that brightens with the card. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-line to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-90 group-focus-visible:opacity-90"
        />

        {/* min-height rather than a fixed height: at narrow widths the website
            preview is taller than 7.5rem and would otherwise spill over the
            label beneath it. */}
        <div className="flex min-h-[7.5rem] w-full items-center">
          <Preview active={inView} hot={hot} />
        </div>

        <p className="plate-light mt-5">{item.label}</p>
        <h3 className="mt-2 font-display text-xl font-semibold leading-tight tracking-tight text-cream-ink">
          {item.title}
        </h3>
        <p className="mt-2.5 text-pretty text-sm leading-relaxed text-cream-muted">
          {item.body}
        </p>

        {/* mt-auto keeps this pinned to the bottom edge so the rule lines up
            across all four cards regardless of body length. */}
        <p className="mt-auto pt-4 font-mono text-[10px] leading-relaxed text-cream-muted [border-top:1px_solid_theme(colors.cream-line)]">
          {item.points.join("  ·  ")}
        </p>
      </a>
    </li>
  );
}
