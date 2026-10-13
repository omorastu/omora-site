import { BackgroundBeams } from "@/components/ui/background-beams";
import { Reveal } from "@/components/motion";
import { LeadForm } from "@/components/site/lead-form";

/**
 * Closing CTA — bookends the hero with the second animated background.
 *
 * The work order lives here rather than on a separate contact page: every CTA
 * on the page points at #ticket, and this is where it lands.
 */
export function Closing() {
  return (
    <section
      id="ticket"
      className="relative w-full overflow-hidden border-t border-[rgba(123,92,176,0.35)] px-6 pb-24 pt-[120px] sm:pb-32"
    >
      <BackgroundBeams />
      {/* Light enough to keep the beams readable — they're the bookend to the
          hero — but enough to stop them running under the body copy. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(13,9,8,0.1),rgba(13,9,8,0.72))]"
      />

      <div className="layer mx-auto grid max-w-wrap gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:gap-16">
        {/* Not sticky: this section needs overflow-hidden to clip the beams,
            and an overflow-hidden ancestor stops position:sticky from ever
            clamping. It only ever contributed a constant 96px of dead space
            above this column. To make it genuinely sticky, move the beam
            clipping onto an inner wrapper first. */}
        <Reveal>
          <p className="plate">Start here</p>
          <h2 className="mt-4 font-display text-[clamp(2.1rem,5.5vw,3.75rem)] font-bold leading-[0.98] tracking-tightest text-ink">
            Let&rsquo;s build the thing your business is{" "}
            <span className="bg-gradient-to-br from-violet via-violet to-violet-deep bg-clip-text text-transparent">
              missing.
            </span>
          </h2>
          <p className="mt-6 max-w-prose text-pretty text-lg leading-relaxed text-muted">
            Describe the problem in a sentence. We&rsquo;ll tell you what
            we&rsquo;d build, roughly what it costs, and how long it takes —
            before you spend anything.
          </p>

          <dl className="mt-10 grid max-w-md grid-cols-2 gap-6">
            <div>
              <dt className="plate">Reply time</dt>
              <dd className="mt-1.5 font-display text-2xl font-semibold text-ink">
                &lt; 1 business day
              </dd>
            </div>
            <div>
              <dt className="plate">First conversation</dt>
              <dd className="mt-1.5 font-display text-2xl font-semibold text-ink">Free</dd>
            </div>
          </dl>
        </Reveal>

        <Reveal delay={120}>
          <LeadForm />
        </Reveal>
      </div>
    </section>
  );
}
