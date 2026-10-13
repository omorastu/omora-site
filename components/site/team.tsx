import Link from "next/link";
import { team, type TeamMember } from "@/lib/content";
import { Reveal } from "@/components/motion";

/**
 * Team, in two forms.
 *
 * `Team` is the full grid, and lives on /team. `TeamStrip` is the home page's
 * two-line version — the claim plus a link, no cards. The home page used to
 * carry the whole grid; it now carries the smallest thing that makes the point,
 * because four cards is a page, not a section.
 */

/**
 * One card. The initial is set as a violet-soft monogram rather than a photo,
 * so nothing breaks when there's no headshot.
 *
 * A placeholder slot renders the same shape in a dashed, muted treatment. It is
 * deliberately legible as unfinished: a seat we haven't filled in yet reads as
 * exactly that, rather than as a person whose details failed to load.
 */
function TeamCard({ person }: { person: TeamMember }) {
  if (person.placeholder) {
    return (
      <div className="flex h-full items-start gap-5 rounded-xl border border-dashed border-cream-line bg-cream-raised/40 p-6">
        <span
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-cream-line font-display text-2xl font-bold text-cream-muted/40"
        >
          +
        </span>
        <div>
          <h3 className="font-display text-xl font-semibold tracking-tight text-cream-muted/70">
            Name to come
          </h3>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-cream-muted/60">
            Role to come
          </p>
          <p className="mt-3 text-pretty leading-relaxed text-cream-muted/60">
            Placeholder — details to come.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex h-full items-start gap-5 rounded-xl border border-cream-line bg-cream-raised p-6 transition-colors duration-400 hover:border-violet-line">
      <span
        aria-hidden="true"
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-violet-soft font-display text-2xl font-bold text-violet-ink"
      >
        {person.name?.charAt(0)}
      </span>
      <div>
        <h3 className="font-display text-xl font-semibold tracking-tight text-cream-ink">
          {person.name}
        </h3>
        <p className="plate-light mt-1">{person.role}</p>
        <p className="mt-3 text-pretty leading-relaxed text-cream-muted">
          {person.line}
        </p>
      </div>
    </div>
  );
}

/**
 * The full grid — 2×2 on desktop, one column on mobile. Rendered by /team.
 */
export function Team() {
  return (
    <ul className="grid gap-6 md:grid-cols-2">
      {team.map((person, i) => (
        // Placeholders have no name to key on, so they key on position.
        <Reveal as="li" key={person.name ?? `slot-${i}`} delay={i * 120}>
          <TeamCard person={person} />
        </Reveal>
      ))}
    </ul>
  );
}

/**
 * The home page's condensed version: the claim, and a way through to the page
 * that backs it up. No cards and no avatars — the full grid is one click away,
 * and repeating it here only made the home page longer.
 *
 * Keeps `id="team"` so any surviving /#team link still lands somewhere sensible
 * now that the nav points at /team.
 */
export function TeamStrip() {
  return (
    <section id="team" className="layer px-6 pb-[100px] pt-24 sm:pt-32">
      <div className="mx-auto max-w-wrap">
        <Reveal>
          <div className="rule-light mb-12 max-w-[8rem]" />
          <p className="max-w-prose text-pretty font-display text-2xl font-semibold leading-[1.25] tracking-tight text-cream-ink sm:text-3xl">
            You talk to the people building the thing. Nobody hands your project
            to a junior once the contract&rsquo;s signed.
          </p>
          <Link
            href="/team"
            className="group mt-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-violet-ink transition-colors hover:text-blue-ink focus-visible:text-blue-ink"
          >
            Meet the team
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
