import { tiers } from "@/lib/pricing";
import { sections } from "@/lib/home";
import { Reveal } from "@/components/motion";
import { SectionHead } from "@/components/site/section-head";
import { HomeSection, Hairlines } from "@/components/home/section";

/**
 * The four packages in one hairline band. Same `tiers` as /pricing, compressed:
 * name, price, tagline, and the feature list in a single mono line rather than
 * bullets. The full breakdown and the terms are one click away.
 *
 * No "most popular" badge here on purpose — in a band this tight the four
 * should read as a ladder, not a recommendation.
 */
export function HomePricing() {
  return (
    <HomeSection id="pricing">
      <SectionHead
        tone="dark"
        plate="Pricing"
        title={sections.pricing.title}
        intro={sections.pricing.lede}
      />

      <Reveal>
        <Hairlines cols="sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((t) => (
            <div key={t.name} className="flex h-full flex-col bg-bg px-6 py-7 sm:px-7">
              <p className="plate">{t.name}</p>
              <p className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">
                {t.price}
              </p>
              <p className="mt-2.5 text-pretty text-sm leading-relaxed text-muted">{t.tagline}</p>
              <p className="mt-auto border-t border-line pt-4 font-mono text-[10px] leading-relaxed text-muted/80">
                {t.features.join("  ·  ")}
              </p>
            </div>
          ))}
        </Hairlines>

        <a
          href="/pricing"
          className="group mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-violet transition-colors hover:text-ink focus-visible:text-ink"
        >
          Full breakdown and terms
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </a>
      </Reveal>
    </HomeSection>
  );
}
