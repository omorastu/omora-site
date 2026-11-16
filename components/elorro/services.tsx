import Link from "next/link";
import { sectionLabel, services, servicesPage, type Service } from "@/lib/elorro";
import { mediaOnDisk } from "@/lib/work-media";
import { ChapterMark } from "@/components/elorro/marks";
import { ProjectScreen, shownProjects } from "@/components/elorro/work";

/**
 * What we do, on the home page: the four services as an index, one to a
 * row, the way a good menu reads. Each row's title is large and is the way
 * to its own page (/services/<slug>); beside it, the plain line on what it
 * is and what comes with it. Then the way to /services.
 */
export function Services({ n }: { n?: string }) {
  return (
    <section className="do chap" id="do" aria-labelledby="do-h">
      {/* The V3 home page's id for this section, kept so old links still land here. */}
      <span id="services" aria-hidden="true" />
      <div className="wrap">
        <ChapterMark n={n} label={sectionLabel("#do") ?? servicesPage.title} id="do-h" />
        <ol className="index">
          {services.map((s, i) => (
            <li key={s.slug} className="index-row card-link">
              <p className="index-n" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="index-title">
                <Link href={`/services/${s.slug}`}>{s.title}</Link>
              </h3>
              <div className="index-body">
                <p className="index-text">{s.text}</p>
                <ul className="ticks">
                  {s.included.slice(0, 3).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <span className="index-go" aria-hidden="true">
                →
              </span>
            </li>
          ))}
        </ol>
        <p className="more more--center">
          <Link href="/services">{servicesPage.more}</Link>
        </p>
      </div>
    </section>
  );
}

/**
 * One service on /services, a chapter of its own under its slug: its number
 * and title, the line and all that comes with it, and a piece of its work
 * playing, the screen on alternate sides from one service to the next.
 */
export function ServiceRow({ service: s, n, flip }: { service: Service; n: number; flip?: boolean }) {
  const preview = shownProjects().find((p) => p.name === s.preview);
  const { media } = mediaOnDisk(s.preview, preview?.media);
  return (
    <section className={`svc chap${flip ? " svc--flip" : ""}`} id={s.slug} aria-labelledby={`${s.slug}-h`}>
      <div className="wrap svc-grid">
        <div className="svc-text">
          <p className="svc-n" aria-hidden="true">
            {String(n).padStart(2, "0")}
          </p>
          <h2 className="svc-title" id={`${s.slug}-h`}>
            {s.title}
          </h2>
          <p className="svc-line">{s.text}</p>
          <ul className="ticks">
            {s.included.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="svc-go">
            <Link className="go" href={`/services/${s.slug}`}>
              How we do it
            </Link>
          </p>
        </div>
        {media && (
          <div className="svc-media">
            <ProjectScreen media={media} sizes="(max-width: 1023px) 100vw, 50vw" />
            <p className="svc-media-cap label">{s.preview}</p>
          </div>
        )}
      </div>
    </section>
  );
}
