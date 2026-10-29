import Link from "next/link";
import { sectionLabel, services, servicesPage, type Service } from "@/lib/kozmoz";

/**
 * What we do: the four services two by two, each card the way to its own
 * page (/services/<slug>), then the way to /services.
 */
export function Services() {
  return (
    <section className="do sec" id="do" aria-labelledby="do-h">
      {/* The V3 home page's id for this section, kept so old links still land here. */}
      <span id="services" aria-hidden="true" />
      <div className="wrap">
        <h2 className="sec-label label" id="do-h">
          {sectionLabel("#do")}
        </h2>
        <div className="do-grid">
          {services.map((s) => (
            <article key={s.slug} className="svc-card card-link">
              <h3 className="svc-card-title">
                <Link href={`/services/${s.slug}`}>{s.title}</Link>
              </h3>
              <p className="svc-card-text">{s.text}</p>
            </article>
          ))}
        </div>
        <p className="more">
          <Link href="/services">{servicesPage.more}</Link>
        </p>
      </div>
    </section>
  );
}

/**
 * One service on /services, a section of its own under its slug, on the home
 * page's grid: the title and the text on the left over a preview of the work,
 * what's included as a ruled list on the right. The whole row is the way to
 * the service's page.
 */
export function ServiceRow({ service: s }: { service: Service }) {
  return (
    <section className="svc sec card-link" id={s.slug} aria-labelledby={`${s.slug}-h`}>
      <div className="wrap">
        <div className="svc-head">
          <h2 className="sec-h svc-title" id={`${s.slug}-h`}>
            <Link href={`/services/${s.slug}`}>{s.title}</Link>
          </h2>
          <p className="svc-text">{s.text}</p>
        </div>
        <ul className="incl">
          {s.included.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {/* TODO: a preview of this service's work goes here once there's work to show. */}
        <div className="svc-preview placeholder" aria-hidden="true" />
      </div>
    </section>
  );
}
