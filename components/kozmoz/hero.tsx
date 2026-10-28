import { hero, people } from "@/lib/kozmoz";
import { HandsStatus, WhoButton } from "@/components/kozmoz/hands";

/**
 * The names on the door. Each name is a button: pick one to see what that
 * person does across the page. `id="top"` is where the wordmark links.
 */
export function Hero() {
  return (
    <section className="hero" id="top" aria-label={`${people.a.name} and ${people.j.name}`}>
      <h1 className="names">
        <WhoButton who="a" className="name name--a">
          {people.a.name}
        </WhoButton>
        <span className="name-amp">&amp;</span>
        <WhoButton who="j" className="name name--j">
          {people.j.name}
        </WhoButton>
      </h1>
      <p className="hint label across" id="hands-hint">
        {hero.hint}
      </p>
      <p className="lede across">{hero.lede}</p>
      <a className="act" href={hero.cta.href}>
        {hero.cta.label}
      </a>
      <HandsStatus />
    </section>
  );
}
