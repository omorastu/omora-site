import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";

/**
 * Shared shell for the two legal pages, so they inherit the v2 palette and
 * chrome without each one re-declaring it.
 */
export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: { heading: string; body: React.ReactNode }[];
}) {
  return (
    <>
      <Nav />
      <main id="main" className="layer mx-auto max-w-wrap px-6 pb-24 pt-32 sm:pt-40">
        <p className="plate">Legal</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tightest text-ink sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 font-mono text-[11px] text-muted/60">Last updated {updated}</p>
        <div className="rule mt-8 max-w-[8rem]" />

        <div className="mt-12 max-w-prose space-y-10">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                {s.heading}
              </h2>
              <div className="mt-3 text-pretty leading-relaxed text-muted">{s.body}</div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
