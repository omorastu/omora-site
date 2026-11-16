import { getImageProps } from "next/image";
import Link from "next/link";
import {
  homeWorkCount,
  projects,
  serviceFor,
  workPage,
  type Project,
  type ProjectMedia,
  type ServiceSlug,
  type Still,
} from "@/lib/elorro";
import { mediaOnDisk } from "@/lib/work-media";
import { WorkVideo } from "@/components/elorro/work-video";
import { ChapterMark } from "@/components/elorro/marks";
import { cn } from "@/lib/utils";

/**
 * Work: the studio's shared work, shown the way a magazine lays out a
 * portfolio, one piece at a time down the page: a big live screen, and
 * beside it its name, where and how it stands, a line and the link, the
 * screen swapping sides from one piece to the next. On phones each screen
 * runs the full width of the phone and its words follow under it: one
 * column, scrolled as any page is. No one's name is on any of it. Hidden
 * projects are skipped, here and on /work.
 */

/** Every project ready to show, in order. */
export const shownProjects = () => projects.filter((p) => !p.hidden);

/**
 * Every project ready to show under one service, in that service's own order,
 * each on its service media where it has some (the home page keeps `media`).
 */
export const projectsFor = (slug: ServiceSlug) => {
  const order = serviceFor(slug)?.work ?? [];
  const rank = (p: Project) => (order.includes(p.name) ? order.indexOf(p.name) : order.length);
  return shownProjects()
    .filter((p) => p.service === slug)
    .sort((a, b) => rank(a) - rank(b))
    .map((p) => (p.serviceMedia ? { ...p, media: p.serviceMedia } : p));
};

/** The home page's Work: the first `homeWorkCount` projects, then the way to the rest. */
export function Work({ n }: { n?: string }) {
  const shown = shownProjects().slice(0, homeWorkCount);
  return (
    <section className="work chap" id="work" aria-labelledby="work-h">
      <div className="wrap">
        <ChapterMark n={n} label={workPage.title} id="work-h" />
        <WorkGrid projects={shown} large />
        <p className="more more--center">
          <Link href="/work">{workPage.more}</Link>
        </p>
      </div>
    </section>
  );
}

/**
 * The pieces, one after another, the screen on alternate sides. `heading` is
 * h2 where the page has no section heading over them; `large` gives the
 * screen more of the width (the home page's).
 */
export function WorkGrid({ projects, heading = "h3", large = false }: { projects: Project[]; heading?: "h2" | "h3"; large?: boolean }) {
  return (
    <div className={cn("pieces", large && "pieces--large")}>
      {projects.map((p, i) => (
        <Piece key={p.name} project={p} heading={heading} flip={i % 2 === 1} sizes={large ? LARGE_SIZES : SIZES} />
      ))}
    </div>
  );
}

/** A piece's screen: the full width on phones, about two thirds of the page above (a little more on the home page). */
const SIZES = "(max-width: 1023px) 100vw, (min-width: 1921px) 1100px, 58vw";
const LARGE_SIZES = "(max-width: 1023px) 100vw, (min-width: 1921px) 1240px, 64vw";

function Piece({ project: p, heading: Heading, flip, sizes }: { project: Project; heading: "h2" | "h3"; flip: boolean; sizes: string }) {
  const { media } = mediaOnDisk(p.name, p.media);
  return (
    <article className={cn("piece", flip && "piece--flip", !media && "piece--text")}>
      {media && <ProjectScreen media={media} sizes={sizes} className="piece-media" />}
      <div className="piece-text">
        <p className="piece-meta label">
          {p.place && (
            <>
              {p.place} <span aria-hidden="true">·</span>{" "}
            </>
          )}
          {p.status}
        </p>
        <Heading className="piece-name">{p.name}</Heading>
        <p className="piece-line">{p.line}</p>
        {p.link && (
          <p className="piece-site">
            {p.link.href.startsWith("/") ? (
              <Link className="go" href={p.link.href}>
                {p.link.label}
              </Link>
            ) : (
              <a className="go go--out" href={p.link.href} target="_blank" rel="noopener">
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
 * loop never plays there). `portrait` keeps the 4:5 still and the phone cut
 * at every width (the opening's reel). Pass media through `mediaOnDisk`
 * first, so only files that exist are asked for.
 */
export function ProjectScreen({
  media: m,
  sizes = SIZES,
  className,
  portrait = false,
}: {
  media: ProjectMedia;
  sizes?: string;
  className?: string;
  portrait?: boolean;
}) {
  const common = { alt: m.alt, sizes };
  const srcSet = (still: Still) => getImageProps({ ...common, ...still }).props.srcSet;
  const { props: img } = getImageProps({ ...common, ...(portrait ? m.mobile : m.desktop) });
  const reduced = "(prefers-reduced-motion: reduce)";
  const loop = m.loop && (portrait ? phoneCut(m.loop) : m.loop);

  return (
    <figure className={cn("screen", portrait && "screen--portrait", className)}>
      <picture>
        {m.still &&
          (portrait ? (
            <source media={reduced} srcSet={srcSet(m.still.mobile)} sizes={sizes} />
          ) : (
            <>
              <source media={`${reduced} and (max-width: 1023px)`} srcSet={srcSet(m.still.mobile)} sizes={sizes} />
              <source media={reduced} srcSet={srcSet(m.still.desktop)} sizes={sizes} />
            </>
          ))}
        {!portrait && <source media="(max-width: 1023px)" srcSet={srcSet(m.mobile)} sizes={sizes} />}
        <img {...img} alt={m.alt} />
      </picture>
      {loop && <WorkVideo {...loop} />}
    </figure>
  );
}

/** A loop's phone cut at every width (or, with none, whatever cut it has). */
const phoneCut = (l: NonNullable<ProjectMedia["loop"]>) => {
  const hd = l.mobile ?? l.desktop;
  const sd = l.mobileSd ?? l.desktopSd;
  return { desktop: hd, mobile: hd, desktopSd: sd, mobileSd: sd };
};
