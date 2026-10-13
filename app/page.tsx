import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { HomeHero } from "@/components/home/hero";
import { TeamVideo } from "@/components/home/team-video";
import { HomeServices } from "@/components/home/services";
import { About } from "@/components/home/about";
import { Work } from "@/components/home/work";
import { Contact } from "@/components/home/contact";

/**
 * The home page, v3 layout — ported from design/homepage-v3-mockup.html, spec
 * in docs/layout.md.
 *
 * Dark throughout. Sections run hero and reel, team video, what we do, about,
 * recent work, contact. Section components live in components/home/; copy
 * and slots live in lib/home.ts.
 */
export default function Home() {
  return (
    <>
      <Nav />
      <main id="main" className="relative">
        <span id="top" />
        <HomeHero />
        <TeamVideo />
        <HomeServices />
        <About />
        <Work />
        <Contact />
      </main>
      <Footer />

      {/* Above every background, below the nav. */}
      <div className="grain" aria-hidden="true" />
    </>
  );
}
