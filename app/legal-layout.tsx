import { Page } from "@/components/kozmoz/page";

/**
 * Shared frame for the two legal pages, so they sit in the site's frame and
 * type without each one re-declaring it: a reading page, one left-aligned
 * column, no seam.
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
    <Page>
      <article className="read">
        <header className="read-head">
          <p className="label">Legal</p>
          <h1 className="read-title">{title}</h1>
          <p className="read-date label">Last updated {updated}</p>
        </header>
        {sections.map((s) => (
          <section key={s.heading} className="read-part">
            <h2>{s.heading}</h2>
            <div className="read-body">{s.body}</div>
          </section>
        ))}
      </article>
    </Page>
  );
}
