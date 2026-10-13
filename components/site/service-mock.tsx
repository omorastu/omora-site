"use client";

import type { Service } from "@/lib/content";
import { previewFor } from "@/components/previews";
import { useInView } from "@/components/motion";

/**
 * Shown on a service page that has no delivered work tagged to it yet.
 *
 * It renders the same UI mock as that service's home-page card, at a size where
 * you can actually read it. The point is to show the product honestly: this is
 * the thing itself, explicitly labelled as such, rather than a case study or a
 * testimonial we can't stand behind.
 *
 * The moment a project is tagged with the slug, the proof strip takes over and
 * this stops rendering — see ServicePage.
 */
export function ServiceMock({ service }: { service: Service }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });
  const Preview = previewFor(service.previewId);

  return (
    <div ref={ref} className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center">
      <div className="rounded-xl border border-cream-line bg-cream-raised p-6 shadow-[0_4px_20px_rgba(123,92,176,0.18)] sm:p-10">
        {/* Roughly twice the card size, so the detail is legible. */}
        <div className="mx-auto max-w-md scale-100 sm:scale-[1.15] sm:py-4">
          <Preview active={inView} hot={false} />
        </div>
      </div>

      <div>
        <p className="plate-light">In the product</p>
        <ul className="mt-4 space-y-3">
          {service.points.map((pt) => (
            <li key={pt} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-blue-ink"
              />
              <span className="text-pretty leading-relaxed text-cream-ink">{pt}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-prose text-pretty text-sm leading-relaxed text-cream-muted">
          This is the interface, not a case study. When we ship one we can name,
          it&rsquo;ll show up here instead.
        </p>
      </div>
    </div>
  );
}
