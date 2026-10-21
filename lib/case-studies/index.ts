/**
 * Case studies — the long form behind a Recent work card.
 *
 * One data file per study in this folder, each a `CaseStudy` (see ./types).
 * app/work/[slug] renders every study listed below through the one template in
 * components/work/case-study.tsx. Adding a study is a new data file and its
 * line in `caseStudies` — no page file, no markup.
 */

import type { CaseStudy } from "@/lib/case-studies/types";
import { clinicalScribe } from "@/lib/case-studies/clinical-scribe";

export type { CaseShot, CaseStep, CaseStudy } from "@/lib/case-studies/types";

export const caseStudies: CaseStudy[] = [clinicalScribe];

/** The study served at /work/<slug>, or undefined if there isn't one. */
export function caseStudyFor(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
