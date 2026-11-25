import type { Metadata } from "next";
import { PracticeSite } from "@/components/elorro/demos/practice";

export const metadata: Metadata = {
  title: "Brightline Orthodontics · Concept site — Elorro",
  robots: { index: false, follow: false },
};

/**
 * /demos/practice: a made-up orthodontic practice's website, built as a
 * concept for the film's dental walkthrough (the website scene). Nothing on
 * the site links here and search engines are asked to leave it out; the
 * film labels it "Concept site", never client work. video/scripts/
 * film-capture.mjs captures it and src/FilmLoops.tsx scrolls it into
 * public/m/film/practice-site-*.
 */
export default function Page() {
  return <PracticeSite />;
}
