import Link from "next/link";
import { people, sectionLabel, services, servicesPage, type Service } from "@/lib/kozmoz";
import { cn } from "@/lib/utils";

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
              <p className="svc-card-credit label">
                <span className="c-a">{s.credit.a}</span>, <span className="c-j">{s.credit.j}</span>
              </p>
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
 * One service on /services: a section of its own, under its id, centred
 * across the seam, with what's included listed between the text and the
 * credit line. The credit line splits the work along the seam — Ashan's part
 * on the left, Jordan's on the right — with a tag on the seam itself saying
 * whose it is.
 */
export function ServiceRow({ service: s }: { service: Service }) {
  const hands = s.hands === "both" ? undefined : s.hands;

  return (
    <section
      className={cn("svc", "svc--both", `rule-${s.hands}`, "svc--detail")}
      id={s.id}
      aria-labelledby={`${s.id}-h`}
    >
      <h2 className="svc-title across" id={`${s.id}-h`}>
        {s.title}
      </h2>
      <p className="svc-text across">{s.text}</p>
      <ul className="incl across">
        {s.included.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="credit">
        <span className="credit-a">{s.credit.a}</span>
        {hands ? (
          <span className="tag" aria-label={`${people[hands].name} leads`}>
            <b className={`c-${hands}`}>{people[hands].initial}</b>
          </span>
        ) : (
          <span className="tag" aria-label={`${people.a.name} and ${people.j.name}`}>
            <b className="c-a">{people.a.initial}</b>+<b className="c-j">{people.j.initial}</b>
          </span>
        )}
        <span className="credit-j">{s.credit.j}</span>
      </p>
    </section>
  );
}
