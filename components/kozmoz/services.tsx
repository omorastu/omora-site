import Link from "next/link";
import { people, services, servicesPage, type Service } from "@/lib/kozmoz";
import { cn } from "@/lib/utils";

/**
 * What we do. A shared service is centred across the seam; one that is
 * Jordan's sits on Jordan's side. Under each, the credit line splits the work
 * along the seam — Ashan's part on the left, Jordan's on the right — with a
 * tag on the seam itself saying whose it is.
 */
export function Services() {
  return (
    <section className="do" id="do" aria-labelledby="do-h">
      {/* The V3 home page's id for this section, kept so old links still land here. */}
      <span id="services" aria-hidden="true" />
      <h2 className="sr-only" id="do-h">
        What we do
      </h2>
      {services.map((s) => (
        <ServiceRow key={s.id} service={s} />
      ))}
      <p className="more across">
        <Link href="/services">{servicesPage.more}</Link>
      </p>
    </section>
  );
}

/**
 * One service. On /services (`detail`) it is a section of its own, under its
 * id, with what's included listed between the text and the credit line.
 */
export function ServiceRow({ service: s, detail = false }: { service: Service; detail?: boolean }) {
  const hands = s.hands === "both" ? undefined : s.hands;
  // Shared lines cross the seam on paper.
  const shared = !hands;
  const Box = detail ? "section" : "article";
  const Title = detail ? "h2" : "h3";

  return (
    <Box
      className={cn("svc", `svc--${s.hands}`, `rule-${s.hands}`, detail && "svc--detail")}
      id={detail ? s.id : undefined}
      aria-labelledby={detail ? `${s.id}-h` : undefined}
    >
      <Title className={cn("svc-title", shared && "across")} id={detail ? `${s.id}-h` : undefined}>
        {s.title}
      </Title>
      <p className={cn("svc-text", shared && "across")}>{s.text}</p>
      {detail && (
        <ul className={cn("incl", shared && "across")}>
          {s.included.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
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
    </Box>
  );
}
