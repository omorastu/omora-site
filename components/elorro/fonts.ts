import localFont from "next/font/local";

/*
 * The site's text face, for running text, labels, fields and buttons. Every
 * page's root carries its variable (the home page's in app/page.tsx, every
 * other page's in components/elorro/page.tsx); elorro.css reads it as
 * --font-text and --font-label. The display face, Cormorant Garamond, is
 * loaded once for the whole site in app/layout.tsx. One variable file in
 * app/fonts serves all three weights, as Google's CSS had it; its stand-in
 * while it loads is in globals.css ("fallbacks").
 */
export const hanken = localFont({
  src: [
    { path: "../../app/fonts/hanken-grotesk-latin-wght.woff2", weight: "400", style: "normal" },
    { path: "../../app/fonts/hanken-grotesk-latin-wght.woff2", weight: "500", style: "normal" },
    { path: "../../app/fonts/hanken-grotesk-latin-wght.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-hanken",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Hanken Grotesk Fallback"],
});
