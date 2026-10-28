import { getImageProps } from "next/image";
import { projects, type Project, type ProjectMedia } from "@/lib/kozmoz";
import { WorkVideo } from "@/components/kozmoz/work-video";
import { cn } from "@/lib/utils";

/**
 * Work: the studio's shared work, every project placed the same way — its
 * screen centred across the seam, its text centred beneath. No one's name is
 * on any of it, so nothing here dims when a name is picked in the hero. A
 * project with no media is set as type only, its name printed large; hidden
 * projects are skipped.
 */
export function Work() {
  return (
    <section className="work" id="work" aria-labelledby="work-h">
      <h2 className="sr-only" id="work-h">
        Work
      </h2>
      {projects
        .filter((p) => !p.hidden)
        .map((p) => (
          <ProjectCard key={p.name} project={p} />
        ))}
    </section>
  );
}

function ProjectCard({ project: p }: { project: Project }) {
  return (
    <article className={cn("proj", !p.media && "proj--type", "rule-both")}>
      {p.media && <ProjectScreen media={p.media} />}
      <div className="proj-body across">
        <h3 className={cn("proj-name", !p.media && "proj-name--big")}>{p.name}</h3>
        <p className="proj-meta label">
          {p.place} <span aria-hidden="true">·</span> {p.status}
        </p>
        <p className="proj-line">{p.line}</p>
        {p.link && (
          <p className="proj-site">
            <a className="proj-link" href={p.link.href} target="_blank" rel="noopener">
              {p.link.label}
            </a>
          </p>
        )}
      </div>
    </article>
  );
}

/**
 * The project's screen: the 16:10 desktop still from 1024px up, the 4:5
 * portrait one below it, and the loop over either once it plays. On desktop
 * it opens out from the seam as it scrolls in.
 */
function ProjectScreen({ media: m }: { media: ProjectMedia }) {
  const sizes = "(max-width: 1023px) 100vw, 76vw";
  const common = { alt: m.alt, sizes };
  const {
    props: { srcSet: mobile },
  } = getImageProps({ ...common, ...m.mobile });
  const { props: img } = getImageProps({ ...common, ...m.desktop });

  return (
    <figure className="proj-media open-both">
      <picture>
        <source media="(max-width: 1023px)" srcSet={mobile} sizes={sizes} />
        <img {...img} />
      </picture>
      {m.loop && <WorkVideo desktop={m.loop.desktop} mobile={m.loop.mobile} />}
    </figure>
  );
}
