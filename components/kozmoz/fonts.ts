import { Fraunces, Hanken_Grotesk } from "next/font/google";

/*
 * The site's two faces. Every page's root carries both variables (the home
 * page's in app/page.tsx, every other page's in components/kozmoz/page.tsx);
 * kozmoz.css reads them as --font-display and --font-text.
 *
 * Fraunces is loaded variable with its SOFT, WONK and opsz axes: the design
 * leans on all three (soft, wonky names; optical sizes from the 11px labels'
 * neighbours up to the 216px hero), and on in-between weights (350, 380, 450)
 * that a static cut can't give.
 */
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

export const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  weight: ["400", "500", "600"],
  display: "swap",
});
