import Image from "next/image";
import { people, sectionLabel, us, type Who } from "@/lib/kozmoz";
import { onDisk } from "@/lib/public-files";
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
 * A portrait frame and a line. Until the person's photo is in public/ (its
 * path is `photo` in lib/kozmoz.ts: public/m/us/ashan.jpg, jordan.jpg) the
 * frame is a plate with their initial; once it's there, the photo fills the
 * frame, the initial steps back and the name plate gets a paper ground to
 * sit on.
 */
function PersonCard({ who }: { who: Who }) {
  const p = people[who];
  const photo = onDisk(p.photo);
  return (
    <article className={cn("person", `person--${who}`)}>
      <div className={cn("frame", `slide-${who}`, photo && "has-photo")}>
        {photo && <Image src={p.photo} alt={p.name} fill sizes="(max-width: 1023px) 50vw, 18rem" />}
        <span className="frame-initial" aria-hidden="true">
          {p.initial}
        </span>
        <span className="frame-name label">{p.name}</span>
      </div>
      <p className="person-line">
        <b>{p.name}.</b> {p.line}
      </p>
    </article>
  );
}
