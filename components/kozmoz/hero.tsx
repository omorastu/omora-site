import { hero, people, type Who } from "@/lib/kozmoz";
import { HandsStatus, WhoButton } from "@/components/kozmoz/hands";
import { Seam } from "@/components/kozmoz/seam";
import { cormorantBold } from "@/components/kozmoz/hero-font";
import { cn } from "@/lib/utils";

/**
 * The names on the door, in black, joined by a gold ampersand. Each name is a
 * button: pick one and a band of gold lights under it while that person's
 * line opens under the hint, on their side of the seam. The last name sits
 * under the first, centred in its half of the hero (Fernando between the
 * left edge and the seam, Lopez between the seam and the right edge; on
 * phones, where the names stack, mirrored under the first names), and
 * belongs to the same button; the light stays on the first name. The names
 * write themselves in as the page opens (hands.tsx). The seam runs the
 * hero's length and stops with it.
 * `id="top"` is where the wordmark links.
 */
export function Hero() {
  return (
    <section
      className={cn("hero", cormorantBold.variable)}
      id="top"
      aria-label={`${people.a.name} and ${people.j.name}`}
    >
      <Seam />
      <h1 className="names">
        <WhoButton who="a" className="name name--a">
          <FullName who="a" />
        </WhoButton>
        <span className="name-amp">
          <span className="gold">&amp;</span>
        </span>
        <WhoButton who="j" className="name name--j">
          <FullName who="j" />
        </WhoButton>
      </h1>
      <p className="hint label across" id="hands-hint">
        {hero.hint}
      </p>
      <div className="picked">
        <div className="picked-in">
          {(["a", "j"] as Who[]).map((who) => (
            <p key={who} className={cn("picked-line", `picked-line--${who}`)}>
              <b className="picked-name">{people[who].name}.</b> {people[who].line}
            </p>
          ))}
        </div>
      </div>
      <p className="lede across">{hero.lede}</p>
      <a className="act" href={hero.cta.href}>
        {hero.cta.label}
      </a>
      <HandsStatus />
    </section>
  );
}

/** First name over last, two lines; the space between them is for screen readers ("Ashan Fernando"). */
function FullName({ who }: { who: Who }) {
  return (
    <>
      <span className="name-first">{people[who].name}</span>{" "}
      <span className="name-last">{people[who].last}</span>
    </>
  );
}
