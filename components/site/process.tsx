import { steps } from "@/lib/content";
import { Reveal } from "@/components/motion";
import { SectionHead } from "@/components/site/section-head";

/**
 * How we work.
 *
 * Numbered because this is a genuine sequence — you can't build before you know
 * the problem, or launch before it's built. The connecting track carries a blue
 * pulse: the one place in this section where anything is "live".
 */
export function Process() {
  return (
    <section id="how" className="layer px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-wrap">
        <SectionHead
          plate="How we work"
          title="Three steps. No mystery."
        />

        <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
          {/* Track connecting the three steps, desktop only. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[1.15rem] hidden h-px md:block"
          >
            {/* Violet-line connector (spec calls this out separately from the
                cream-line section rules). Fades at both ends so it doesn't
                collide with the first and last step circles. */}
            <div
              className="h-px w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #7B5CB0 12%, #7B5CB0 88%, transparent)",
              }}
            />
            <div className="absolute inset-0 overflow-hidden">
              <div className="h-px w-1/3 bg-gradient-to-r from-transparent via-violet-line to-transparent animate-blue-sweep motion-reduce:hidden" />
            </div>
          </div>

          {steps.map((step, i) => (
            <Reveal as="li" key={step.n} delay={i * 120} className="relative">
              <div className="flex items-center gap-4 md:block">
                <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-violet-line bg-cream font-mono text-xs text-violet-ink">
                  {step.n}
                </span>
                <h3 className="font-display text-xl font-semibold tracking-tight text-cream-ink md:mt-6">
                  {step.title}
                </h3>
              </div>
              <p className="mt-3 max-w-prose text-pretty leading-relaxed text-cream-muted md:pr-6">
                {step.body}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
