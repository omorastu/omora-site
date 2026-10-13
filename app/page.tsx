import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { HomeHero } from "@/components/home/hero";
import { Leak } from "@/components/home/leak";
import { HomeServices } from "@/components/home/services";
import { Work } from "@/components/home/work";
import { Founders } from "@/components/home/founders";
import { HomeTeam } from "@/components/home/team";
import { HomeTestimonials } from "@/components/home/testimonials";
import { HomePricing } from "@/components/home/pricing";
import { Contact } from "@/components/home/contact";

/**
 * The home page, v3 layout — ported from design/homepage-v3-mockup.html.
 *
 * Dark throughout, with one exception: the founders' letter is the page's one
 * cream section, and it carries the `data-light-zone` marker the nav watches.
 * Sections run in the order a visitor needs them — the problem, the four
 * fixes, the proof, the people, what it costs, the ticket.
 *
 * Section components live in components/home/. Copy and the page's own slots
 * live in lib/home.ts; the shared datasets (services, projects, testimonials,
 * pricing, team) are read from their own files.
 */
export default function Home() {
  return (
    <>
      <Nav />
      <main id="main" className="relative">
        <span id="top" />
        <HomeHero />
        <Leak />
        <HomeServices />
        <Work />
        <Founders />
        <HomeTeam />
        <HomeTestimonials />
        <HomePricing />
        <Contact />
      </main>
      <Footer />

      {/* Above every background, below the nav. */}
      <div className="grain" aria-hidden="true" />
    </>
  );
}
