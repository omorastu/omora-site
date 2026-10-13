import Link from "next/link";
import type { Service } from "@/lib/content";
import { projectsForService } from "@/lib/projects";
import { Reveal } from "@/components/motion";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { Closing } from "@/components/site/closing";
import { SectionHead } from "@/components/site/section-head";
import { ProofGrid } from "@/components/site/proof";
import { ServiceMock } from "@/components/site/service-mock";
import { ServiceCta } from "@/components/site/service-cta";
import { TestimonialBlock } from "@/components/site/testimonial";
import { testimonialsForService } from "@/lib/testimonials";
import { servicePriceNote } from "@/lib/pricing";

/**
 * The template every service page renders through.
 *
 * All four services are peers — there is no main-offer variant and no branch on
 * which service this is. The only conditional is whether there's delivered work
 * tagged to the slug: if there is, the page shows a proof strip; if there isn't,
 * it shows the product mock instead, which demonstrates the thing without
 * implying clients we don't have.
 *
 * Structure mirrors the home page — dark hero, cream middle, dark close — using
 * the same seam rule, SectionHead, Reveal and Closing.
 */
export function ServicePage({ service }: { service: Service }) {
  const proof = projectsForService(service.slug);
  const quotes = testimonialsForService(service.slug);
  // Absent for the two services whose numbers aren't settled — those pages
  // render no price line rather than a guess. See lib/pricing.ts.
  const priceNote = servicePriceNote[service.slug];

  return (
    <>
      <Nav />
      <main id="main" className="relative">
        {/* ── Hero (dark) ─────────────────────────────────────────────── */}
        <section className="layer px-6 pb-[120px] pt-40 sm:pt-48">
          <div className="mx-auto max-w-wrap">
            <Reveal>
              <Link
                href="/services"
                className="plate inline-flex items-center gap-2 transition-colors hover:text-violet"
              >
                <span aria-hidden="true">←</span> All services
              </Link>
              <h1 className="mt-5 max-w-[16ch] font-display text-[clamp(2.4rem,6vw,4.5rem)] font-bold leading-[0.98] tracking-tightest text-ink">
                {service.name}
              </h1>
              <p className="mt-6 max-w-prose text-pretty text-xl leading-relaxed text-violet sm:text-2xl">
                {service.tagline}
              </p>
              <p className="mt-5 max-w-prose text-pretty text-lg leading-relaxed text-muted">
                {service.intro}
              </p>
              <ServiceCta service={service} />

              {priceNote && (
                <p className="mt-5 text-sm leading-relaxed text-muted">
                  {priceNote}{" "}
                  <Link
                    href="/pricing"
                    className="text-violet underline-offset-4 transition-colors hover:text-ink hover:underline"
                  >
                    See pricing &rarr;
                  </Link>
                </p>
              )}
            </Reveal>
          </div>
        </section>

        {/* ── Cream middle ────────────────────────────────────────────── */}
        <div
          data-light-zone
          className="border-t border-[rgba(123,92,176,0.35)] bg-cream"
        >
          <section className="layer px-6 pb-24 pt-[100px] sm:pb-32">
            <div className="mx-auto max-w-wrap">
              <SectionHead plate="What's included" title="What a build covers." />
              <ul className="grid gap-x-6 gap-y-px sm:grid-cols-2">
                {service.includes.map((inc, i) => (
                  <Reveal as="li" key={inc} delay={i * 60}>
                    <div className="flex items-start gap-3 border-b border-cream-line py-4">
                      <svg
                        viewBox="0 0 12 12"
                        className="mt-1 h-3 w-3 shrink-0 text-violet-ink"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M2.5 6.2 4.8 8.5 9.5 3.8"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-pretty leading-relaxed text-cream-ink">{inc}</span>
                    </div>
                  </Reveal>
                ))}
              </ul>
            </div>
          </section>

          {/*
            Proof when there is any, the product mock when there isn't.
            Deliberately a length check on real data rather than a per-service
            flag — the moment a project is tagged with this slug, the strip
            appears on its own and the mock steps aside.
          */}
          {proof.length > 0 ? (
            <section className="layer px-6 pb-[100px] sm:pb-32">
              <div className="mx-auto max-w-wrap">
                <SectionHead
                  plate="Proof"
                  title="What's shipped, and what's in the shop."
                  intro={`Work this is built on — live for the client, or on the bench now.`}
                />
                <ProofGrid items={proof} />
              </div>
            </section>
          ) : (
            <section className="layer px-6 pb-[100px] sm:pb-32">
              <div className="mx-auto max-w-wrap">
                <SectionHead
                  plate="What it looks like"
                  title="The thing itself."
                  intro="No client work to show on this one yet, so here's the product rather than a case study we don't have."
                />
                <ServiceMock service={service} />
              </div>
            </section>
          )}

          {/* Any quote tagged with this slug. Nothing renders when there's
              none — no placeholder, no borrowed praise from another service. */}
          {quotes.length > 0 && (
            <section className="layer px-6 pb-[100px]">
              <div className="mx-auto max-w-wrap">
                <div className="rule-light mb-14 max-w-[8rem]" />
                <TestimonialBlock item={quotes[0]} />
              </div>
            </section>
          )}
        </div>

        {/* ── Close (dark) ────────────────────────────────────────────── */}
        <Closing />
      </main>
      <Footer />

      <div className="grain" aria-hidden="true" />
    </>
  );
}
