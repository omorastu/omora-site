"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { isLive, resultLine, type Project } from "@/lib/projects";
import { services } from "@/lib/content";
import { testimonialsForService } from "@/lib/testimonials";
import { Reveal } from "@/components/motion";
import { TestimonialBlock } from "@/components/site/testimonial";

/**
 * The portfolio grid with its filter row.
 *
 * Filtering is client-side and doesn't touch the URL — this is one page with a
 * view toggle, not six routes. "All" is the default.
 *
 * Filters are derived from the service list plus one synthetic bucket, so
 * adding a service adds its filter automatically. "Custom" catches projects
 * carrying no service tag at all: the builds that don't map to anything we sell
 * as a named service, which would otherwise be unreachable from any filter.
 *
 * A filter that matches nothing is dropped rather than rendered as a dead
 * button with a 0 next to it. That is a count check on live data, not a
 * hard-coded exclusion list — tag one project with a missing slug and its
 * filter comes back on its own.
 */

const CUSTOM = "__custom";
const ALL = "__all";

export function WorkGrid({ items }: { items: Project[] }) {
  const [active, setActive] = useState<string>(ALL);

  const filters = useMemo(
    () =>
      [
        { id: ALL, label: "All", count: items.length },
        ...services.map((s) => ({
          id: s.slug,
          label: s.name,
          count: items.filter((p) => p.services.includes(s.slug)).length,
        })),
        {
          id: CUSTOM,
          label: "Custom",
          count: items.filter((p) => p.services.length === 0).length,
        },
      ].filter((f) => f.count > 0),
    [items]
  );

  const shown = useMemo(() => {
    if (active === ALL) return items;
    if (active === CUSTOM) return items.filter((p) => p.services.length === 0);
    return items.filter((p) => p.services.includes(active));
  }, [items, active]);

  // The quote tagged to whichever service is filtered on. "All" and "Custom"
  // are not services, so they get none — a quote about the AI receptionist
  // sitting under an unfiltered grid of sixteen projects proves nothing in
  // particular.
  const quote = useMemo(() => {
    if (active === ALL || active === CUSTOM) return undefined;
    return testimonialsForService(active)[0];
  }, [active]);

  return (
    <>
      <Reveal>
        <div
          role="group"
          aria-label="Filter work by service"
          className="flex flex-wrap gap-2"
        >
          {filters.map((f) => {
            const on = active === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setActive(f.id)}
                aria-pressed={on}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-colors duration-300",
                  on
                    ? "border-violet-ink bg-violet-ink text-cream"
                    : "border-cream-line text-cream-muted hover:border-violet-line hover:text-cream-ink"
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "ml-2 font-mono text-[10px] tabular-nums",
                    on ? "text-cream/70" : "text-cream-muted/70"
                  )}
                >
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* With zero-count filters hidden, the empty state is only reachable when
          the dataset itself is empty. Kept so that case renders something. */}
      {shown.length > 0 ? (
        <ul className="mt-10 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p, i) => (
            // Keyed by filter as well as name so cards re-run their entrance
            // when the list changes, instead of swapping content in place.
            <WorkCard key={`${active}-${p.name}`} item={p} index={i} />
          ))}
        </ul>
      ) : (
        <Reveal className="mt-10">
          <div className="rounded-xl border border-dashed border-cream-line px-6 py-14 text-center">
            <p className="font-display text-xl font-semibold text-cream-ink">
              Nothing shipped here yet.
            </p>
            <p className="mx-auto mt-2 max-w-prose text-pretty text-sm leading-relaxed text-cream-muted">
              It&rsquo;s a service we build, just not one with delivered work we
              can point at. The service page shows the product itself instead.
            </p>
          </div>
        </Reveal>
      )}

      {/* The quote for this filter, in the service-page treatment: a short
          rule, then the block. Nothing renders when the active filter has no
          testimonial tagged to it. */}
      {quote && (
        <div key={active} className="mt-20">
          <div className="rule-light mb-14 max-w-[8rem]" />
          <TestimonialBlock item={quote} />
        </div>
      )}
    </>
  );
}

function WorkCard({ item, index }: { item: Project; index: number }) {
  const live = isLive(item);
  const line = resultLine(item);

  return (
    <Reveal as="li" delay={Math.min(index, 8) * 60} className="h-full">
      <article
        className={cn(
          "flex h-full flex-col rounded-xl bg-cream-raised p-5",
          live
            ? "border border-cream-line"
            : "border border-dashed border-blue-ink/40"
        )}
      >
        {/* The category is what a finished build is; "In progress" is the more
            useful thing to know about one that isn't, so it takes the slot. */}
        {live ? (
          <p className="plate-light">{item.category}</p>
        ) : (
          <p className="plate-progress">In progress</p>
        )}

        <h3 className="mt-2 font-display text-lg font-semibold tracking-tight text-cream-ink">
          {item.name}
        </h3>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-cream-muted">
          {item.detail}
        </p>

        {/* Outcome or intent, depending on status. Not every project has one. */}
        {line && (
          <p
            className={cn(
              "mt-auto border-l-2 pl-3 pt-4 text-pretty text-sm leading-relaxed text-cream-ink",
              live ? "border-violet-line" : "border-blue-ink/40"
            )}
          >
            {line}
          </p>
        )}

        {/* No outbound link while it's in progress, even where a URL exists —
            the thing behind it isn't ready to be judged yet. */}
        {live && item.href && (
          <a
            href={item.href}
            target="_blank"
            rel="noreferrer noopener"
            className="group mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-blue-ink transition-colors hover:text-violet-ink"
          >
            Visit site
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
              <path
                d="M3 9 9 3m0 0H4.5M9 3v4.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        )}
      </article>
    </Reveal>
  );
}
