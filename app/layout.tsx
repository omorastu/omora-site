import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

/*
 * The display face, loaded once for every page: Elorro Display, our own
 * (Cormorant Garamond with its O, R, E, L and ampersand redrawn; built by
 * design/type/build.py). It sets the wordmark (.wordmark in globals.css)
 * and every heading (elorro.css points --font-display here): its Regular at
 * 500, its SemiBold at 600. The text face, Hanken Grotesk, comes with each
 * page's frame (components/elorro/fonts.ts).
 *
 * All the site's fonts are files in app/fonts (README there), so the build
 * never fetches them. Both files here are preloaded; until they arrive the
 * text is set in a stand-in sized to them (globals.css, "fallbacks"), so
 * the headings don't move when they swap in.
 */
const elorroDisplay = localFont({
  src: [
    { path: "./fonts/elorro-display-regular.woff2", weight: "500", style: "normal" },
    { path: "./fonts/elorro-display-semibold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-logo",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Elorro Display Fallback"],
});

// Absolute base for link previews (og:image etc.). Uses the live Vercel URL
// when deployed there; switch NEXT_PUBLIC_SITE_URL to the real domain later.
const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://elorro.com");

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Elorro | Ashan & Jordan",
  description:
    "Two people who build websites, shoot the photo and video, and set up call answering and booking for local businesses. You talk to the people doing the work.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Elorro | Ashan & Jordan",
    description:
      "Two people who build websites, shoot the photo and video, and set up call answering and booking for local businesses. You talk to the people doing the work.",
    url: SITE,
    siteName: "Elorro",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elorro | Ashan & Jordan",
    description:
      "Two people who build websites, shoot the photo and video, and set up call answering and booking for local businesses. You talk to the people doing the work.",
  },
};

// The browser chrome matches the paper every page is set on (elorro.css).
// The home page's intro darkens it while it shows (components/intro/intro.tsx).
export const viewport: Viewport = {
  themeColor: "#F4F1EA",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={elorroDisplay.variable}>
      {/* Each page's frame brings its own skip link, in the site's type. */}
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
