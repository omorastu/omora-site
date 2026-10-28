import { getImageProps } from "next/image";
import { people, projects, type Project, type ProjectMedia } from "@/lib/kozmoz";
import { WorkVideo } from "@/components/kozmoz/work-video";
import { cn } from "@/lib/utils";

/**
 * Work. Jordan's projects sit on Jordan's side of the seam, their screens
 * running off the right edge of the page; shared ones are centred across it.
 * A project with no media is set as type only, its name printed large.
 */
export function Work() {
  return (
    <section className="work" id="work" aria-labelledby="work-h">
      <h2 className="sr-only" id="work-h">
        Work
      </h2>
      {projects.map((p) => (
        <ProjectCard key={p.name} project={p} />
      ))}
    </section>
  );
}

function ProjectCard({ project: p }: { project: Project }) {
  const shared = p.hands === "both";

  return (
    <article
      className={cn("proj", `proj--${p.hands}`, !p.media && "proj--type", `rule-${p.hands}`)}
      data-hands={shared ? undefined : p.hands}
    >
      {p.media && <ProjectScreen media={p.media} hands={p.hands} />}
      <div className={cn("proj-body", shared && "across")}>
        <h3 className={cn("proj-name", !p.media && "proj-name--big")}>{p.name}</h3>
        <p className="proj-meta label">
          {p.place} <span aria-hidden="true">·</span> {p.status}
        </p>
        <p className="proj-line">{p.line}</p>
        {shared ? (
          <p className="proj-credit pair-credit">
            <span className="who-credit c-a">{people.a.name}</span>{" "}
            <span className="amp-sm">&amp;</span>{" "}
            <span className="who-credit c-j">{people.j.name}</span>
          </p>
        ) : (
          <p className="proj-credit">
            <span className="who-credit c-j">{people.j.name}</span>{" "}
            {p.link && (
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
 * portrait one below it, and the loop over either once it plays. On desktop a
 * shared screen opens out from the seam as it scrolls in; Jordan's slides in
 * from Jordan's side.
 */
function ProjectScreen({ media: m, hands }: { media: ProjectMedia; hands: Project["hands"] }) {
  const sizes =
    hands === "both" ? "(max-width: 1023px) 100vw, 76vw" : "(max-width: 1023px) 100vw, 50vw";
  const common = { alt: m.alt, sizes };
  const {
    props: { srcSet: mobile },
  } = getImageProps({ ...common, ...m.mobile });
  const { props: img } = getImageProps({ ...common, ...m.desktop });

  return (
    <figure className={cn("proj-media", hands === "both" ? "open-both" : `slide-${hands}`)}>
      <picture>
        <source media="(max-width: 1023px)" srcSet={mobile} sizes={sizes} />
        <img {...img} />
      </picture>
      {m.loop && <WorkVideo desktop={m.loop.desktop} mobile={m.loop.mobile} />}
    </figure>
  );
}
