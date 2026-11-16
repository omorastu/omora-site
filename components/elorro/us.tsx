import { people, sectionLabel, us, type Who } from "@/lib/elorro";
import { ChapterMark } from "@/components/elorro/marks";
import { cn } from "@/lib/utils";

/**
 * Us, the first thing after the door: who you'd be talking to. The line
 * about who does the work, large, as the start of a letter; then the two of
 * us, each with our initial in a gold ring (as Elora has hers in the film),
 * our name and what we do; then the three promises, and where we are.
 */
export function Us({ n }: { n?: string }) {
  return (
    <section className="us chap" id="us" aria-labelledby="us-h">
      {/* The V3 home page's id for this section, kept so old links still land here. */}
      <span id="about" aria-hidden="true" />
      <div className="wrap">
        <ChapterMark n={n} label={sectionLabel("#us") ?? "Us"} id="us-h" />
        <p className="statement us-title">{us.title}</p>
        <div className="us-two">
          {(["a", "j"] as Who[]).map((who) => (
            <Person key={who} who={who} />
          ))}
        </div>
        <ul className="promises">
          {us.promises.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <p className="us-where label">{us.where}</p>
      </div>
    </section>
  );
}

/** One of us: the initial in its ring, the full name, and what they do. */
function Person({ who }: { who: Who }) {
  const p = people[who];
  return (
    <article className={cn("person", `person--${who}`)}>
      <span className="ring" aria-hidden="true">
        {p.initial}
      </span>
      <div className="person-text">
        <h3 className="person-name">
          {p.name} {p.last}
        </h3>
        <p className="person-line">{p.line}</p>
      </div>
    </article>
  );
}
