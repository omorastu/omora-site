import Link from "next/link";
import { hero } from "@/lib/elorro";
import { PlayIcon } from "@/components/elorro/marks";

/**
 * The way into the film, between what we do and the work: a band of the
 * film's own black, its poster on one side (Elora's medallion, the gold E in
 * its ring, and the play button) and on the other what it is. Both lead to
 * /film, where it plays.
 */
export function FilmBand() {
  const f = hero.film;
  return (
    <section className="film-band" aria-labelledby="film-band-h">
      <div className="wrap film-band-grid">
        <Link className="film-poster" href={f.href} tabIndex={-1} aria-hidden="true">
          <span className="film-poster-ring">
            <span className="film-poster-e">E</span>
          </span>
          <PlayIcon />
          <span className="film-poster-len label">{f.length}</span>
        </Link>
        <div className="film-band-text">
          <p className="label film-band-eyebrow">{f.eyebrow}</p>
          <h2 className="film-band-h" id="film-band-h">
            {f.title}
          </h2>
          <p className="film-band-note">{f.note}</p>
          <Link className="play play--big" href={f.href}>
            <PlayIcon />
            <span>{f.label}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
