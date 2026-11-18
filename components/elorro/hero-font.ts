import localFont from "next/font/local";

/**
 * The hero's last names: the display family (Elorro Display, loaded at 500
 * and 600 in app/layout.tsx as --font-logo) in its Bold, 700. Loaded here
 * so only the home page, the one page that sets them, downloads it. Its
 * stand-in while it loads is the layout's (globals.css, "fallbacks").
 */
export const displayBold = localFont({
  src: "../../app/fonts/elorro-display-bold.woff2",
  weight: "700",
  style: "normal",
  variable: "--font-display-bold",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Elorro Display Fallback"],
});
