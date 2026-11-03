import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

/*
 * The display face, loaded once for every page: Cormorant Garamond, the
 * wordmark's family (.wordmark in globals.css, 500) and every heading's
 * (elorro.css points --font-display here; 500 and 600). The text face,
 * Hanken Grotesk, comes with each page's frame (components/elorro/fonts.ts).
 *
 * All the site's fonts are files in app/fonts (Google Fonts' own latin
 * files, so the build never fetches them; README there), declared the way
 * Google's CSS declared them: one variable file serving 500 and 600. Their
 * stand-ins while they load are in globals.css ("fallbacks").
 */
const cormorantGaramond = localFont({
  src: [
    { path: "./fonts/cormorant-garamond-latin-wght.woff2", weight: "500", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-wght.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-logo",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Cormorant Garamond Fallback"],
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
    <html lang="en" className={cormorantGaramond.variable}>
      {/* Each page's frame brings its own skip link, in the site's type. */}
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
