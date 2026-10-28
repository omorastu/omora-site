import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { caseStudies, caseStudyFor } from "@/lib/case-studies";
import { CaseStudyPage } from "@/components/work/case-study";

/**
 * /work/<slug> — one route for every case study.
 *
 * `generateStaticParams` prerenders each study at build time, so these are
 * static pages with one template behind them — adding a study is a data file
 * in lib/case-studies/ and nothing else here.
 */
export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

/** Anything not in the case-study list is a 404, not an empty page. */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = caseStudyFor(slug);
  if (!study) return {};

  return {
    title: `${study.name} — Elorro`,
    description: study.description,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = caseStudyFor(slug);
  if (!study) notFound();

  return <CaseStudyPage study={study} />;
}
