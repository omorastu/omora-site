/**
 * Copy and data for the Elorro site — the "Names on the door" design, first
 * built as a static preview: the home page, /services, /work and the case
 * studies' shared frame.
 *
 * Everything a non-developer might want to change lives here rather than
 * inside the components. The home page's copy is the preview's, word for
 * word, except Work, which has grown since (see `projects`).
 *
 * The page is built around two people. Anything that belongs to one of them
 * carries their key ("a" or "j") and sits on their side of the seam; anything
 * shared crosses it. Work is all shared, so projects carry no key.
 */

export type Who = "a" | "j";

export const brand = {
  name: "Elorro",
  /** The two rings, both in the logo's gold. */
  mark: "/m/brand/mark-192.png",
  email: "studio.omora@gmail.com",
  where: "Bay Area",
};

/* ── The two people ───────────────────────────────────────────────────── */

export type Person = {
  name: string;
  /** Set under the first name in the hero, and only there. */
  last: string;
  initial: string;
  /** What they do, after their name. */
  line: string;
  // Photos can come back later: a `photo` here and a frame in components/elorro/us.tsx (removed for launch).
};

export const people: Record<Who, Person> = {
  a: {
    name: "Ashan",
    last: "Fernando",
    initial: "A",
    line: "Decides how it looks and how it should feel to use. Plans the shoot and the posts. Then tries to break the site before your customers can.",
  },
  j: {
    name: "Jordan",
    last: "Lopez",
    initial: "J",
    line: "Builds it: the site, the booking, the phone answering and the follow-up behind it. Shoots the photos and video.",
  },
};

/* ── Header and menu ──────────────────────────────────────────────────── */

/** The home page's sections, large in the menu. */
export const nav = [
  { href: "#us", label: "Us" },
  { href: "#do", label: "What we do" },
  { href: "#work", label: "Work" },
  { href: "#contact", label: "Contact" },
];

export const menu = {
  /** The header's button, and the menu's own name for screen readers. */
  label: "Menu",
  close: "Close",
  /** The pages of their own, under the sections. */
  pagesLabel: "Pages",
  pages: [
    { href: "/services", label: "All services" },
    { href: "/work", label: "All work" },
    { href: "/questions", label: "Questions" },
  ],
};

/** A home section's label, over it on the page: its name in the header. */
export const sectionLabel = (href: string) => nav.find((n) => n.href === href)?.label;

/* ── Hero ─────────────────────────────────────────────────────────────── */

