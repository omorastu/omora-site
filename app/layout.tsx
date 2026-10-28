import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

/*
 * Every page runs on the home page's two faces, which its frame loads
 * (components/kozmoz/fonts.ts). The one face loaded here is the wordmark's:
 * the OMORA mark is Cormorant Garamond 500 (see .wordmark in globals.css),
 * and it is the only thing --font-logo sets.
 */
const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-logo",
  weight: ["500"],
  display: "swap",
});

const SITE = "https://omora.studio";

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

// One ink on paper, every page: the browser chrome matches the paper.
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
