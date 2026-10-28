import { people, services, type Service } from "@/lib/kozmoz";
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
        <ServiceRow key={s.title} service={s} />
      ))}
    </section>
  );
}

function ServiceRow({ service: s }: { service: Service }) {
  // Shared lines cross the seam on paper; one person's lines dim with the other's view.
  const hands = s.hands === "both" ? undefined : s.hands;
  const shared = !hands;

  return (
    <article className={cn("svc", `svc--${s.hands}`, `rule-${s.hands}`)}>
      <h3 className={cn("svc-title", shared && "across")} data-hands={hands}>
        {s.title}
      </h3>
      <p className={cn("svc-text", shared && "across")} data-hands={hands}>
        {s.text}
      </p>
      <p className="credit">
        <span className="credit-a" data-hands="a">
          {s.credit.a}
        </span>
        {hands ? (
          <span className="tag" aria-label={`${people[hands].name} leads`}>
            <b className={`c-${hands}`}>{people[hands].initial}</b>
          </span>
        ) : (
          <span className="tag" aria-label={`${people.a.name} and ${people.j.name}`}>
            <b className="c-a">{people.a.initial}</b>+<b className="c-j">{people.j.initial}</b>
          </span>
        )}
        <span className="credit-j" data-hands="j">
          {s.credit.j}
        </span>
      </p>
    </article>
  );
}
