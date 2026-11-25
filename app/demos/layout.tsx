import type { Metadata, Viewport } from "next";

/**
 * /demos: the screens the film plays as its reviews, booking, front desk,
 * one entry and tool demos (components/elorro/demos/), and the concept site
 * a practice's walkthrough shows (/demos/practice, a made-up practice). App
 * screens and a concept, not site pages: no Elorro header or footer, nothing
 * on the site links here, and search engines are asked to leave them out.
 * Every demo is labelled Demo, the concept site says it's a concept, and the
 * data is made up.
 */
export const metadata: Metadata = {
  title: "Demo — Elorro",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: "#F5F6F8" };

export default function DemosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
