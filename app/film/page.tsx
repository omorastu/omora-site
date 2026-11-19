import type { Metadata } from "next";
import { Page } from "@/components/elorro/page";
import { Contact } from "@/components/elorro/contact";
import { FilmLauncher } from "@/components/elorro/film/film";

/**
 * /film: "How we work", the short film narrated by Elora, on a page of its
 * own for review. Nothing on the site links here yet, and search engines are
 * asked to leave it out. The film's "Book a call" brings the visitor down to
 * this page's contact section, as it will wherever the film ends up.
 */
export const metadata: Metadata = {
  title: "How we work — Elorro",
  description: "Meet Ashan and Jordan and see how Elorro builds websites, shoots photo and video, and makes booking and follow-up easier.",
  robots: { index: false, follow: false },
};

export default function FilmPage() {
  return (
    <Page local={["#contact"]}>
      <header className="cs-head">
        <div className="wrap">
          <div className="cs-intro">
            <p className="cs-eyebrow label">A short film</p>
            <h1 className="cs-title">How we work.</h1>
            <p className="cs-sub">
              Pick your business to see how Ashan and Jordan can help with your website, photos and video,
              or the calls and bookings that come in.
            </p>
            <FilmLauncher label="Watch how we work" />
          </div>
        </div>
      </header>
      <Contact source="elorro.com/film" />
    </Page>
  );
}
