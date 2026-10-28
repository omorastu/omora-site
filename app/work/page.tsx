import type { Metadata } from "next";
import Link from "next/link";
import { hero, workPage } from "@/lib/kozmoz";
import { Page } from "@/components/kozmoz/page";
import { ProjectCard, shownProjects } from "@/components/kozmoz/work";

export const metadata: Metadata = {
  title: "Work — Elorro",
  description:
    "Sites, shoots and tools we've made for businesses around the Bay and beyond, from a vineyard labor company to a dental practice.",
};

/**
 * /work — every project ready to show (lib/kozmoz.ts `projects`, hidden ones
 * skipped), on the same card as the home page's Work.
 */
export default function WorkPage() {
  return (
    <Page seam>
      <header className="page-head">
        <h1 className="page-title label across">{workPage.title}</h1>
      </header>

      <div className="work work--page">
        {shownProjects().map((p) => (
          <ProjectCard key={p.name} project={p} heading="h2" />
        ))}
      </div>

      <div className="page-end">
        <Link className="act" href={`/${hero.cta.href}`}>
          {hero.cta.label}
        </Link>
      </div>
    </Page>
  );
}
