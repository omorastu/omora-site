import { hero, clients, CLIENT_SLOTS, figures } from "@/lib/home";
import { Reveal } from "@/components/motion";
import { MediaSlot } from "@/components/home/media-slot";
import { PrimaryCta, GhostCta } from "@/components/home/cta";
import { Hairlines } from "@/components/home/section";

/**
 * Hero: headline, lede, the two actions, the reel, the client strip, and the
 * proof band under it all.
 *
 * Plainer than v2's — no aurora, no particles. The reel is the thing that
 * moves now, so the ground stays still and lets it. Entrance is the same
 * `rise` cascade as before: headline, lede, actions, then the reel.
 */
export function HomeHero() {
  return (
    <header className="layer px-6 pb-16 pt-36 sm:pt-44">
      <div className="mx-auto max-w-wrap">
        <h1
          className="rise max-w-[15ch] text-balance font-display text-[clamp(2.6rem,7.5vw,5.5rem)] font-bold leading-[0.96] tracking-tightest text-ink"
          style={{ animationDelay: "80ms" }}
        >
          {hero.title}
        </h1>

        <p
          className="rise mt-7 max-w-prose text-pretty text-lg leading-relaxed text-muted sm:text-xl"
          style={{ animationDelay: "200ms" }}
        >
          {hero.lede}
        </p>

        <div className="rise mt-10 flex flex-wrap gap-3" style={{ animationDelay: "320ms" }}>
          <PrimaryCta href={hero.primary.href}>{hero.primary.label}</PrimaryCta>
          <GhostCta href={hero.secondary.href}>{hero.secondary.label}</GhostCta>
        </div>

        <div className="rise mt-16" style={{ animationDelay: "460ms" }}>
          <MediaSlot
            media={hero.media}
            ratio="16/9"
            label="Hero reel"
            hint="20–30 seconds, autoplay, muted, looping. Live builds on screen — the receptionist taking a call, a booking coming through. No faces."
            priority
          />
          <ClientStrip />
        </div>

        <ProofBand />
      </div>
    </header>
  );
}

/**
 * The client names under the reel. Text chips, not logos — a logo wall needs
 * consistent artwork nobody has, and a row of names reads as a list of
 * references rather than a badge collection.
 *
 * Pads to CLIENT_SLOTS with chips reading CLIENT NAME while the list is
 * short, so the row holds its place and the gap is counted. Overflow beyond
 * the capacity still renders: a longer list of real names is not a problem
 * to hide.
 */
const chip =
  "rounded-md border border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted";

function ClientStrip() {
  const open = Math.max(0, CLIENT_SLOTS - clients.length);

  return (
    <ul className="mt-5 flex flex-wrap gap-3" aria-label="Clients">
      {clients.map((name) => (
        <li key={name} className={chip}>
          {name}
        </li>
      ))}
      {Array.from({ length: open }).map((_, i) => (
        <li key={`open-${i}`} className={chip} aria-label="Client name to come">
          CLIENT NAME
        </li>
      ))}
    </ul>
  );
}

/**
 * Four figures in a hairline band. Everything countable is counted from the
 * datasets in lib/home.ts, so the band cannot claim more builds than the
 * shelf below it shows.
 */
function ProofBand() {
  return (
    <Reveal className="mt-16">
      <Hairlines cols="grid-cols-2 lg:grid-cols-4" className="rounded-none border-x-0">
        {figures.map((f) => (
          <div key={f.caption} className="bg-bg px-6 py-8 sm:px-7">
            <p className="font-display text-4xl font-bold leading-none tracking-tightest text-ink sm:text-5xl">
              {f.figure}
            </p>
            <p className="mt-3 max-w-[26ch] text-pretty text-sm leading-relaxed text-muted">
              {f.caption}
            </p>
          </div>
        ))}
      </Hairlines>
    </Reveal>
  );
}
