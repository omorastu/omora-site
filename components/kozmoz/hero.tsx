import { hero, people, type Who } from "@/lib/kozmoz";
import { HandsStatus, WhoButton } from "@/components/kozmoz/hands";
import { Seam } from "@/components/kozmoz/seam";
import { cormorantBold } from "@/components/kozmoz/hero-font";
import { cn } from "@/lib/utils";

/**
 * The names on the door, in black, joined by a gold ampersand. Each name is a
 * button: pick one and a band of gold lights under it while that person's
 * line opens under the hint, on their side of the seam. The last name sits
 * under the first, mirrored across the seam (Fernando flush with the start
 * of Ashan, Lopez with the end of Jordan), and belongs to the same button;
 * the light stays on the first name. The pen writes the names in as the page
 * opens (hands.tsx). The seam runs the hero's length and stops with it.
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
      <Nib />
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

/** The gold pen nib that writes the names in, tip down at the point it hangs from. */
function Nib() {
  return (
    <span className="nib" aria-hidden="true">
      <svg viewBox="0 0 20 32" width="20" height="32">
        <defs>
          <linearGradient id="nib-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: "var(--gold-hi)" }} />
            <stop offset=".55" style={{ stopColor: "var(--gold)" }} />
            <stop offset="1" style={{ stopColor: "var(--gold-lo)" }} />
          </linearGradient>
        </defs>
        <path
          d="M10 32C8.6 27 4.4 21.5 3.6 16.6 3 12.8 4.2 9.8 6 8V1h8v7c1.8 1.8 3 4.8 2.4 8.6-.8 4.9-5 10.4-6.4 15.4Z"
          fill="url(#nib-gold)"
        />
        <path className="nib-cut" d="M10 30.6V16.2" strokeWidth="0.9" strokeLinecap="round" />
        <circle className="nib-cut" cx="10" cy="14.6" r="1.7" />
      </svg>
    </span>
  );
}
