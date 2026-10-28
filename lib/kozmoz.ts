/**
 * Copy and data for the Kozmoz home page — the "Names on the door" design,
 * rebuilt from the live preview at omora-a.vercel.app.
 *
 * Same rule as lib/home.ts: everything a non-developer might want to change
 * lives here rather than inside the components. Copy is the preview's, word
 * for word, apart from the studio name.
 *
 * The page is built around two people. Anything that belongs to one of them
 * carries their key ("a" or "j") and sits on their side of the seam; anything
 * shared is "both" and crosses it.
 */

export type Who = "a" | "j";

export const brand = {
  name: "Kozmoz",
  /** The two rings — Ashan's brass, Jordan's cyan. The page's two inks come from it. */
  mark: "/m/brand/mark-192.png",
  email: "studio.omora@gmail.com",
  where: "East Bay & Suisun Valley",
};

/* ── The two people ───────────────────────────────────────────────────── */

export type Person = {
  name: string;
  initial: string;
  /** What they do, after their name. */
  line: string;
  /**
   * Portrait, e.g. "/m/people/ashan.jpg". Unset until the shoot: the frame
   * shows the initial instead, at the portrait's proportions.
   */
  photo?: string;
};

export const people: Record<Who, Person> = {
  a: {
    name: "Ashan",
    initial: "A",
    line: "Decides how it looks and how it should feel to use. Plans the shoot and the posts. Then tries to break the site before your customers can.",
  },
  j: {
    name: "Jordan",
    initial: "J",
    line: "Builds it: the site, the booking, the phone answering and the follow-up behind it. Shoots the photos and video.",
  },
};

/* ── Header ───────────────────────────────────────────────────────────── */

export const nav = [
  { href: "#us", label: "Us" },
  { href: "#do", label: "What we do" },
  { href: "#work", label: "Work" },
  { href: "#contact", label: "Contact" },
];

/* ── Hero ─────────────────────────────────────────────────────────────── */

export const hero = {
  hint: "Pick a name to see what each of us does",
  lede: "We build the website, shoot the photos and video, and set up the phone answering and booking behind it, for local businesses around the Bay. The two of us do every project ourselves.",
  cta: { label: "Tell us what’s going on", href: "#contact" },
};

/* ── Us ───────────────────────────────────────────────────────────────── */

export const us = {
  title: "The two people on the first call are the two people doing the work.",
  where: "Between the East Bay and Suisun Valley.",
  promises: [
    "No account managers, no handoffs, nothing farmed out.",
    "We come to you for the shoot.",
    "You own the site, the domain and the data from day one.",
  ],
};

/* ── What we do ───────────────────────────────────────────────────────── */

export type Service = {
  title: string;
  text: string;
  /** "both" centres the service across the seam; "j" puts it on Jordan's side. */
  hands: "both" | Who;
  /** Each person's part, printed on their side of the credit line. */
  credit: Record<Who, string>;
};

export const services: Service[] = [
  {
    title: "Websites.",
    text: "The site itself, made so the people who find you can call, book or buy. You own it.",
    hands: "both",
    credit: { a: "Ashan designs", j: "Jordan builds" },
  },
  {
    title: "Photo & video.",
    text: "Your place, your people and your product, shot on location and cut for your site and your posts.",
    hands: "both",
    credit: { a: "Ashan plans", j: "Jordan shoots" },
  },
  {
    title: "Getting found.",
    text: "Google, local search and ads, set up and tracked so you can see what each one brings in.",
    hands: "both",
    credit: { a: "Ashan", j: "Jordan" },
  },
  {
    title: "Phones, booking & follow-up.",
    text: "A line that answers when you can’t, booking that fills the calendar, and follow-up that goes out without anyone having to remember.",
    hands: "j",
    credit: { a: "Ashan tests", j: "Jordan builds" },
  },
];

/* ── Work ─────────────────────────────────────────────────────────────── */

export type Still = { src: string; width: number; height: number };

export type ProjectMedia = {
  alt: string;
  /** Screenshot at 16:10, shown from 1024px up. */
  desktop: Still;
  /** Portrait crop at 4:5, shown under 1024px. */
  mobile: Still;
  /** Muted loop that fades in over the still once it plays. Phones get the -m cut. */
  loop?: { desktop: string; mobile: string };
};

export type Project = {
  name: string;
  place: string;
  status: string;
  line: string;
  /** "j" sits on Jordan's side of the seam; "both" is centred across it. */
  hands: "both" | "j";
  /** Unset: the project is set as type only, its name printed large. */
  media?: ProjectMedia;
  link?: { href: string; label: string };
};

export const projects: Project[] = [
  {
    name: "Pearls Farm Labor",
    place: "Napa",
    status: "Live",
    line: "A vineyard labor company. New site and drone film from the vineyards they work.",
    hands: "j",
    media: {
      alt: "The Pearls Farm Labor homepage, opening on a vineyard seen from the air.",
      desktop: { src: "/m/work/pearls-d-poster.jpg", width: 960, height: 600 },
      mobile: { src: "/m/work/pearls-m-poster.jpg", width: 400, height: 500 },
      loop: { desktop: "/m/work/pearls-d.mp4", mobile: "/m/work/pearls-m.mp4" },
    },
    link: { href: "https://pearlsfarminc.com", label: "pearlsfarminc.com" },
  },
  {
    name: "Galvan Dental Care",
    place: "Danville & Vallejo",
    status: "In progress",
    line: "A two-office dental practice. New site and a team shoot.",
    hands: "both",
    media: {
      alt: "The Galvan Dental Care homepage in progress: the practice name on yellow beside photos of the team.",
      desktop: { src: "/m/work/galvan-d-poster.jpg", width: 2880, height: 1800 },
      mobile: { src: "/m/work/galvan-m-poster.jpg", width: 780, height: 1688 },
    },
  },
  {
    name: "The Sticker Smith",
    place: "Hayward",
    status: "Live",
    line: "A custom sticker print shop. A site where customers set up their own order.",
    hands: "j",
    media: {
      alt: "The Sticker Smith homepage, with die-cut stickers under the headline.",
      desktop: { src: "/m/work/sticker-d-poster.jpg", width: 1280, height: 800 },
      mobile: { src: "/m/work/sticker-m-poster.jpg", width: 720, height: 900 },
      loop: { desktop: "/m/work/sticker-d.mp4", mobile: "/m/work/sticker-m.mp4" },
    },
    link: { href: "https://tssprint.com", label: "tssprint.com" },
  },
  {
    name: "Clinical Scribe",
    place: "Orthodontic practice",
    status: "In testing with the practice",
    line: "Records the consult, then drafts the doctor’s letter and the patient’s take-home letter from it.",
    hands: "both",
  },
];

/* ── Contact ──────────────────────────────────────────────────────────── */

export const contact = {
  title: "Tell us what’s going on.",
  lede: "One of us writes back with what we’d do about it and what it costs. No sales rep, no pitch deck.",
  fields: {
    name: "Your name",
    business: "Business",
    contact: "Email or phone",
    message: "What’s going on",
  },
  whom: "Who should get back to you?",
  either: "Either",
  submit: "Send it",
  sending: "Sending…",
  /** The V3 form's confirmation, kept with its backend. */
  sent: "We’ve got it. One of us reads every message that comes in — usually same day, always within one business day.",
  or: "Or email",
};
