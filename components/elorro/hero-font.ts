import { Cormorant_Garamond } from "next/font/google";

/**
 * The hero's last names: the display family (Cormorant Garamond, loaded at
 * 500 and 600 in app/layout.tsx as --font-logo) in its bold, 700. Loaded
 * here so only the home page, the one page that sets them, downloads it.
 */
export const cormorantBold = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-display-bold",
  display: "swap",
});
