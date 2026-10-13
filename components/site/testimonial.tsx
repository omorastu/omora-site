import type { Testimonial } from "@/lib/testimonials";
import { Reveal } from "@/components/motion";

/**
 * A single quote, set large on the cream surface.
 *
 * One treatment, used on both the home page and the service pages, so a quote
 * reads the same wherever it appears. Never a carousel — one quote you actually
 * read beats four you scroll past.
 */
export function TestimonialBlock({ item }: { item: Testimonial }) {
  return (
    <Reveal>
      <figure className="mx-auto max-w-4xl text-center">
        {/* Oversized quote mark as a mark, not a character to be read. */}
        <span
          aria-hidden="true"
          className="block font-display text-6xl leading-none text-violet-line/45"
        >
          &ldquo;
        </span>

        <blockquote className="mt-2">
          <p className="text-pretty font-display text-[clamp(1.5rem,3.4vw,2.5rem)] font-semibold leading-[1.2] tracking-tight text-cream-ink">
            {item.quote}
          </p>
        </blockquote>

        <figcaption className="mt-7 flex flex-col items-center gap-2">
          <span className="h-px w-10 bg-violet-line" aria-hidden="true" />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-violet-ink">
            {item.name ? `${item.name} · ${item.business}` : item.business}
          </span>
        </figcaption>
      </figure>
    </Reveal>
  );
}

/**
 * The home page slot — its own cream section between Recent Work and How We
 * Work. Renders nothing when there's no testimonial to show.
 */
export function HomeTestimonial({ item }: { item?: Testimonial }) {
  if (!item) return null;

  return (
    <section className="layer px-6 pb-24 pt-4 sm:pb-32">
      <div className="mx-auto max-w-wrap">
        <div className="rule-light mb-16 max-w-[8rem]" />
        <TestimonialBlock item={item} />
      </div>
    </section>
  );
}
