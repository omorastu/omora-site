import { founders, sections, type Founder } from "@/lib/home";
import { Reveal } from "@/components/motion";
import { SectionHead } from "@/components/site/section-head";
import { MediaSlot } from "@/components/home/media-slot";

/**
 * The letter from the founders — the only light section on the page. A letter
 * should read like paper, and being the one cream surface is what makes it
 * read as one.
 *
 * Carries `data-light-zone` so the nav flips to its light treatment while
 * scrolling through it, the same hook the cream middle of v2 used.
 *
 * The bios are not here. They render as marked placeholders until each
 * founder writes their own — see the Founder type in lib/home.ts.
 */

function FounderBlock({ person, index }: { person: Founder; index: number }) {
  return (
    <Reveal delay={index * 120}>
      <div className="border-t-2 border-violet-line pt-7">
        <MediaSlot
          media={person.portrait}
          ratio="3/4"
          label="Portrait"
          hint="Plain background. Both shot in the same session so they match."
          tone="light"
          sizes="(max-width: 860px) 100vw, 50vw"
        />

        {person.bio ? (
          <div className="mt-7 max-w-[52ch] space-y-4 text-pretty leading-relaxed text-cream-ink/85">
            {person.bio.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        ) : (
          <div
            role="note"
            aria-label={`Bio for ${person.name} — not yet written`}
            className="slot-light mt-7 min-h-[11rem] p-6"
          >
            <div className="max-w-[34ch]">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-violet-ink">
                Bio
              </p>
              <p className="mt-1.5 text-pretty font-mono text-[11px] leading-relaxed text-cream-muted">
                {person.bioBrief}
              </p>
            </div>
          </div>
        )}

        {/* The signature is the one place outside the wordmark that Cormorant
            is used — a letter is signed, not captioned. */}
        <p className="mt-7 font-logo text-3xl text-cream-ink">
          {person.name}
          {person.note && (
            <span className="ml-3 align-middle font-mono text-[10px] uppercase tracking-[0.16em] text-cream-muted/70">
              {person.note}
            </span>
          )}
        </p>
        <p className="plate-light mt-1.5">{person.role}</p>
      </div>
    </Reveal>
  );
}

export function Founders() {
  return (
    <section
      id="about"
      data-light-zone
      className="layer border-t border-violet-line bg-cream px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-wrap">
        <SectionHead
          plate="Founders"
          title={sections.founders.title}
          intro={sections.founders.lede}
        />

        <div className="grid gap-12 md:grid-cols-2 md:gap-14">
          {founders.map((person, i) => (
            <FounderBlock key={person.name} person={person} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
