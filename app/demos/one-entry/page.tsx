import type { Metadata } from "next";
import { OneEntryDemo } from "@/components/elorro/demos/one-entry";
import { asDemoIndustry } from "@/components/elorro/demos/data";

export const metadata: Metadata = { title: "Demo · One entry — Elorro", robots: { index: false, follow: false } };

/** /demos/one-entry?for=winery|dental|contractor|general (&capture: still, for video/scripts/demos.mjs). */
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  return <OneEntryDemo ind={asDemoIndustry(typeof q.for === "string" ? q.for : undefined)} capture={"capture" in q} />;
}
