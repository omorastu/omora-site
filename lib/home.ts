/**
 * Copy and data for the home page (v3 layout, ported from
 * design/homepage-v3-mockup.html — spec in docs/layout.md).
 *
 * Same rule as lib/content.ts: everything a non-developer might want to change
 * lives here rather than inside the components. Copy is the mockup's, word for
 * word. Every image and video slot is unset until the shoot; an unset slot
 * renders as a labelled placeholder, never a stock image.
 */

import type { MediaAsset } from "@/lib/media";

/* ── Hero ─────────────────────────────────────────────────────────────── */

export const hero = {
  eyebrow: "Bay Area · Websites, media & systems",
  title: "Your entire online presence. Handled.",
  lede:
    "Websites, AI call answering, booking systems, and the media and ads around them. Built for local businesses, by one team.",
  primary: { label: "Start a project", href: "#contact" },
  secondary: { label: "See what we do", href: "#services" },
  /** The work reel, full width under the hero. Looping video or a hero image. */
  reel: undefined as MediaAsset | undefined,
};

/* ── Team video ───────────────────────────────────────────────────────── */

export const teamVideo = {
  eyebrow: "Meet the team",
  title: "Two minutes on how we work",
  lede: "Who we are, what we build, and what working with us actually looks like.",
  /** Ashan & Jordan to camera. Has a voice track, so it gets controls, not autoplay. */
  video: undefined as MediaAsset | undefined,
};

/* ── What we do ───────────────────────────────────────────────────────── */

export type HomeService = {
  title: string;
  body: string;
  /**
   * Where "Learn more" goes. Only Websites has its own page today; the other
   * three buckets point at the services index until theirs exist.
   */
  href: string;
  image?: MediaAsset;
  /** What the image slot is waiting for. */
  slotLabel: string;
};

export const whatWeDo = {
  eyebrow: "What we do",
  title: "Four ways we show up for a business",
  all: { label: "View all services →", href: "/services" },
  items: [
    {
      title: "Websites",
      body: "The site itself, built to turn visitors into inquiries. Fast, clean, yours day one.",
      href: "/services/websites",
      slotLabel: "Websites image",
    },
    {
      title: "Media & content",
      body: "Photo, video, scripts and the posts that go with them. Shot and edited in house.",
      href: "/services",
      slotLabel: "Media & content image",
    },
    {
      title: "Traffic & ads",
      body: "Getting the right people to the site. Paid, local search, and the tracking to prove it.",
      href: "/services",
      slotLabel: "Traffic & ads image",
    },
    {
      title: "Smart systems",
      body: "Call answering, follow-up, booking, lead finding, and the internal tools that kill duplicate work.",
      href: "/services",
      slotLabel: "Smart systems image",
    },
  ] satisfies HomeService[],
  /** The specifics inside the four buckets, as a chip row under the cards. */
  also: [
    "Call answering",
    "CRM follow-up",
    "Booking systems",
    "Lead research",
    "Internal tools",
    "E-commerce",
  ],
};

/* ── About ────────────────────────────────────────────────────────────── */

export const about = {
  eyebrow: "About us",
  title: "A small team out of the East Bay",
  paragraphs: [
    "We build the websites, make the media, and wire up the systems that run behind them. Most shops do one of those and hand you off for the rest.",
    "You own the code, the domain and the data from day one.",
  ],
  photo: undefined as MediaAsset | undefined,
};

/* ── Recent work ──────────────────────────────────────────────────────── */

/**
 * One card in the Recent Work strip.
 *
 * docs/layout.md: every project needs a real screenshot and a real result
 * number — no filler copy. So every field but the category is optional, and
 * a missing one prints as a marked placeholder rather than invented text.
 * Fill a card in by setting its fields; the layout doesn't change.
 */
export type RecentProject = {
  category: string;
  name?: string;
  /** One line on what the thing is. Sits under the name, above Problem. */
  description?: string;
  problem?: string;
  built?: string;
  /** Carries the number. */
  result?: string;
  screenshot?: MediaAsset;
  /** Case-study link, once one exists. Falls back to the Work page. */
  href?: string;
};

export const recentWork = {
  title: "Recent work",
  all: { label: "See all projects →", href: "/work" },
  /** The per-card link. Cards with no `href` of their own fall back to `all`. */
  learnMore: "Learn more →",
  items: [
    {
      category: "Smart systems",
      name: "Clinical Scribe",
      description:
        "A consult capture and follow-up system for an orthodontic practice.",
      problem: "A consult happened in a room, and nothing about it survived the room.",
      built: "Records the consult, drafts both letters from it, and gives the coordinator follow-up she can send.",
      result: "Every consult now leaves a record the practice can actually look at.",
      href: "/work/clinical-scribe",
    },
    { category: "Websites" },
    { category: "Media & content" },
  ] as RecentProject[],
};

/* ── Contact ──────────────────────────────────────────────────────────── */

export const contact = {
  eyebrow: "Get in touch",
  title: "Tell us the problem",
  lede: "We'll come back with what we'd do about it and what it costs. No pitch deck.",
  textLabel: "Rather text?",
  /**
   * The text-us number. Unset until there's one that's actually answered;
   * the slot prints a placeholder until then rather than a fake number.
   */
  phone: undefined as string | undefined,
  submit: "Start the project",
};
