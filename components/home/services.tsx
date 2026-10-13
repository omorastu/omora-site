import { services, type Service } from "@/lib/content";
import { sections } from "@/lib/home";
import { Reveal } from "@/components/motion";
import { SectionHead } from "@/components/site/section-head";
import { MediaSlot } from "@/components/home/media-slot";
import { HomeSection } from "@/components/home/section";

/**
 * The four services, each with a 16:9 image above the copy.
 *
 * This is the home page's own card, not the ServiceCard the /services index
 * uses: that one draws an animated schematic of the product, and the point of
 * this layout is to show the real thing instead — a screenshot of the
 * receptionist mid-call, a client site on a device. Until those exist the
 * slot renders as a placeholder, which is the honest state. Same data, same
 * destination; only the picture is different.
 */

/** What each slot should eventually show, keyed by slug. Guidance for the shoot, not copy. */
const IMAGE_HINTS: Record<string, string> = {
  "ai-receptionist": "Real screenshot of the receptionist handling a live call — the transcript UI.",
  websites: "A real client site on a laptop and a phone.",
  "booking-systems": "A filled week view. Real product shot.",
  "sales-intelligence": "The lead scoring board. Labelled as the interface, since there's no client build yet.",
};

function HomeServiceCard({ item, index }: { item: Service; index: number }) {
  return (
    <Reveal as="li" delay={index * 90} className="h-full">
      <a
        href={`/services/${item.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-raised transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-violet-dim focus-visible:border-violet-dim motion-reduce:hover:translate-y-0"
      >
        <MediaSlot
          media={item.image}
          ratio="16/9"
          label="Image"
          hint={IMAGE_HINTS[item.slug]}
          sizes="(max-width: 860px) 100vw, 50vw"
          flush
        />

        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <h3 className="font-display text-xl font-semibold leading-tight tracking-tight text-ink">
            {item.title}
          </h3>
          <p className="mt-2.5 text-pretty leading-relaxed text-muted">
            {item.summary ?? item.body}
          </p>
          <p className="plate mt-auto pt-5 transition-colors group-hover:text-ink">{item.name}</p>
        </div>
      </a>
    </Reveal>
  );
}

export function HomeServices() {
  return (
    <HomeSection id="services">
      <SectionHead
        tone="dark"
        plate="Services"
        title={sections.services.title}
        intro={sections.services.lede}
      />

      <ul className="grid gap-5 md:grid-cols-2">
        {services.map((item, i) => (
          <HomeServiceCard key={item.slug} item={item} index={i} />
        ))}
      </ul>
    </HomeSection>
  );
}
