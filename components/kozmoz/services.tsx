import Link from "next/link";
import { sectionLabel, services, servicesPage, type Service } from "@/lib/kozmoz";

/** What we do: the four services two by two, then the way to /services. */
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
            <article key={s.id} className="svc-card">
              <h3 className="svc-card-title">{s.title}</h3>
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
 * One service on /services, a section of its own under its id, on the home
 * page's grid: the title and the text on the left, what's included as a
 * ruled list on the right.
 */
export function ServiceRow({ service: s }: { service: Service }) {
  return (
    <section className="svc sec" id={s.id} aria-labelledby={`${s.id}-h`}>
      <div className="wrap">
        <div className="svc-head">
          <h2 className="sec-h svc-title" id={`${s.id}-h`}>
            {s.title}
          </h2>
          <p className="svc-text">{s.text}</p>
        </div>
        <ul className="incl">
          {s.included.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
