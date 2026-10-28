/**
 * Copy and data for the Omora site — the "Names on the door" design, rebuilt
 * from the live preview at omora-a.vercel.app: the home page, /services,
 * /work and the case studies' shared frame.
 *
 * Everything a non-developer might want to change lives here rather than
 * inside the components. The home page's copy is the preview's, word for
 * word, except Work, which has grown since (see `projects`).
 *
 * The page is built around two people. Anything that belongs to one of them
 * carries their key ("a" or "j") and sits on their side of the seam; anything
 * shared is "both" and crosses it. Work is all shared, so projects carry no key.
 */

export type Who = "a" | "j";

export const brand = {
  name: "Omora",
  /** The two rings — Ashan's brass, Jordan's cyan. The page's two inks come from it. */
  mark: "/m/brand/mark-192.png",
  email: "studio.omora@gmail.com",
  where: "Bay Area",
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
  where: "Based in the Bay Area.",
  promises: [
    "No account managers, no handoffs, nothing farmed out.",
    "We come to you for the shoot.",
    "You own the site, the domain and the data from day one.",
  ],
};

/* ── What we do ───────────────────────────────────────────────────────── */

export type Service = {
  /** Its section on /services, e.g. /services#websites. */
  id: string;
  title: string;
  text: string;
  /** What comes with it, listed under the text on /services. */
  included: string[];
  /**
   * "both" centres the service across the seam; "j" puts it on Jordan's side
   * on the home page (/services centres every one) and credits it to Jordan.
   */
  hands: "both" | Who;
  /** Each person's part, printed on their side of the credit line. */
  credit: Record<Who, string>;
};

export const services: Service[] = [
  {
    id: "websites",
    title: "Websites.",
    text: "The site itself, made so the people who find you can call, book or buy. You own it.",
    included: [
      "Designed around how your customers call, book or buy",
      "Fast on phones, on your own domain",
      "Kept up every month, not handed off and forgotten",
    ],
    hands: "both",
    credit: { a: "Ashan designs", j: "Jordan builds" },
  },
  {
    id: "photo-video",
    title: "Photo & video.",
    text: "Your place, your people and your product, shot on location and cut for your site and your posts.",
    included: [
      "We come to you for the shoot",
      "Photos and short video cut for your site, Google and Instagram",
      "New content every month, so your pages don’t go stale",
    ],
    hands: "both",
    credit: { a: "Ashan plans", j: "Jordan shoots" },
  },
  {
    id: "getting-found",
    title: "Getting found.",
    text: "Google, local search and ads, set up and tracked so you can see what each one brings in.",
    included: [
      "Your Google listing set up and kept current: hours, photos, review replies",
      "Local search done properly on the site itself",
      "Ads when they make sense, with what each one brings in tracked",
    ],
    hands: "both",
    credit: { a: "Ashan", j: "Jordan" },
  },
  {
    id: "phones-booking",
    title: "Phones, booking & follow-up.",
    text: "A line that answers when you can’t, booking that fills the calendar, and follow-up that goes out without anyone having to remember.",
    included: [
      "A line that answers when you can’t and books the appointment",
      "Booking tied into how you already schedule",
      "Follow-up texts that go out on their own, plus custom tools for how you work",
    ],
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
  /**
   * Muted loop that fades in over the still once it plays. Phones get the -m
   * cut; a project without one keeps its still on phones.
   */
  loop?: { desktop: string; mobile?: string };
};

/**
 * One piece of shared work. Every project is laid out the same way and
 * credits no one: it is the studio's work, not one person's.
 */
export type Project = {
  name: string;
  place: string;
  status: string;
  line: string;
  /** Unset: the project is set as type only, its name printed large. */
  media?: ProjectMedia;
  /** A link starting "/" stays on the site; any other opens in a new tab. */
  link?: { href: string; label: string };
  /** Not ready to show. Every component that reads `projects` skips these. */
  hidden?: boolean;
};

export const projects: Project[] = [
  {
    name: "Pearls Farm Labor",
    place: "Napa",
    status: "Live",
    line: "A vineyard labor company. New site and drone film from the vineyards they work.",
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
    media: {
      alt: "The Galvan Dental Care homepage in progress: the practice name on yellow beside photos of the team.",
      desktop: { src: "/m/work/galvan-d-poster.jpg", width: 2880, height: 1800 },
      mobile: { src: "/m/work/galvan-m-poster.jpg", width: 780, height: 975 },
    },
  },
  {
    name: "Numen Ventures",
    place: "Silicon Valley",
    status: "Live",
    line: "A venture studio and seed fund for startups entering the US. A new site, plus Pitch Score: founders upload a pitch deck and get it scored against what US investors look for.",
    media: {
      alt: "The Numen Ventures homepage: “Helping Companies Build, Grow and Scale in the US Market” in white on near-black, under “Bridging global startups to Silicon Valley” in orange.",
      desktop: { src: "/m/work/numen-d-poster.jpg", width: 2336, height: 1460 },
      mobile: { src: "/m/work/numen-m-poster.jpg", width: 768, height: 960 },
    },
    link: { href: "https://www.numenventures.co", label: "numenventures.co" },
  },
  {
    name: "Cubic Ship",
    place: "15 counters in 8 states",
    status: "Live",
    line: "An independent operator of DHL Express counters. A site in 18 languages, so customers can ship home in their own.",
    media: {
      alt: "The Cubic Ship homepage: “From your screen to our counter.” above the steps from starting online to shipping, with only the first, start online, drawn in orange so far.",
      desktop: { src: "/m/work/cubic-d-poster.jpg", width: 1280, height: 800 },
      mobile: { src: "/m/work/cubic-m-poster.jpg", width: 800, height: 1000 },
      // Phones keep the still: it's framed on the headline, which the loop isn't.
      loop: { desktop: "/m/work/cubic-d.mp4" },
    },
    link: { href: "https://cubicship.com", label: "cubicship.com" },
  },
  {
    name: "The Sticker Smith",
    place: "Hayward",
    status: "Live",
    line: "A custom sticker print shop. A site where customers set up their own order.",
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
    link: { href: "/work/clinical-scribe", label: "Read the case study" },
  },
  {
    name: "Estética de Génesis",
    place: "TODO: place (city or area)",
    status: "TODO: status (e.g. Live or In progress)",
    line: "TODO: one line on the business, then what we made for them.",
    link: { href: "TODO: https://… (full URL)", label: "TODO: domain as shown, e.g. example.com" },
    hidden: true,
  },
];

/** How many projects the home page shows before "See all work". */
export const homeWorkCount = 3;

/* ── Contact ──────────────────────────────────────────────────────────── */

export const contact = {
  title: "Tell us what’s going on.",
  lede: "One of us writes back to set up a 30-minute call. No sales rep, no pitch deck.",
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

/* ── Inner pages ──────────────────────────────────────────────────────── */

export const workPage = {
  title: "Work",
  /** The link under the home page's Work. */
  more: "See all work",
};

export const servicesPage = {
  title: "What we do",
  /** The link under the home page's What we do. */
  more: "See all services",
  start: {
    title: "How it starts",
    steps: [
      { title: "A 30-minute call.", text: "You tell us where it’s going wrong, in your words." },
      {
        title: "A one-page plan.",
        text: "What we’d fix first and what it costs, sent by the day we say.",
      },
      { title: "The shoot and the build.", text: "The two of us, start to finish." },
    ],
    note: "There are no prices on this site. Every business is different, so your price comes in your plan, after the call.",
    cta: { label: "Tell us what’s going on", href: "/#contact" },
  },
};
