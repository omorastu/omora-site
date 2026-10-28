import type { Metadata, Viewport } from "next";
import { Libre_Franklin, Cormorant_Garamond, Inter, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

/*
 * The four families the inner pages run on, carried over from V1 — same
 * weights, same CSS variable names. The one change is the wordmark face: the
 * KOZMOZ mark is Cormorant Garamond 500 (see .wordmark in globals.css), and
 * it is the only thing --font-logo sets. The home page loads its own two
 * faces on top (components/kozmoz/fonts.ts).
 *
 * Weights are V1's list exactly. Nothing above 700 is loaded, so no utility
 * heavier than font-bold is used anywhere: an 800 would only ever render as a
 * synthesized bold. Headings top out at 700.
 */
const libreFranklin = Libre_Franklin({
  subsets: ["latin"],
  // Inner pages only: not preloaded, so the home page doesn't fetch it.
  preload: false,
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-logo",
  weight: ["500"],
  display: "swap",
});

// Named --font-inter rather than --font-body: V1's variable name, kept so the
// two configs diff cleanly.
const inter = Inter({
  subsets: ["latin"],
  // Inner pages only: not preloaded, so the home page doesn't fetch it.
  preload: false,
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  // Inner pages only: not preloaded, so the home page doesn't fetch it.
  preload: false,
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

const SITE = "https://omora.studio";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Kozmoz | Ashan & Jordan",
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
    title: "Kozmoz | Ashan & Jordan",
    description:
      "Two people who build websites, shoot the photo and video, and set up call answering and booking for local businesses. You talk to the people doing the work.",
    url: SITE,
    siteName: "Kozmoz",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kozmoz | Ashan & Jordan",
    description:
      "Two people who build websites, shoot the photo and video, and set up call answering and booking for local businesses. You talk to the people doing the work.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D0908",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${libreFranklin.variable} ${cormorantGaramond.variable} ${inter.variable} ${plexMono.variable}`}
    >
      <body className="font-body antialiased">
        {/* skip-link: the home page hides this one and renders its own, in its own type. */}
        <a
          href="#main"
          className="skip-link sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-violet focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-bg"
        >
          Skip to content
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
