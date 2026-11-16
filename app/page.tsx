import { Header } from "@/components/elorro/header";
import { Hero } from "@/components/elorro/hero";
import { Us } from "@/components/elorro/us";
import { Services } from "@/components/elorro/services";
import { FilmBand } from "@/components/elorro/film-band";
import { Work } from "@/components/elorro/work";
import { HowItStarts } from "@/components/elorro/how";
import { Faq } from "@/components/elorro/faq";
import { Contact } from "@/components/elorro/contact";
import { Footer } from "@/components/elorro/footer";
import { hanken } from "@/components/elorro/fonts";
import "@/components/elorro/elorro.css";
import type { Viewport } from "next";

/** The page opens on the black: the browser's chrome starts there too. */
export const viewport: Viewport = { themeColor: "#0C0A08" };

/**
 * The home page, as the two of us would walk an owner through it: the door
 * (the logo and what Elorro means, on the black), then who you'd be talking
 * to, what we do, the film, the work, how it starts, the questions people
 * ask before the call, and the call itself, back on the black. Each chapter
 * is marked the same way, its name between two fine gold rules. Styles in
 * components/elorro/elorro.css, copy and data in lib/elorro.ts.
 */
export default function Home() {
  return (
    <div className={`elo elo-home ${hanken.variable}`}>
      <a className="skip label" href="#main">
        Skip to content
      </a>
      <Header home />
      <main id="main">
        <Hero />
        <Us n="01" />
        <Services n="02" />
        <FilmBand />
        <Work n="03" />
        <HowItStarts n="04" />
        <Faq n="05" />
        <Contact n="06" />
      </main>
      <Footer />
    </div>
  );
}
