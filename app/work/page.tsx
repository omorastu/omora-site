import type { Metadata } from "next";
import Link from "next/link";
import { hero, services, workPage, type Service } from "@/lib/elorro";
import { Page } from "@/components/elorro/page";
import { ChapterMark } from "@/components/elorro/marks";
import { WorkGrid, projectsFor } from "@/components/elorro/work";

export const metadata: Metadata = {
  title: "Work — Elorro",
  description:
    "Sites, shoots and tools we've made for businesses around the Bay and beyond, from a vineyard labor company to an orthodontic practice.",
};

/**
 * /work — every project ready to show (lib/elorro.ts `projects`, hidden ones
 * skipped), grouped by service, each group in its service's own order, as
 * the home page's pieces. Under the page's title, the groups as a short
 * contents list; each group is marked as the home page's chapters are, by
 * its service's name, without the title's full stop.
 */
const groupName = (s: Service) => s.title.replace(/\.$/, "");

export default function WorkPage() {
  return (
    <Page>
      <header className="page-head">
        <div className="wrap">
          <h1 className="page-title">{workPage.title}</h1>
          <nav aria-label={workPage.jump}>
            <ol className="contents">
              {services.map((s, i) => (
                <li key={s.slug}>
                  <a href={`#${s.slug}`}>
                    <span className="contents-n" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {groupName(s)}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </header>
      {services.map((s, i) => (
        <section key={s.slug} className="work-group chap" id={s.slug} aria-labelledby={`${s.slug}-h`}>
          <div className="wrap">
            <ChapterMark n={String(i + 1).padStart(2, "0")} label={groupName(s)} id={`${s.slug}-h`} />
            <WorkGrid projects={projectsFor(s.slug)} />
          </div>
        </section>
      ))}
      <p className="page-end">
        <Link className="act" href={`/${hero.cta.href}`}>
          {hero.cta.label}
        </Link>
      </p>
    </Page>
  );
}
