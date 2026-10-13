import { testimonials, type Testimonial } from "@/lib/testimonials";
import { sections, CAPACITY } from "@/lib/home";
import { Reveal } from "@/components/motion";
import { SectionHead } from "@/components/site/section-head";
import { HomeSection } from "@/components/home/section";

/**
 * Six quotes, set small and side by side. The service pages set one quote
 * large (TestimonialBlock); here the argument is the count — six named people
 * whose businesses you can look up — so each one is short and the grid does
 * the talking.
 *
 * Laid out for six. The dataset is padded to that with marked open slots so
 * the section can be reviewed at its intended weight and the gap is counted,
 * not hidden.
 */

function Quote({ item, index }: { item: Testimonial; index: number }) {
  return (
    <Reveal as="li" delay={index * 80}>
      <figure className="border-l-2 border-violet-deep py-1.5 pl-6">
        <blockquote>
          <p className="text-pretty leading-relaxed text-ink">{item.quote}</p>
        </blockquote>
        <figcaption className="mt-4 text-sm text-muted">
          {item.name ? `${item.name}, ${item.business}` : item.business}
        </figcaption>
      </figure>
    </Reveal>
  );
}

/**
 * An open slot. Prints who it's waiting on (from `sections.quotes.briefs`)
 * so the three blanks read as three specific asks.
 */
function OpenQuote({ brief, index }: { brief?: string; index: number }) {
  return (
    <Reveal as="li" delay={index * 80}>
      <div
        className="border-l-2 border-dashed border-violet/40 py-1.5 pl-6"
        aria-label="Testimonial to come"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-violet/70">Quote</p>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted/60">
          {brief ??
            "Two lines of plain speech about the one thing that changed after we shipped."}
        </p>
        <p className="mt-4 text-sm text-muted/40">Client name, category</p>
      </div>
    </Reveal>
  );
}

export function HomeTestimonials() {
  const shown = testimonials.slice(0, CAPACITY.quotes);
  const open = Math.max(0, CAPACITY.quotes - shown.length);

  return (
    <HomeSection id="quotes">
      <SectionHead
        tone="dark"
        plate="Testimonials"
        title={sections.quotes.title}
        intro={sections.quotes.lede}
      />

      <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((t, i) => (
          <Quote key={`${t.business}-${i}`} item={t} index={i} />
        ))}
        {Array.from({ length: open }).map((_, i) => (
          <OpenQuote
            key={`open-${i}`}
            brief={sections.quotes.briefs[i]}
            index={shown.length + i}
          />
        ))}
      </ul>
    </HomeSection>
  );
}
