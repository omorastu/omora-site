import { teamVideo } from "@/lib/home";
import { Reveal } from "@/components/motion";
import { MediaSlot } from "@/components/home/media-slot";

/**
 * Team video: a short intro beside the video slot. Stacks on narrow screens,
 * copy first.
 */
export function TeamVideo() {
  return (
    <section className="layer px-6 pb-24 sm:pb-28">
      <div className="mx-auto grid max-w-wrap items-center gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-14">
        <Reveal>
          <p className="plate">{teamVideo.eyebrow}</p>
          <h2 className="mt-5 font-display text-3xl font-semibold leading-[1.18] tracking-[-0.02em] text-ink sm:text-[38px]">
            {teamVideo.title}
          </h2>
          <p className="mt-5 max-w-[46ch] text-pretty text-[17px] leading-[1.7] text-muted">
            {teamVideo.lede}
          </p>
        </Reveal>

        <Reveal delay={100}>
          <MediaSlot
            media={teamVideo.video}
            ratio="16/9"
            label="Team video"
            hint="Ashan & Jordan"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </Reveal>
      </div>
    </section>
  );
}
