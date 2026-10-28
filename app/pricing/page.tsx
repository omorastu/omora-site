import type { Metadata } from "next";
import { tiers, terms } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { Closing } from "@/components/site/closing";

export const metadata: Metadata = {
  title: "Pricing — Kozmoz",
  description:
    "Real ranges, not “contact us for pricing.” Landing pages from $497, websites from $3,000, systems from $5,000.",
};

/**
 * /pricing — four packages, the terms, and where AI fits.
 *
 * Ported from V1. Two sections of that page did not come across: the
 * three-step process, which the home page already covers under "Three steps.
 * No mystery.", and the link into V1's service breakdown, whose Operator Stack
 * hierarchy was removed on purpose in v2.
 *
 * Structure follows /work and /team — dark hero, cream body, dark close — with
 * the `data-light-zone` marker the nav watches to flip to its light treatment.
 */
export default function Pricing() {
  return (
    <>
      <Nav />
      <main id="main" className="relative">
        <section className="layer px-6 pb-[120px] pt-40 sm:pt-48">
          <div className="mx-auto max-w-wrap">
            <p className="plate">Pricing</p>
            <h1 className="mt-4 max-w-[18ch] font-display text-[clamp(2.4rem,6vw,4.5rem)] font-bold leading-[0.98] tracking-tightest text-ink">
              Built for your business.
            </h1>
            <p className="mt-6 max-w-prose text-pretty text-lg leading-relaxed text-muted">
              Real ranges, not &ldquo;contact us for pricing.&rdquo; Your first
              message gets an exact number within 24 hours.
            </p>
          </div>
        </section>

        <div
          data-light-zone
          className="border-t border-[rgba(123,92,176,0.35)] bg-cream"
        >
          {/* ── Packages ─────────────────────────────────────────────────
              No header block: the hero has already said what this page is, and
              a second heading between it and the cards is only a restatement. */}
          <section className="layer px-6 pb-[100px] pt-[100px] sm:pb-32">
            <div className="mx-auto max-w-wrap">
              <p className="plate-light">Packages</p>

              {/* pt-4 leaves room for the badge that hangs off the popular card. */}
              <ul className="mt-8 grid items-stretch gap-5 pt-4 sm:grid-cols-2 lg:grid-cols-4">
                {tiers.map((t, i) => (
                  <Reveal as="li" key={t.name} delay={i * 80} className="h-full">
                    <div
                      className={cn(
                        "relative flex h-full flex-col rounded-xl border bg-cream-raised p-6",
                        t.popular
                          ? "border-violet-line shadow-[0_18px_50px_-28px_rgba(123,92,176,0.65)]"
                          : "border-cream-line"
                      )}
                    >
                      {t.popular && (
                        <span className="absolute -top-3 left-6 rounded-full bg-violet-ink px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-cream">
                          Most popular
                        </span>
                      )}

                      <p className="plate-light">{t.name}</p>
                      <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-cream-ink">
                        {t.price}
                      </p>
                      <p className="mt-1.5 text-pretty text-sm leading-relaxed text-cream-muted">
                        {t.tagline}
                      </p>

                      <ul className="mt-auto space-y-2.5 border-t border-cream-line pt-5 text-sm leading-relaxed text-cream-muted">
                        {t.features.map((f) => (
                          <li key={f} className="flex items-start gap-2.5">
                            <span
                              aria-hidden="true"
                              className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-violet-line"
                            />
                            <span className="text-pretty">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                ))}
              </ul>

              {/* ── Terms ─────────────────────────────────────────────── */}
              <Reveal className="mt-14">
                <dl className="grid gap-8 border-t border-cream-line pt-10 text-sm leading-relaxed text-cream-muted sm:grid-cols-3">
                  {terms.map((t) => (
                    <div key={t.label}>
                      <dt className="plate-light">{t.label}</dt>
                      <dd className="mt-2 text-pretty">{t.body}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </section>

          {/* ── Where AI fits ────────────────────────────────────────────
              Carried over from V1 word for word. It is the plainest thing the
              site says about how the work gets made, and rewriting it to sound
              better would cost it exactly the credibility it has. */}
          <section className="layer px-6 pb-[100px]">
            <div className="mx-auto max-w-wrap">
              <Reveal>
                <div className="rule-light mb-12 max-w-[8rem]" />
                <div className="max-w-2xl">
                  <h2 className="font-display text-2xl font-semibold leading-[1.15] tracking-tight text-cream-ink sm:text-3xl">
                    Where AI actually fits in.
                  </h2>
                  <p className="mt-4 text-pretty leading-relaxed text-cream-muted">
                    We use AI to move faster on research, drafts, and first
                    passes — the same way any modern studio does. But every
                    project on this site was reviewed, built, and shipped into
                    production by a person on our team, not generated and handed
                    over. If we ever show a concept demo instead of live client
                    work, we&rsquo;ll label it as one, clearly, every time.
                  </p>
                </div>
              </Reveal>
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
