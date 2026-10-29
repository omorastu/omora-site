import { Hanken_Grotesk } from "next/font/google";

/*
 * The site's text face, for running text, labels, fields and buttons. Every
 * page's root carries its variable (the home page's in app/page.tsx, every
 * other page's in components/kozmoz/page.tsx); kozmoz.css reads it as
 * --font-text and --font-label. The display face, Cormorant Garamond, is
 * loaded once for the whole site in app/layout.tsx.
 */
export const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  weight: ["400", "500", "600"],
  display: "swap",
});
