import { getImageProps } from "next/image";
import Link from "next/link";
import {
  homeWorkCount,
  projects,
  workPage,
  type Project,
  type ProjectMedia,
  type Still,
} from "@/lib/kozmoz";
import { mediaOnDisk } from "@/lib/work-media";
import { WorkVideo } from "@/components/kozmoz/work-video";
import { cn } from "@/lib/utils";

/**
 * Work: the studio's shared work, two across (one on phones), every project
 * on the same card: its screen, then its name, where and how it stands, a
 * line and the link. No one's name is on any of it. Hidden projects are
 * skipped, here and on /work.
 */

/** Every project ready to show, in order. */
export const shownProjects = () => projects.filter((p) => !p.hidden);

/**
 * The home page's Work: the first `homeWorkCount` projects, then the way to
 * the rest. On phones they're one row to swipe through instead of a column.
 */
export function Work() {
  return (
    <section className="work sec" id="work" aria-labelledby="work-h">
      <div className="wrap">
        <h2 className="sec-label label" id="work-h">
          {workPage.title}
        </h2>
        <WorkGrid projects={shownProjects().slice(0, homeWorkCount)} swipe />
        <p className="more">
          <Link href="/work">{workPage.more}</Link>
        </p>
      </div>
    </section>
  );
}

/**
 * The cards, two across. `heading` is h2 on /work, where the page title is
 * the h1. `swipe` makes them one row under 768px, each card 85% of the screen.
 */
export function WorkGrid({ projects, heading = "h3", swipe = false }: { projects: Project[]; heading?: "h2" | "h3"; swipe?: boolean }) {
  const sizes = swipe ? `(max-width: 767px) 85vw, ${CARD_SIZES}` : CARD_SIZES;
  return (
    <div className={cn("work-grid", swipe && "work-grid--swipe")}>
      {projects.map((p) => (
        <ProjectCard key={p.name} project={p} heading={heading} sizes={sizes} />
      ))}
    </div>
  );
}

/** A card's screen in the grid: the whole width on phones, a column of two above. */
const CARD_SIZES = "(max-width: 1023px) 100vw, (min-width: 1921px) 780px, 41vw";

function ProjectCard({ project: p, heading: Heading, sizes }: { project: Project; heading: "h2" | "h3"; sizes: string }) {
  const { media } = mediaOnDisk(p.name, p.media);
  return (
    <article className="proj">
      {media && <ProjectScreen media={media} sizes={sizes} />}
      <div className="proj-body">
        <Heading className="proj-name">{p.name}</Heading>
        <p className="proj-meta label">
          {p.place} <span aria-hidden="true">·</span> {p.status}
        </p>
        <p className="proj-line">{p.line}</p>
        {p.link && (
          <p className="proj-site">
            {p.link.href.startsWith("/") ? (
              <Link className="proj-link" href={p.link.href}>
                {p.link.label}
              </Link>
            ) : (
              <a className="proj-link" href={p.link.href} target="_blank" rel="noopener">
                {p.link.label}
              </a>
            )}
          </p>
        )}
      </div>
    </article>
  );
}

/**
 * A project's screen, the live card: the 16:10 desktop still from 1024px up,
 * the 4:5 portrait one below it, and the loop over either once it plays.
 * Under reduced motion, a project with `still` set shows those instead (the
 * loop never plays there). Pass media through `mediaOnDisk` first, so only
 * files that exist are asked for. `sizes` defaults to a card in the grid.
 */
export function ProjectScreen({
  media: m,
  sizes = CARD_SIZES,
  className,
}: {
  media: ProjectMedia;
  sizes?: string;
  className?: string;
}) {
  const common = { alt: m.alt, sizes };
  const srcSet = (still: Still) => getImageProps({ ...common, ...still }).props.srcSet;
  const { props: img } = getImageProps({ ...common, ...m.desktop });
  const reduced = "(prefers-reduced-motion: reduce)";

  return (
    <figure className={cn("proj-media", className)}>
      <picture>
        {m.still && (
          <>
            <source media={`${reduced} and (max-width: 1023px)`} srcSet={srcSet(m.still.mobile)} sizes={sizes} />
            <source media={reduced} srcSet={srcSet(m.still.desktop)} sizes={sizes} />
          </>
        )}
        <source media="(max-width: 1023px)" srcSet={srcSet(m.mobile)} sizes={sizes} />
        <img {...img} alt={m.alt} />
      </picture>
      {m.loop && <WorkVideo {...m.loop} />}
    </figure>
  );
}
