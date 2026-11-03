import { Hands } from "@/components/elorro/hands";
import { Trail } from "@/components/elorro/trail";
import { Header } from "@/components/elorro/header";
import { Hero } from "@/components/elorro/hero";
import { Us } from "@/components/elorro/us";
import { Services } from "@/components/elorro/services";
import { Work } from "@/components/elorro/work";
import { Contact } from "@/components/elorro/contact";
import { Footer } from "@/components/elorro/footer";
import { Intro } from "@/components/intro/intro";
import { hanken } from "@/components/elorro/fonts";
import "@/components/elorro/elorro.css";

/**
 * The home page — Elorro, "Names on the door". Styles in
 * components/elorro/elorro.css, copy and data in lib/elorro.ts.
 *
 * Sections run hero, us, what we do, work, contact: the hero across the seam,
 * the rest on one left-aligned grid below it, all on the paper, edge to
 * edge. The other pages share its header, footer and type through
 * components/elorro/page.tsx; this one builds its own frame, because its
 * root is also the "pick a name" toggle.
 */

export default function Home() {
  return (
    <>
      <Intro />
      <Hands className={hanken.variable}>
        <a className="skip label" href="#main">
          Skip to content
        </a>
        <Header home />
        <main id="main">
          <Hero />
          <Us />
          <Services />
          <Work />
          <Contact />
        </main>
        <Footer />
        <Trail />

        {/* With scripting off nothing will run the hero's entrance, so show it all now. */}
        <noscript>
          <style>
            {".elo:not(.is-in) :is(.name, .name-amp, .hero .hint, .lede, .hero > .act) { opacity: 1; animation: none; }"}
          </style>
        </noscript>
      </Hands>
    </>
  );
}
