import type { Metadata } from "next";
import Link from "next/link";
import { hero, workPage } from "@/lib/kozmoz";
import { Page } from "@/components/kozmoz/page";
import { WorkGrid, shownProjects } from "@/components/kozmoz/work";

export const metadata: Metadata = {
  title: "Work — Elorro",
  description:
    "Sites, shoots and tools we've made for businesses around the Bay and beyond, from a vineyard labor company to a dental practice.",
};

/**
 * /work — every project ready to show (lib/kozmoz.ts `projects`, hidden ones
 * skipped), on the home page's cards, two across.
 */
export default function WorkPage() {
  return (
    <Page>
      <div className="work work--page">
        <div className="wrap">
          <h1 className="sec-label label">{workPage.title}</h1>
          <WorkGrid projects={shownProjects()} heading="h2" />
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
