import type { Metadata } from "next";
import { Page } from "@/components/elorro/page";
import { Contact } from "@/components/elorro/contact";
import { FilmDoor } from "@/components/elorro/film/film";

/**
 * /film: "How we work", the short film narrated by Elora, on a page of its
 * own for review. It opens on the way in, over the whole page: the home
 * page's intro, then a door, whose tap starts the film. Nothing on the site
 * links here yet, and search engines are asked to leave it out. The film's
 * "Book a call" puts the film away and brings the visitor down to this
 * page's contact section; the button here brings the door back.
 */
export const metadata: Metadata = {
  title: "How we work — Elorro",
  description: "Meet Ashan and Jordan and see how Elorro builds websites, shoots photo and video, and makes booking and follow-up easier.",
  robots: { index: false, follow: false },
};

/**
 * Runs as the page is parsed, before its first paint: unless the link opens
 * the film straight away for review (?at=, without &play), the page stays
 * dark (film.css, html.way-boot) until the way in is up over it, as the home
 * page's intro is there from its first paint. FilmWay takes the class off;
 * should the page's script never get that far, it goes by itself.
 */
const WAY_BOOT = `(function(){var q=location.search;if(/[?&]at=/.test(q)&&!/[?&]play(=|&|$)/.test(q))return;var h=document.documentElement;h.classList.add("way-boot");setTimeout(function(){h.classList.remove("way-boot")},5000)})();`;

export default function FilmPage() {
  return (
    <Page local={["#contact"]}>
      <script dangerouslySetInnerHTML={{ __html: WAY_BOOT }} />
      <header className="cs-head">
        <div className="wrap">
          <div className="cs-intro">
            <p className="cs-eyebrow label">A short film</p>
            <h1 className="cs-title">How we work.</h1>
            <p className="cs-sub">
              See how Ashan and Jordan can help your business with your website, photos and video, and the calls and
              bookings that come in. About two minutes, with sound.
            </p>
            <FilmDoor label="Watch the film" />
          </div>
        </div>
      </header>
      <Contact source="elorro.com/film" />
    </Page>
  );
}
