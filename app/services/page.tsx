import type { Metadata } from "next";
import { services } from "@/lib/content";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { Closing } from "@/components/site/closing";
import { ServiceCard } from "@/components/site/service-card";

export const metadata: Metadata = {
  title: "Services — Kozmoz",
  description:
    "AI receptionists, websites, booking systems and sales intelligence. Four things, built properly.",
};

/**
 * /services — a flat grid of four equal cards.
 *
 * No hierarchy: no main offer, no numbered secondary list, no split between a
 * headline product and the rest. The four are peers and render through the same
 * card component the home page uses, so the two rows are identical apart from
 * where a card takes you.
 *
 * A server component — ServiceCard carries its own "use client", which is what
 * lets this file export metadata.
 */
export default function ServicesIndex() {
  return (
    <>
      <Nav />
      <main id="main" className="relative">
        <section className="layer px-6 pb-[120px] pt-40 sm:pt-48">
          <div className="mx-auto max-w-wrap">
            <p className="plate">Services</p>
            <h1 className="mt-4 max-w-[18ch] font-display text-[clamp(2.4rem,6vw,4.5rem)] font-bold leading-[0.98] tracking-tightest text-ink">
              What we build.
            </h1>
            <p className="mt-6 max-w-prose text-pretty text-lg leading-relaxed text-muted">
              Each one solves a specific way a business leaks time or money. Take
              one on its own, or several — they&rsquo;re built to work together
              and sold separately.
            </p>
          </div>
        </section>

        <div
          data-light-zone
          className="border-t border-[rgba(123,92,176,0.35)] bg-cream"
        >
          <section className="layer px-6 pb-[100px] pt-[100px] sm:pb-32">
            <div className="mx-auto max-w-wrap">
              {/* No header block here on purpose: the hero has already said what
                  this page is, and a second heading between it and the cards
                  only put a restatement in the way of the four things. */}
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
            </div>
          </section>
        </div>

        <Closing />
      </main>
      <Footer />

      <div className="grain" aria-hidden="true" />
    </>
  );
}