export const hero = {
  hint: "Pick a name to see what each of us does",
  lede: "We build the website, shoot the photos and video, and set up the phone answering and booking behind it, for local businesses around the Bay. The two of us do every project ourselves.",
  cta: { label: "Book a call, let’s talk", href: "#contact" },
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

export type ServiceStep = { kind: string; heading: string; body: string };

export type ServiceSlug =
  | "websites-and-getting-found"
  | "photo-and-video"
  | "phones-booking-follow-up"
  | "custom-tools";

export type Service = {
  /** Its page, /services/<slug>, and its section on /services and /work (#<slug>). */
  slug: ServiceSlug;
  /** The project whose screen fills this service's box on /services, by name. */
  preview: string;
  /**
   * The order of its projects on /work and on its page, by name, the clients
   * closest to our market first. One with this `service` that isn't listed
   * comes after these.
   */
  work: string[];
  title: string;
  /** One plain line: on its card, on /services, and under its page's title. */
  text: string;
  /** What comes with it, listed beside the text on /services. */
  included: string[];
  /** Its own page, /services/<slug>, laid out like a case study. */
  page: {
    /** For search results and link previews. */
    description: string;
    /** A few lines under the title. */
    intro: string;
    /** How we do it, in order: the page's "What we do". */
    steps: ServiceStep[];
  };
};

export const services: Service[] = [
  {
    slug: "websites-and-getting-found",
    preview: "The Sticker Smith",
    work: ["Cubic Ship", "The Sticker Smith", "FW Wheels", "ONHIZM", "Miiir", "Manza Visuals"],
    title: "Websites & getting found.",
    text: "The site itself, and the work that gets it found on Google and in AI search like ChatGPT, so people can call, book or buy.",
    included: [
      "Designed around how your customers call, book or buy, on your own domain",
      "Search done properly: your Google listing, local SEO and the pages behind them",
      "Set up to show up in AI search, when people ask ChatGPT who to call",
      "Kept up every month, with what it brings in tracked",
    ],
    page: {
      description:
        "A website built around how your customers call, book or buy, and the work that gets it found: on Google, on the map and in AI search like ChatGPT.",
      intro:
        "People find a local business three ways now: a Google search, the map, or asking an AI like ChatGPT. We build the site and do the work behind it so you show up in all three, and so whoever finds you can call, book or buy without hunting for how.",
      steps: [
        {
          kind: "The site",
          heading: "A site built around how your customers call, book or buy.",
          body: "We start from what people come to you for and what they do next, and design the pages around that. Fast on phones, on your own domain, and yours: the site, the domain and the data are in your name from day one.",
        },
        {
          kind: "Google",
          heading: "Showing up on Google and on the map.",
          body: "Your Google listing set up and kept current: hours, photos, services, replies to reviews. On the site, local search done properly: a clear page for each thing you do and each place you do it, so Google knows when to show you.",
        },
        {
          kind: "AI search",
          heading: "Showing up when people ask ChatGPT.",
          body: "More people now ask an AI who to call. Its answers come from what the web says about you, so we make sure your site says plainly what you do, where and for whom, and that your listings everywhere else agree with it.",
        },
        {
          kind: "Found, called, booked",
          heading: "From the search to the booking, with nothing in the way.",
          body: "Being found only counts once it turns into a call or a booking. Tap to call and book sit where people look for them, and every call and form is tracked, so you can see where each customer came from.",
        },
        {
          kind: "Every month",
          heading: "Kept up, not handed off and forgotten.",
          body: "We stay on it every month: new pages and photos as the business changes, search checked and tuned, and what came in, and from where, where you can see it.",
        },
      ],
    },
  },
  {
    slug: "photo-and-video",
    preview: "Prosperando",
    work: ["Prosperando", "Pearls Farm Labor"],
    title: "Photo & video.",
    text: "Your place, your people and your work, shot on location and cut for your site, Google and your posts.",
    included: [
      "We come to you for the shoot",
      "Photos and short video cut for your site, Google and Instagram",
      "New content every month, so your pages don’t go stale",
    ],
    page: {
      description:
        "Photos and short video of your place, your people and your work, shot on location and cut for your site, Google and Instagram.",
      intro:
        "Real photos of your place and your people do more than stock ever will. We come to you, shoot, and cut it for everywhere it’s going.",
      steps: [
        {
          kind: "The shoot",
          heading: "We come to you.",
          body: "A plan first, so the day goes quickly: what we need, where and who. Then we shoot on location, around how your business runs, not the other way round.",
        },
        {
          kind: "The cut",
          heading: "Cut for everywhere it’s going.",
          body: "Photos and short video sized and cut for your site, your Google listing and your posts, and new content every month so nothing goes stale.",
        },
      ],
    },
  },
  {
    slug: "phones-booking-follow-up",
    preview: "Brian’s Appliance Repair",
    work: ["Brian’s Appliance Repair", "joon11ee", "PhatHead Productions"],
    title: "Phones, booking & follow-up.",
    text: "A line that answers when you can’t, booking that fills the calendar, and follow-up that goes out on its own.",
    included: [
      "A line that answers when you can’t and books the appointment",
      "Booking tied into how you already schedule",
      "Reminders and follow-up texts that go out without anyone having to remember",
    ],
    page: {
      description:
        "A phone line that answers when you can’t, booking tied into how you already schedule, and follow-up that goes out on its own.",
      intro:
        "A missed call or a forgotten follow-up is a customer you already did the work to get. We set up what catches them, around how you already work.",
      steps: [
        {
          kind: "Answering",
          heading: "A line that answers when you can’t.",
          body: "When you’re with a customer or closed for the day, calls still get answered: questions handled, details taken, and the appointment booked or passed to you.",
        },
        {
          kind: "Booking",
          heading: "Booking that fills the calendar.",
          body: "Online booking tied into how you already schedule, so nothing gets booked twice and nobody has to copy anything across.",
        },
        {
          kind: "Follow-up",
          heading: "Follow-up that goes out on its own.",
          body: "A reminder before the visit, a thank-you and a review request after, and a nudge for anyone who went quiet. Written in your voice, and sent without anyone having to remember.",
        },
      ],
    },
  },
  {
    slug: "custom-tools",
    preview: "Clinical Scribe",
    work: ["Clinical Scribe", "Numen Ventures"],
    title: "Custom tools.",
    text: "When the problem is particular to your business, we build the tool for it, around how you already work.",
    included: [
      "Built for one problem in your business, not a generic app",
      "Fits the tools and records you already use",
      "Tested with your team before anyone relies on it",
      "Looked after once it’s live, and changed as you change",
    ],
    page: {
      description:
        "Tools built for one business’s problem: made around the tools and records you already use, tested with your team, and looked after once they’re live.",
      intro:
        "Some problems no app off the shelf will solve, because they’re particular to how you work. For those, we build the tool ourselves.",
      steps: [
        {
          kind: "The problem",
          heading: "We start with what eats your week.",
          body: "We sit with you and the people doing the work, and find the one job that costs the most time or goes wrong most often.",
        },
        {
          kind: "The build",
          heading: "A tool built for that, and only that.",
          body: "Made around the tools and records you already use, and tested with your team on real work before anyone relies on it.",
        },
        {
          kind: "After launch",
          heading: "It keeps working as you change.",
          body: "We look after it once it’s live, fix what needs fixing, and change it as your business does.",
        },
      ],
    },
  },
];

/** The service at /services/<slug>, or undefined if there isn't one. */
export const serviceFor = (slug: string) => services.find((s) => s.slug === slug);

/* ── Work ─────────────────────────────────────────────────────────────── */

export type Still = { src: string; width: number; height: number };

export type ProjectMedia = {
  alt: string;
  /** Screenshot at 16:10, shown from 1024px up. */
  desktop: Still;
  /** Portrait crop at 4:5, shown under 1024px. */
  mobile: Still;
  /**
   * Shown instead of the two above to visitors who've turned on reduced
   * motion, for whom the loop never plays: the loop's clearest frame, larger.
   * Unset, they get the same stills as everyone.
   */
  still?: { desktop: Still; mobile: Still };
  /**
   * Muted loop that fades in over the still once it plays: the -d cut from
   * 1024px up, the -m cut below, and their -sd cuts on slow and Save-Data
   * connections (components/elorro/work-video.tsx). List every cut the
   * project should have: one that isn't in public/ yet is left out when the
   * page is built and named in the build log, and the card shows its still
   * in that place meanwhile (lib/work-media.ts).
   */
  loop?: { desktop?: string; mobile?: string; desktopSd?: string; mobileSd?: string };
};

/**
 * One piece of shared work. Every project is laid out the same way and
 * credits no one: it is the studio's work, not one person's. The order here
 * is the home page's, which shows the first `homeWorkCount`, so it stays put:
 * /work and the service pages each have their own (`work` on the service).
 */
export type Project = {
  name: string;
  /** Where it is, only if it's a real place. Unset: the card shows the status alone. */
  place?: string;
  status: string;
  line: string;
  /** Unset: the card is its text alone. */
  media?: ProjectMedia;
  /** A link starting "/" stays on the site; any other opens in a new tab. */
  link?: { href: string; label: string };
  /**
   * What it mainly shows, one service only: where it goes on /work and on the
   * service's page. Without one it's on neither, only the home page's first few.
   */
  service?: ServiceSlug;
  /** Not ready to show. Every component that reads `projects` skips these. */
  hidden?: boolean;
};

/**
 * Clinical Scribe's live card, on its Work card and at the top of its case
 * study. A replica of the app's screens with made-up patients, made in
 * video/ (see its README): the real app is never recorded.
 */
export const clinicalScribeMedia: ProjectMedia = {
  alt: "Clinical Scribe with made-up demo data, close up: a consult being recorded, its summary filling in, the two letters drafting, then a follow-up case picked and its message drafted.",
  desktop: { src: "/m/work/clinical-d-poster.jpg", width: 960, height: 600 },
  mobile: { src: "/m/work/clinical-m-poster.jpg", width: 544, height: 680 },
  still: {
    desktop: { src: "/m/work/clinical-d-still.jpg", width: 1920, height: 1200 },
    mobile: { src: "/m/work/clinical-m-still.jpg", width: 1080, height: 1350 },
  },
  loop: {
    desktop: "/m/work/clinical-d.mp4",
    desktopSd: "/m/work/clinical-d-sd.mp4",
    mobile: "/m/work/clinical-m.mp4",
    mobileSd: "/m/work/clinical-m-sd.mp4",
  },
};

export const projects: Project[] = [
  {
    name: "Pearls Farm Labor",
    service: "photo-and-video",
    place: "Napa",
    status: "Live",
    line: "A vineyard labor company. New site and drone film from the vineyards they work.",
    media: {
      alt: "The Pearls Farm Labor homepage, opening on a vineyard seen from the air.",
      desktop: { src: "/m/work/pearls-d-poster.jpg", width: 960, height: 600 },
      mobile: { src: "/m/work/pearls-m-poster.jpg", width: 400, height: 500 },
      loop: {
        desktop: "/m/work/pearls-d.mp4",
        desktopSd: "/m/work/pearls-d-sd.mp4",
        mobile: "/m/work/pearls-m.mp4",
        mobileSd: "/m/work/pearls-m-sd.mp4",
      },
    },
    link: { href: "https://pearlsfarminc.com", label: "pearlsfarminc.com" },
  },
  {
    name: "Clinical Scribe",
    service: "custom-tools",
    place: "Orthodontic practice",
    status: "In testing with the practice",
    line: "Records the consult, then drafts the doctor’s letter and the patient’s take-home letter from it.",
    media: clinicalScribeMedia,
    link: { href: "/work/clinical-scribe", label: "Read the case study" },
  },
  {
    name: "Numen Ventures",
    service: "custom-tools",
    place: "Bay Area",
    status: "Live",
    line: "Their old site had been down for months. Now founders land on a new site and can score their pitch deck in minutes.",
    // The loops, posters and stills are made in video/ (see its README).
    media: {
      alt: "numenventures.co first screen: Helping Companies Build, Grow and Scale in the US Market",
      desktop: { src: "/m/work/numen-d-poster.jpg", width: 960, height: 600 },
      mobile: { src: "/m/work/numen-m-poster.jpg", width: 544, height: 680 },
      still: {
        desktop: { src: "/m/work/numen-d-still.jpg", width: 1920, height: 1200 },
        mobile: { src: "/m/work/numen-m-still.jpg", width: 1080, height: 1350 },
      },
      loop: {
        desktop: "/m/work/numen-d.mp4",
        desktopSd: "/m/work/numen-d-sd.mp4",
        mobile: "/m/work/numen-m.mp4",
        mobileSd: "/m/work/numen-m-sd.mp4",
      },
    },
    link: { href: "https://www.numenventures.co", label: "numenventures.co" },
  },
  {
    name: "Cubic Ship",
    service: "websites-and-getting-found",
    place: "15 counters in 8 states",
    status: "Live",
    line: "An independent operator of DHL Express counters. A site in 18 languages, so customers can ship home in their own.",
    media: {
      alt: "The Cubic Ship homepage: “From your screen to our counter.” above the steps from starting online to shipping, with only the first, start online, drawn in orange so far.",
      desktop: { src: "/m/work/cubic-d-poster.jpg", width: 1280, height: 800 },
      mobile: { src: "/m/work/cubic-m-poster.jpg", width: 800, height: 1000 },
      // No phone cut yet: phones keep the still, which is framed on the headline.
      loop: {
        desktop: "/m/work/cubic-d.mp4",
        desktopSd: "/m/work/cubic-d-sd.mp4",
        mobile: "/m/work/cubic-m.mp4",
        mobileSd: "/m/work/cubic-m-sd.mp4",
      },
    },
    link: { href: "https://cubicship.com", label: "cubicship.com" },
  },
  {
    name: "The Sticker Smith",
    service: "websites-and-getting-found",
    place: "Hayward",
    status: "Live",
    line: "A custom sticker print shop. A site where customers set up their own order.",
    media: {
      alt: "The Sticker Smith homepage, with die-cut stickers under the headline.",
      desktop: { src: "/m/work/sticker-d-poster.jpg", width: 1280, height: 800 },
      mobile: { src: "/m/work/sticker-m-poster.jpg", width: 720, height: 900 },
      // No SD cuts: both loops are already lighter than an SD cut may be. Both
      // start on the store itself, past the site's intro.
      loop: { desktop: "/m/work/sticker-d.mp4", mobile: "/m/work/sticker-m.mp4" },
    },
    link: { href: "https://tssprint.com", label: "tssprint.com" },
  },
  {
    name: "Galvan Dental Care",
    service: "websites-and-getting-found",
    place: "Danville & Vallejo",
    status: "In progress",
    line: "A two-office dental practice. New site and a team shoot.",
    media: {
      alt: "The Galvan Dental Care homepage in progress: the practice name on yellow beside photos of the team.",
      desktop: { src: "/m/work/galvan-d-poster.jpg", width: 2880, height: 1800 },
      mobile: { src: "/m/work/galvan-m-poster.jpg", width: 780, height: 975 },
      // Not made yet; the card shows the stills until they are.
      loop: {
        desktop: "/m/work/galvan-d.mp4",
        desktopSd: "/m/work/galvan-d-sd.mp4",
        mobile: "/m/work/galvan-m.mp4",
        mobileSd: "/m/work/galvan-m-sd.mp4",
      },
    },
    // Off the site until the practice OKs showing it.
    hidden: true,
  },
  {
    name: "Estética de Génesis",
    place: "TODO: place (city or area)",
    status: "TODO: status (e.g. Live or In progress)",
    line: "TODO: one line on the business, then what we made for them.",
    link: { href: "TODO: https://… (full URL)", label: "TODO: domain as shown, e.g. example.com" },
    hidden: true,
  },
  {
    name: "Brian’s Appliance Repair",
    service: "phones-booking-follow-up",
    place: "Vacaville",
    status: "Live",
    line: "A home appliance repair business. Customers can call, text or book from the first screen, and requests land in the scheduling app the business already uses.",
    media: {
      alt: "The Brian’s Appliance Repair homepage: his name, what he fixes, Vacaville and his phone number, all big, with buttons to text him or request a visit.",
      desktop: { src: "/m/work/brian-d-poster.jpg", width: 1280, height: 800 },
      mobile: { src: "/m/work/brian-m-poster.jpg", width: 800, height: 1000 },
    },
    link: { href: "https://brianappliancerepair.com", label: "brianappliancerepair.com" },
  },
  {
    name: "Prosperando",
    service: "photo-and-video",
    place: "Napa",
    status: "Live",
    line: "The Flores family’s wine brand. The photos and video, the color on the site, the family’s story and its first posts.",
    media: {
      alt: "Prosperando’s site opening on a vineyard with the family crest, and on phones, a bottle of its wine at a lunch table.",
      desktop: { src: "/m/work/prosperando-d-poster.jpg", width: 1280, height: 800 },
      mobile: { src: "/m/work/prosperando-m-poster.jpg", width: 720, height: 900 },
      // Desktop: the site. Phones: the footage itself, focus moving from the table to the bottle.
      loop: {
        desktop: "/m/work/prosperando-d.mp4",
        desktopSd: "/m/work/prosperando-d-sd.mp4",
        mobile: "/m/work/prosperando-m.mp4",
        mobileSd: "/m/work/prosperando-m-sd.mp4",
      },
    },
    link: { href: "https://prosperandovineyards.com", label: "prosperandovineyards.com" },
  },
  {
    name: "joon11ee",
    service: "phones-booking-follow-up",
    place: "Miami, LA/OC & San Francisco",
    status: "Live",
    line: "Exotic car rentals. People pick a car, check it for their dates and send a request, and Joon confirms before anyone pays.",
    media: {
      alt: "The joon11ee homepage: a silver Porsche by the water, above the name.",
      desktop: { src: "/m/work/joon-d-poster.jpg", width: 1280, height: 800 },
      mobile: { src: "/m/work/joon-m-poster.jpg", width: 720, height: 900 },
      loop: {
        desktop: "/m/work/joon-d.mp4",
        desktopSd: "/m/work/joon-d-sd.mp4",
        mobile: "/m/work/joon-m.mp4",
      },
    },
    link: { href: "https://joon11ee.com", label: "joon11ee.com" },
  },
  {
    name: "FW Wheels",
    service: "websites-and-getting-found",
    status: "Live",
    line: "A wheel shop. A catalog you shop by brand, and a real person checks the fit by text before you order.",
    media: {
      alt: "The FW Wheels homepage: “Wheels that fit your car.” beside a close-up of a wheel, over a form for your car.",
      desktop: { src: "/m/work/fw-d-poster.jpg", width: 1280, height: 800 },
      mobile: { src: "/m/work/fw-m-poster.jpg", width: 720, height: 900 },
      loop: {
        desktop: "/m/work/fw-d.mp4",
        desktopSd: "/m/work/fw-d-sd.mp4",
        mobile: "/m/work/fw-m.mp4",
        mobileSd: "/m/work/fw-m-sd.mp4",
      },
    },
    link: { href: "https://fwwheelz.com", label: "fwwheelz.com" },
  },
  {
    name: "ONHIZM",
    service: "websites-and-getting-found",
    place: "Bay Area",
    status: "Live",
    line: "A streetwear brand. The store: live stock, the artist wall and the text club.",
    media: {
      alt: "The ONHIZM store’s artist wall: a grid of artists wearing the brand.",
      desktop: { src: "/m/work/onhizm-d-poster.jpg", width: 1280, height: 800 },
      mobile: { src: "/m/work/onhizm-m-poster.jpg", width: 720, height: 900 },
      loop: { desktop: "/m/work/onhizm-d.mp4", desktopSd: "/m/work/onhizm-d-sd.mp4", mobile: "/m/work/onhizm-m.mp4" },
    },
    link: { href: "https://onhizm.com", label: "onhizm.com" },
  },
  {
    name: "Miiir",
    service: "websites-and-getting-found",
    place: "Bay Area",
    status: "Live",
    line: "A music producer. A beat store where his mix keeps playing as you browse and the page moves with the bass.",
    media: {
      alt: "The Miiir site: the name over a film still, with the mix playing under it.",
      desktop: { src: "/m/work/miiir-d-poster.jpg", width: 1280, height: 800 },
      mobile: { src: "/m/work/miiir-m-poster.jpg", width: 720, height: 900 },
      loop: { desktop: "/m/work/miiir-d.mp4", desktopSd: "/m/work/miiir-d-sd.mp4", mobile: "/m/work/miiir-m.mp4" },
    },
    link: { href: "https://miiir.shop", label: "miiir.shop" },
  },
  {
    name: "Manza Visuals",
    service: "websites-and-getting-found",
    place: "Bay Area",
    status: "Live",
    line: "A music video director. A new site with his clips playing up front. The films are his.",
    media: {
      alt: "The Manza Visuals homepage: a music video playing above the name.",
      desktop: { src: "/m/work/manza-d-poster.jpg", width: 1280, height: 800 },
      mobile: { src: "/m/work/manza-m-poster.jpg", width: 720, height: 900 },
      loop: { desktop: "/m/work/manza-d.mp4", desktopSd: "/m/work/manza-d-sd.mp4", mobile: "/m/work/manza-m.mp4" },
    },
    link: { href: "https://manzavisuals.com", label: "manzavisuals.com" },
  },
  {
    name: "PhatHead Productions",
    service: "phones-booking-follow-up",
    place: "Oakland",
    status: "Live",
    line: "A music video director. A booking site that reads like a menu: pick a package and the ticket fills itself in.",
    media: {
      alt: "The PhatHead Productions site: the logo and a video above “Music videos and film, out of Oakland.”, and on phones, a package’s ticket filling in.",
      desktop: { src: "/m/work/phathead-d-poster.jpg", width: 1280, height: 800 },
      mobile: { src: "/m/work/phathead-m-poster.jpg", width: 800, height: 1000 },
      // No phone cut: phones keep the still, the ticket itself.
      loop: { desktop: "/m/work/phathead-d.mp4" },
    },
    link: { href: "https://www.phatheadproductions.com", label: "phatheadproductions.com" },
  },
  {
    name: "Stirred Earth",
    service: "websites-and-getting-found",
    status: "In progress",
    line: "A mushroom coffee and cacao brand, before launch. New site.",
    media: {
      alt: "The Stirred Earth homepage: “A little earth. A better everyday.” beside a mug on a rocky coast at sunset.",
      desktop: { src: "/m/work/stirred-d-poster.jpg", width: 1280, height: 800 },
      mobile: { src: "/m/work/stirred-m-poster.jpg", width: 720, height: 900 },
      loop: { desktop: "/m/work/stirred-d.mp4", mobile: "/m/work/stirred-m.mp4", mobileSd: "/m/work/stirred-m-sd.mp4" },
    },
    link: { href: "https://stirred-earth-site.vercel.app", label: "stirred-earth-site.vercel.app" },
    // Off the site until their site launches: the link is still a vercel.app test address.
    hidden: true,
  },
];

/** How many projects the home page shows before "See all work". */
export const homeWorkCount = 4;

/** How many projects a service's page shows before "See all work". */
export const serviceWorkCount = 4;

/* ── Contact ──────────────────────────────────────────────────────────── */

export const contact = {
  title: "Book a call, let’s talk.",
  lede: "One of us writes back to set up a 30-minute call. Just us two and you.",
  fields: {
    name: "Your name",
    business: "Business",
    contact: "Email or phone",
    message: "What’s going on",
  },
  /** Under the fields, where the form once asked who should write back. */
  reply: `${people.a.name} and ${people.j.name} will get back to you soon.`,
  /**
   * The form no longer asks, or sends `who`; /api/lead still accepts one
   * (either name, or this) from anything that does, and reads it from here.
   */
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
  /** The links to its groups, for screen readers. */
  jump: "Work by service",
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
    cta: { label: "Book a call, let’s talk", href: "/#contact" },
  },
};
