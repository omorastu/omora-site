import { hero } from "@/lib/home";
import { MediaSlot } from "@/components/home/media-slot";
import { PrimaryCta, GhostCta } from "@/components/home/cta";

/**
 * Hero: eyebrow, headline, lede, the two actions, then the work reel full
 * width beneath. Entrance is the `rise` cascade from globals.css — eyebrow,
 * headline, lede, actions, reel — which lands instantly under reduced motion.
 */
export function HomeHero() {
  return (
    <header className="layer px-6 pb-20 pt-36 sm:pb-24 sm:pt-44">
      <div className="mx-auto max-w-wrap">
        <p className="rise plate" style={{ animationDelay: "40ms" }}>
          {hero.eyebrow}
        </p>

        <h1
          className="rise mt-7 max-w-[15ch] text-balance font-display text-[clamp(2.6rem,7vw,4.75rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-ink"
          style={{ animationDelay: "120ms" }}
        >
          {hero.title}
        </h1>

        <p
          className="rise mt-7 max-w-[60ch] text-pretty text-lg leading-relaxed text-muted sm:text-xl"
          style={{ animationDelay: "220ms" }}
        >
          {hero.lede}
        </p>

        <div className="rise mt-10 flex flex-wrap gap-4" style={{ animationDelay: "320ms" }}>
          <PrimaryCta href={hero.primary.href}>{hero.primary.label}</PrimaryCta>
          <GhostCta href={hero.secondary.href}>{hero.secondary.label}</GhostCta>
        </div>

        <div className="rise mt-16 sm:mt-20" style={{ animationDelay: "440ms" }}>
          <MediaSlot
            media={hero.reel}
            ratio="21/9"
            label="Work reel"
            hint="Looping video or hero image"
            priority
          />
        </div>
      </div>
    </header>
  );
}
