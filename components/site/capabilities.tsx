"use client";

import { services } from "@/lib/content";
import { Reveal } from "@/components/motion";
import { SectionHead } from "@/components/site/section-head";
import { ServiceCard } from "@/components/site/service-card";

/**
 * "What we do" — the four services on the home page.
 *
 * Cards open the service page. The prefill that used to fire here now lives on
 * that page's primary CTA, so the sequence is read-then-ask rather than
 * dropping someone straight into a form. Same component as the /services grid.
 */
export function Capabilities() {
  return (
    <section id="what-we-do" className="layer px-6 pb-24 pt-[100px] sm:pb-32">
      <div className="mx-auto max-w-wrap">
        <SectionHead
          plate="What we do"
          title="Four things, built properly."
          intro="Most of it starts the same way: something in the business is leaking time or money. These are the four fixes we ship most."
        />

        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {services.map((item, i) => (
            <ServiceCard
              key={item.slug}
              item={item}
              index={i}
              href={`/services/${item.slug}`}
            />
          ))}
        </ul>

        <Reveal className="mt-10">
          <p className="text-sm text-cream-muted">
            Need something that isn&rsquo;t on this list?{" "}
            {/* Custom builds live on /work — the three biggest ones (Cubicship,
                Quanta, Paper Trader) map to none of the four services, so the
                portfolio is where they stay visible. */}
            <a
              href="/work"
              className="text-violet-ink underline decoration-violet-line underline-offset-4 transition-colors hover:text-blue-ink focus-visible:text-blue-ink"
            >
              That&rsquo;s usually the interesting work.
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
