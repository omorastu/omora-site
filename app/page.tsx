import { Hands } from "@/components/kozmoz/hands";
import { Header } from "@/components/kozmoz/header";
import { Hero } from "@/components/kozmoz/hero";
import { Us } from "@/components/kozmoz/us";
import { Services } from "@/components/kozmoz/services";
import { Work } from "@/components/kozmoz/work";
import { Contact } from "@/components/kozmoz/contact";
import { Footer } from "@/components/kozmoz/footer";
import { Intro } from "@/components/intro/intro";
import { fraunces, hanken } from "@/components/kozmoz/fonts";
import "@/components/kozmoz/kozmoz.css";

/**
 * The home page — Omora, "Names on the door". Rebuilt from the live preview
 * at omora-a.vercel.app; styles in components/kozmoz/kozmoz.css, copy and
 * data in lib/kozmoz.ts.
 *
 * Sections run hero, us, what we do, work, contact: the hero across the seam,
 * the rest on one left-aligned grid below it. The other pages share its
 * header, footer and type through components/kozmoz/page.tsx; this one builds
 * its own frame, because its root is also the "pick a name" toggle.
 */

export default function Home() {
  return (
    <>
      <Intro />
      <Hands className={`${fraunces.variable} ${hanken.variable}`}>
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

        {/* With scripting off nothing will run the names' entrance, so show them now. */}
        <noscript>
          <style>
            {".kz:not(.is-in) .name, .kz:not(.is-in) .name-amp { opacity: 1; animation: none; }"}
          </style>
        </noscript>
      </Hands>
    </>
  );
}
