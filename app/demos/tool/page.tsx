import type { Metadata } from "next";
import { ToolDemo } from "@/components/elorro/demos/tool";
import { asToolIndustry } from "@/components/elorro/demos/data";

export const metadata: Metadata = { title: "Demo · A tool of your own — Elorro", robots: { index: false, follow: false } };

/**
 * /demos/tool?for=winery|contractor|general (&capture: still, for
 * video/scripts/demos.mjs). A practice's tool is Clinical Scribe, so there's
 * no dental one: for=dental shows the general version.
 */
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  return <ToolDemo ind={asToolIndustry(typeof q.for === "string" ? q.for : undefined)} capture={"capture" in q} />;
}
