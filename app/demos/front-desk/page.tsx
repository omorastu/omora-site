import type { Metadata } from "next";
import { FrontDeskDemo } from "@/components/elorro/demos/front-desk";
import { asDemoIndustry } from "@/components/elorro/demos/data";

export const metadata: Metadata = { title: "Demo · Front desk — Elorro", robots: { index: false, follow: false } };

/** /demos/front-desk?for=winery|dental|contractor|general (&capture: still, for video/scripts/demos.mjs). */
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  return <FrontDeskDemo ind={asDemoIndustry(typeof q.for === "string" ? q.for : undefined)} capture={"capture" in q} />;
}
