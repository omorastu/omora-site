import type { Metadata } from "next";
import Link from "next/link";
import { hero, services, workPage, type Service } from "@/lib/elorro";
import { Page } from "@/components/elorro/page";
import { WorkGrid, projectsFor } from "@/components/elorro/work";

export const metadata: Metadata = {
  title: "Work — Elorro",
  description:
    "Sites, shoots and tools we've made for businesses around the Bay and beyond, from a vineyard labor company to an orthodontic practice.",
};

/**
 * /work — every project ready to show (lib/elorro.ts `projects`, hidden ones
 * skipped), grouped by service, each group in its service's own order, on the
 * home page's cards, two across. Under the page's title, a row of links to
 * the groups. Each group's heading is its service's title, without the
 * title's full stop.
 */
const groupName = (s: Service) => s.title.replace(/\.$/, "");

export default function WorkPage() {
  return (
    <Page>
      <div className="work work--page">
        <div className="wrap">
          <h1 className="sec-label label">{workPage.title}</h1>
          <nav aria-label={workPage.jump}>
            <ul className="more work-jump">
              {services.map((s) => (
                <li key={s.slug}>
                  <a href={`#${s.slug}`}>{groupName(s)}</a>
                </li>
              ))}
            </ul>
          </nav>
          {services.map((s) => (
            <section key={s.slug} className="work-group" id={s.slug} aria-labelledby={`${s.slug}-h`}>
              <h2 className="sec-h work-group-h" id={`${s.slug}-h`}>
                {groupName(s)}
              </h2>
              <WorkGrid projects={projectsFor(s.slug)} />
            </section>
          ))}
          <p className="page-end">
            <Link className="act" href={`/${hero.cta.href}`}>
              {hero.cta.label}
            </Link>
          </p>
        </div>
      </div>
    </Page>
  );
}
