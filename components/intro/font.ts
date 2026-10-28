import { Cormorant_Garamond } from "next/font/google";

/**
 * The intro's italic: the wordmark's family (Cormorant Garamond, loaded
 * upright in app/layout.tsx as --font-logo), in its italic cut. Loaded here so
 * only the page that shows the intro downloads it.
 */
export const cormorantItalic = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500"],
  style: ["italic"],
  variable: "--font-intro-italic",
  display: "swap",
});
