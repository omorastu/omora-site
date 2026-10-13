import { team, type TeamMember } from "@/lib/content";
import { sections, CAPACITY } from "@/lib/home";
import { Reveal } from "@/components/motion";
import { SectionHead } from "@/components/site/section-head";
import { MediaSlot } from "@/components/home/media-slot";
import { HomeSection } from "@/components/home/section";

/**
 * The team: the video, then all four people.
 *
 * Reads the same `team` list as /team. The two open seats there render as open
 * seats here too — a square slot, a name to come — rather than being dropped,
 * because "all four of us" is the claim and the grid should show four.
 */

function Member({ person, index }: { person: TeamMember; index: number }) {
  const open = person.placeholder || !person.name;

  return (
    <Reveal as="li" delay={index * 90}>
      <MediaSlot
        media={person.photo}
        ratio="1/1"
        label="Photo"
        hint={open ? "Person to come." : person.name}
        sizes="(max-width: 860px) 50vw, 25vw"
      />
      <h3
        className={
          open
            ? "mt-4 font-display text-lg font-semibold tracking-tight text-muted/60"
            : "mt-4 font-display text-lg font-semibold tracking-tight text-ink"
        }
      >
        {open ? "Name to come" : person.name}
      </h3>
      <p className={open ? "mt-1 text-sm text-muted/60" : "mt-1 text-sm text-muted"}>
        {open ? "Role to come" : person.role}
      </p>
    </Reveal>
  );
}

export function HomeTeam() {
  return (
    <HomeSection id="team">
      <SectionHead
        tone="dark"
        plate="Team"
        title={sections.team.title}
        intro={sections.team.lede}
      />

      <Reveal>
        <MediaSlot
          media={sections.team.video}
          ratio="16/9"
          label="Team video"
          hint="60 to 90 seconds. Both founders to camera: what you build, why you work this way."
        />
      </Reveal>

      <ul className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-4">
        {team.slice(0, CAPACITY.team).map((person, i) => (
          // Open seats have no name to key on, so they key on position.
          <Member key={person.name ?? `seat-${i}`} person={person} index={i} />
        ))}
      </ul>
    </HomeSection>
  );
}
