import Image from "next/image";
import { people, sectionLabel, us, type Who } from "@/lib/kozmoz";
import { cn } from "@/lib/utils";

/**
 * Us: on the left, the line about who does the work, where we are and the
 * three promises; on the right, the two people side by side.
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
          <ul className="promises">
            {us.promises.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>

        <div className="pair">
          <PersonCard who="a" />
          <PersonCard who="j" />
        </div>
      </div>
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
    <article className={cn("person", `person--${who}`)}>
      <div className={cn("frame", `slide-${who}`, p.photo && "has-photo")}>
        {p.photo && (
          <Image src={p.photo} alt={p.name} fill sizes="(max-width: 1023px) 50vw, 18rem" />
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
