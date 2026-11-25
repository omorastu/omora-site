import type { Metadata } from "next";
import { BookingDemo } from "@/components/elorro/demos/booking";
import { asDemoIndustry } from "@/components/elorro/demos/data";

export const metadata: Metadata = { title: "Demo · Booking — Elorro", robots: { index: false, follow: false } };

/** /demos/booking?for=winery|dental|contractor|general (&capture: still, for video/scripts/demos.mjs). */
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  return <BookingDemo ind={asDemoIndustry(typeof q.for === "string" ? q.for : undefined)} capture={"capture" in q} />;
}
