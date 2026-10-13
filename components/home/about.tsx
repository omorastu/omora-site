import { about } from "@/lib/home";
import { Reveal } from "@/components/motion";
import { MediaSlot } from "@/components/home/media-slot";

/** About: two short paragraphs beside the team photo slot. */
export function About() {
  return (
    <section id="about" className="layer scroll-mt-16 px-6 py-20 sm:py-24">
      <div className="mx-auto grid max-w-wrap gap-12 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:gap-16">
        <Reveal>
          <p className="plate">{about.eyebrow}</p>
          <h2 className="mt-5 max-w-[20ch] text-balance font-display text-3xl font-semibold leading-[1.18] tracking-[-0.02em] text-ink sm:text-[38px]">
            {about.title}
          </h2>
          {about.paragraphs.map((p, i) => (
            <p
              key={i}
              className={`${i === 0 ? "mt-6" : "mt-[18px]"} max-w-[56ch] text-pretty text-[17px] leading-[1.75] text-muted`}
            >
              {p}
            </p>
          ))}
        </Reveal>

        <Reveal delay={100}>
          <MediaSlot
            media={about.photo}
            ratio="4/3"
            label="Team photo"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </Reveal>
      </div>
    </section>
  );
}
