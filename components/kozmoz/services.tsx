import Link from "next/link";
import { sectionLabel, services, servicesPage, type Service } from "@/lib/kozmoz";

/**
 * What we do: the four services two by two, each with its credit line saying
 * who does which part, then the way to /services.
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
            <article key={s.id} className="svc-card">
              <h3 className="svc-card-title">{s.title}</h3>
              <p className="svc-card-text">{s.text}</p>
              <Credit service={s} className="svc-card-credit" />
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

/** Who does which part, as one line in the two inks. */
function Credit({ service: s, className }: { service: Service; className: string }) {
  return (
    <p className={`${className} label`}>
      <span className="c-a">{s.credit.a}</span>, <span className="c-j">{s.credit.j}</span>
    </p>
  );
}

/**
 * One service on /services, a section of its own under its id, on the home
 * page's grid: the title, the text and the credit line on the left, what's
 * included as a ruled list on the right.
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
          <Credit service={s} className="svc-credit" />
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
