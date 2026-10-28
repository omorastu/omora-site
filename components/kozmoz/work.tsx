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
import { WorkVideo } from "@/components/kozmoz/work-video";
import { cn } from "@/lib/utils";

/**
 * Work: the studio's shared work, every project placed the same way — its
 * screen centred across the seam, its text centred beneath. No one's name is
 * on any of it. A project with no media is set as type only, its name printed
 * large; hidden projects are skipped, here and on /work.
 */

/** Every project ready to show, in order. */
export const shownProjects = () => projects.filter((p) => !p.hidden);

/** The home page's Work: the first `homeWorkCount` projects, then the way to the rest. */
export function Work() {
  return (
    <section className="work" id="work" aria-labelledby="work-h">
      <h2 className="sr-only" id="work-h">
        Work
      </h2>
      {shownProjects()
        .slice(0, homeWorkCount)
        .map((p) => (
          <ProjectCard key={p.name} project={p} />
        ))}
      <p className="more across">
        <Link href="/work">{workPage.more}</Link>
      </p>
    </section>
  );
}

/** One project. `heading` is h2 on /work, where the page title is the h1. */
export function ProjectCard({
  project: p,
  heading: Heading = "h3",
}: {
  project: Project;
  heading?: "h2" | "h3";
}) {
  return (
    <article className={cn("proj", !p.media && "proj--type", "rule-both")}>
      {p.media && <ProjectScreen media={p.media} />}
      <div className="proj-body across">
        <Heading className={cn("proj-name", !p.media && "proj-name--big")}>{p.name}</Heading>
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
 * The project's screen: the 16:10 desktop still from 1024px up, the 4:5
 * portrait one below it, and the loop over either once it plays. Under
 * reduced motion, a project with `still` set shows those instead (the loop
 * never plays there). On desktop it opens out from the seam as it scrolls in.
 * Desktop shows it at 60rem, two thirds of the frame (and 1280px once the
 * root stops growing at 1920).
 */
function ProjectScreen({ media: m }: { media: ProjectMedia }) {
  const sizes = "(max-width: 1023px) 100vw, (min-width: 1921px) 1280px, 67vw";
  const common = { alt: m.alt, sizes };
  const srcSet = (still: Still) => getImageProps({ ...common, ...still }).props.srcSet;
  const { props: img } = getImageProps({ ...common, ...m.desktop });
  const reduced = "(prefers-reduced-motion: reduce)";

  return (
    <figure className="proj-media open-both">
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
