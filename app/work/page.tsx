import type { Metadata } from "next";
import { projects } from "@/lib/projects";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { Closing } from "@/components/site/closing";
import { SectionHead } from "@/components/site/section-head";
import { WorkGrid } from "@/components/site/work-grid";

export const metadata: Metadata = {
  title: "Work — Omora",
  description:
    "Everything we've built: websites, AI receptionists, booking systems and custom platforms.",
};

/**
 * /work — the full portfolio, one page.
 *
 * No per-project detail routes: every project's story fits on its card, and a
 * detail page with nothing but a screenshot and two sentences is worse than no
 * page. The filtering lives in WorkGrid, which is the only client bit here.
 */
export default function Work() {
  return (
    <>
      <Nav />
      <main id="main" className="relative">
        <section className="layer px-6 pb-[120px] pt-40 sm:pt-48">
          <div className="mx-auto max-w-wrap">
            <p className="plate">Work</p>
            <h1 className="mt-4 max-w-[18ch] font-display text-[clamp(2.4rem,6vw,4.5rem)] font-bold leading-[0.98] tracking-tightest text-ink">
              Everything we&rsquo;ve built.
            </h1>
            <p className="mt-6 max-w-prose text-pretty text-lg leading-relaxed text-muted">
              {projects.length} builds — websites, voice agents, booking flows,
              and a few things that don&rsquo;t fit a category. Filter by what
              you&rsquo;re looking for.
            </p>
          </div>
        </section>

        <div
          data-light-zone
          className="border-t border-[rgba(123,92,176,0.35)] bg-cream"
        >
          <section className="layer px-6 pb-[100px] pt-[100px] sm:pb-32">
            <div className="mx-auto max-w-wrap">
              <SectionHead
                plate="Portfolio"
                title="What's shipped, and what's in the shop."
                intro="Client work, live and in progress. Where there's a public URL, it's linked."
              />
              <WorkGrid items={projects} />
            </div>
          </section>
        </div>

        <Closing />
      </main>
      <Footer />

      <div className="grain" aria-hidden="true" />
    </>
  );
}
