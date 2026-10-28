import Image from "next/image";
import { people, us, type Who } from "@/lib/kozmoz";
import { cn } from "@/lib/utils";

/**
 * Us: the line about who does the work, then the two people side by side —
 * each on their own side of the seam — then where we are and the three
 * promises, which cross it.
 */
export function Us() {
  return (
    <section className="us" id="us" aria-labelledby="us-h">
      {/* The V3 home page's id for this section, kept so old links still land here. */}
      <span id="about" aria-hidden="true" />
      <h2 className="say across" id="us-h">
        {us.title}
      </h2>

      <div className="pair">
        <PersonCard who="a" />
        <PersonCard who="j" />
      </div>

      <p className="where across">{us.where}</p>

      <ul className="promises">
        {us.promises.map((p) => (
          <li key={p} className="across rule-both">
            {p}
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * A portrait frame and a line. With no photo set — the state until the shoot —
 * the frame holds the person's initial at the portrait's proportions; set
 * `photo` in lib/kozmoz.ts and the photo fills it, the initial steps back and
 * the name plate gets a paper ground to sit on.
 */
function PersonCard({ who }: { who: Who }) {
  const p = people[who];
  return (
    <article className={cn("person", `person--${who}`, `rule-${who}`)}>
      <div className={cn("frame", `slide-${who}`, p.photo && "has-photo")}>
        {p.photo && (
          <Image src={p.photo} alt={p.name} fill sizes="(max-width: 1023px) 100vw, 27rem" />
        )}
        <span className="frame-initial" aria-hidden="true">
          {p.initial}
        </span>
        <span className="frame-name label">{p.name}</span>
      </div>
      <p className="person-line">
        <b className={`c-${who}`}>{p.name}.</b> {p.line}
      </p>
    </article>
  );
}
