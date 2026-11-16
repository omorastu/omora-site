import Image from "next/image";
import Link from "next/link";
import { hero, people, projects } from "@/lib/elorro";
import { mediaOnDisk } from "@/lib/work-media";
import { ProjectScreen } from "@/components/elorro/work";
import { PlayIcon } from "@/components/elorro/marks";

/**
 * The opening, on the black: the front door the intro used to be. The gold
 * logo, the runners in its R's, and under it what the word means, set like a
 * dictionary's entry ("e·lor·ro, noun: two people who listen first…"); then
 * what we do, in a line, and the two ways in: book a call, or watch the
 * film. Beside it on wide screens (under it on phones), a piece of our own
 * footage playing: the Pearls drone film, in a tall frame.
 *
 * It comes in on its own, quickly, in CSS alone (elorro.css, "the opening"):
 * the logo, then the meaning burning in from left to right as the intro's
 * line did, then the rest. Nothing holds the page meanwhile; under reduced
 * motion it's all simply there. `id="top"` is where the wordmark links.
 */
export function Hero() {
  const d = hero.definition;
  const reel = projects.find((p) => p.name === "Pearls Farm Labor");
  const { media } = mediaOnDisk("Pearls Farm Labor", reel?.serviceMedia);
  return (
    <section className="open" id="top" aria-labelledby="open-h">
      <div className="wrap open-grid">
        <div className="open-text">
          <h1 className="open-logo" id="open-h">
            <Image src="/m/brand/elorro-logo.png" alt={d.word} width={1695} height={287} priority sizes="(max-width: 1023px) 80vw, 38vw" />
            <span className="sr-only">
              , {people.a.name} &amp; {people.j.name}
            </span>
          </h1>
          <p className="define">
            <span className="define-say">{d.say}</span> <span className="define-kind">{d.kind}</span>
          </p>
          <p className="define-meaning">{d.meaning}</p>
          <p className="open-lede">{hero.lede}</p>
          <div className="open-acts">
            <a className="act" href={hero.cta.href}>
              {hero.cta.label}
            </a>
            <Link className="play" href={hero.film.href}>
              <PlayIcon />
              <span>
                {hero.film.label} <span className="play-len">{hero.film.length}</span>
              </span>
            </Link>
          </div>
        </div>
        {media && reel && (
          <div className="open-reel">
            <ProjectScreen media={media} portrait sizes="(max-width: 1023px) 100vw, 30vw" />
            <p className="open-reel-cap label">
              {reel.name} <span aria-hidden="true">·</span> {reel.place}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
