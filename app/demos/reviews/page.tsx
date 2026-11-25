import type { Metadata } from "next";
import { ReviewsDemo } from "@/components/elorro/demos/reviews";
import { asDemoIndustry } from "@/components/elorro/demos/data";

export const metadata: Metadata = { title: "Demo · Reviews — Elorro", robots: { index: false, follow: false } };

/** /demos/reviews?for=winery|dental|contractor|general (&capture: still, for video/scripts/demos.mjs). */
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  return <ReviewsDemo ind={asDemoIndustry(typeof q.for === "string" ? q.for : undefined)} capture={"capture" in q} />;
}
