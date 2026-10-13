import type { Metadata, Viewport } from "next";
import { Libre_Franklin, Cormorant, Inter, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

/*
 * The four families the live site runs on, carried over from V1 unchanged —
 * same families, same weights, same CSS variable names, so the two builds set
 * type identically.
 *
 * Weights are V1's list exactly. Nothing above 700 is loaded, so no utility
 * heavier than font-bold is used anywhere: an 800 would only ever render as a
 * synthesized bold. Headings top out at 700.
 */
const libreFranklin = Libre_Franklin({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const cormorant = Cormorant({
  subsets: ["latin"],
  variable: "--font-logo",
  weight: ["400", "500"],
  display: "swap",
});

// Named --font-inter rather than --font-body: V1's variable name, kept so the
// two configs diff cleanly.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

const SITE = "https://omora.studio";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Omora — You've got a problem. We're the fixers.",
  description:
    "Omora builds websites, AI receptionists, booking systems and sales-intelligence tools for businesses. Tell us the problem, we'll build the fix.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Omora — You've got a problem. We're the fixers.",
    description:
      "Websites, AI agents, booking systems — whatever your business needs, we build it.",
    url: SITE,
    siteName: "Omora",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Omora — You've got a problem. We're the fixers.",
    description:
      "Websites, AI agents, booking systems — whatever your business needs, we build it.",
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
      className={`${libreFranklin.variable} ${cormorant.variable} ${inter.variable} ${plexMono.variable}`}
    >
      <body className="font-body antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-violet focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-bg"
        >
          Skip to content
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
