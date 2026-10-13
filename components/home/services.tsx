import { whatWeDo, type HomeService } from "@/lib/home";
import { Reveal } from "@/components/motion";
import { MediaSlot } from "@/components/home/media-slot";

/**
 * What we do: the four buckets, each a card with an image slot over the copy,
 * numbered 01–04, plus "View all services" and a chip row of the specifics
 * inside them.
 *
 * These are the home page's own four buckets (lib/home.ts), not the service
 * pages' dataset in lib/content.ts — the two are split differently. Each card
 * links to its own service page where one exists.
 */

function ServiceCard({ item, index }: { item: HomeService; index: number }) {
  return (
    <Reveal as="li" delay={index * 80} className="h-full">
      <a
        href={item.href}
        className="group flex h-full flex-col overflow-hidden rounded-[5px] border border-line bg-raised transition-colors duration-300 hover:border-violet-dim focus-visible:border-violet-dim"
      >
        <MediaSlot
          media={item.image}
          ratio="2/1"
          label={item.slotLabel}
          sizes="(max-width: 768px) 100vw, 50vw"
          flush
        />

        <div className="flex flex-1 flex-col p-7 sm:p-8">
          <p className="font-mono text-[11px] tracking-[0.18em] text-violet">
            {String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="mt-3.5 font-display text-2xl font-semibold text-ink">{item.title}</h3>
          <p className="mt-3 text-pretty leading-[1.65] text-muted">{item.body}</p>
          <p className="mt-auto pt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-violet transition-colors group-hover:text-ink">
            Learn more →
          </p>
        </div>
      </a>
    </Reveal>
  );
}

export function HomeServices() {
  return (
    <section
      id="services"
      className="layer scroll-mt-16 border-y border-line bg-band px-6 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-wrap">
        <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-7 sm:mb-14">
          <div>
            <p className="plate">{whatWeDo.eyebrow}</p>
            <h2 className="mt-5 max-w-[20ch] text-balance font-display text-3xl font-semibold leading-[1.12] tracking-[-0.025em] text-ink sm:text-[44px]">
              {whatWeDo.title}
            </h2>
          </div>
          <a
            href={whatWeDo.all.href}
            className="border-b border-violet-dim pb-1 font-mono text-xs uppercase tracking-[0.12em] text-violet transition-colors hover:text-ink"
          >
            {whatWeDo.all.label}
          </a>
        </Reveal>

        <ul className="grid gap-6 md:grid-cols-2">
          {whatWeDo.items.map((item, i) => (
            <ServiceCard key={item.title} item={item} index={i} />
          ))}
        </ul>

        <Reveal className="mt-11 flex flex-wrap items-center gap-2.5">
          <span className="mr-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Also:
          </span>
          <ul className="contents">
            {whatWeDo.also.map((chip) => (
              <li
                key={chip}
                className="rounded-[3px] border border-line px-3.5 py-[7px] text-[13px] text-muted"
              >
                {chip}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
