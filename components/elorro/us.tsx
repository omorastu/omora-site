import { people, sectionLabel, us, type Who } from "@/lib/elorro";
import { cn } from "@/lib/utils";

/**
 * Us: on the left, the line about who does the work and where we are; under
 * it, the three promises, and level with them on the right, the two people
 * side by side (stacked on phones), each under a short gold rule.
 */
export function Us() {
  return (
    <section className="us sec" id="us" aria-labelledby="us-h">
      {/* The V3 home page's id for this section, kept so old links still land here. */}
      <span id="about" aria-hidden="true" />
      <div className="wrap">
        <div className="us-head">
          <p className="sec-label label">{sectionLabel("#us")}</p>
          <h2 className="sec-h" id="us-h">
            {us.title}
          </h2>
          <p className="where">{us.where}</p>
        </div>
        <ul className="promises">
          {us.promises.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>

        <div className="pair">
          <Person who="a" />
          <Person who="j" />
        </div>
      </div>
    </section>
  );
}

/** A person: their full name and what they do. */
function Person({ who }: { who: Who }) {
  const p = people[who];
  return (
    <article className={cn("person", `person--${who}`)}>
      <p className="person-line">
        <b>
          {p.name} {p.last}.
        </b>{" "}
        {p.line}
      </p>
    </article>
  );
}
