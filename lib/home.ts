/**
 * Copy and data for the home page (v3 layout, ported from
 * design/homepage-v3-mockup.html).
 *
 * Same rule as lib/content.ts: everything a non-developer might want to change
 * lives here rather than inside the components. The services, projects,
 * testimonials, pricing and team datasets are shared with the rest of the site
 * and stay in their own files — this file holds only what the home page alone
 * says, plus the slots it has that nothing else on the site fills yet.
 *
 * Numbers rule: every figure on this page has to be defensible if a client
 * asks. The proof band's figures are set by hand below; the work section's
 * counts come from lib/projects.ts.
 */

import type { MediaAsset } from "@/lib/media";

/* ── Hero ─────────────────────────────────────────────────────────────── */

export const hero = {
  title: "You’ve got a problem. We’re the fixers.",
  lede:
    "Missed calls, a site nobody finds, a calendar with holes in it. We build the systems that close those gaps, for businesses across the Tri-Valley and the greater Bay Area.",
  primary: { label: "Start a project", href: "#ticket" },
  secondary: { label: "See the work", href: "#work" },
  /**
   * The reel. 16:9, 20–30 seconds, autoplay muted, loops. Screen recordings of
   * live builds — the receptionist taking a call, a booking coming through. No
   * faces. Unset until it's cut; the slot renders as a placeholder meanwhile.
   */
  media: undefined as MediaAsset | undefined,
};

/**
 * Client names for the strip under the reel. Plain text chips, no logos.
 *
 * Empty until the names are confirmed — the strip renders that many open
 * chips in the meantime so the row keeps its place in the layout. Add names
 * here and the placeholders give way one for one.
 */
export const clients: string[] = [];

/** How many chips the strip is laid out for. */
export const CLIENT_SLOTS = 6;

/* ── Proof band ───────────────────────────────────────────────────────── */

export type Figure = {
  figure: string;
  caption: string;
};

export const figures: Figure[] = [
  {
    // As specified for the band. NB lib/projects.ts currently holds 14
    // projects, so the work section below prints a different number until
    // the dataset catches up with this one.
    figure: "24",
    caption: "builds behind us, and counting",
  },
  {
    // TODO: confirm with Jordan — an estimate of his years shipping
    // production work, not a checked number.
    figure: "7",
    caption: "years shipping production work",
  },
  {
    figure: "4",
    caption: "people, no account managers",
  },
  {
    figure: "100%",
    caption: "of the code and data is yours on day one",
  },
];

/* ── The leak ─────────────────────────────────────────────────────────── */

export const leak = {
  title: "Most of it leaks before you ever see it.",
  lede: "A slow week usually isn’t a demand problem. It’s three small holes nobody’s watching.",
  items: [
    {
      title: "The phone",
      body: "You’re on a roof, under a car, with a client. The call goes to voicemail and they dial the next name on the list.",
    },
    {
      title: "The search",
      body: "Someone two towns over needs exactly what you do. They find the guy who paid for the ad instead.",
    },
    {
      title: "The follow-up",
      body: "They asked for a quote three weeks ago. Nobody called them back, and nobody remembers they exist.",
    },
  ],
};

/* ── Section copy ─────────────────────────────────────────────────────── */

export const sections = {
  services: {
    title: "What we build.",
    lede: "Four things, and each one closes one of those holes.",
  },
  work: {
    // Matches the proof band's figure. lib/projects.ts holds fewer than this
    // today; the "See all" link under the ledger prints the real count.
    title: "Twenty-four builds behind us.",
    lede: "Websites, AI systems, dashboards, storefronts and enterprise tools. Some are ours together, some came before Omora. All of it is what you’re hiring.",
    shelf: "The rest of the shelf",
    shop: "In the shop right now",
    shopNote: "Shipping this quarter",
  },
  founders: {
    title: "Why we started this.",
    lede: "Two people, one design side and one build side, and no layer in between you and the work.",
  },
  team: {
    title: "The people who actually build it.",
    lede: "All four of us. You talk to the person doing the work.",
    /**
     * 60–90 seconds, both founders to camera: what we build and why we work
     * this way. Deliberately here rather than in the hero — a hero video makes
     * people wait; a team video builds trust once they already want it. Unset
     * until it's shot.
     */
    video: undefined as MediaAsset | undefined,
  },
  quotes: {
    title: "What they said after.",
    lede: "Six of these, named, from people whose businesses you can look up.",
    /**
     * Who the open slots are waiting on, in order. Each one prints in its
     * slot until a real quote takes it, so the section reads as a list of
     * three specific asks rather than three blanks. Three from recent work
     * are already in lib/testimonials.ts; these are the other three.
     */
    briefs: [
      "One of Jordan’s long-standing clients, ideally a repeat one.",
      "Someone who can speak to the build holding up over years, not weeks.",
      "Ideally a local East Bay owner, to anchor the geography.",
    ],
  },
  pricing: {
    title: "What it costs.",
    lede: "Half to start, half on launch. You own the code, the domain and the data from day one.",
  },
  contact: {
    title: "Start a ticket.",
    lede: "Tell us what’s leaking. We’ll tell you straight whether we’re the right fix.",
    /**
     * The number for the "rather just text?" line. Nobody on a jobsite fills
     * out a form, so this is the higher-value route once it exists. Unset
     * until there's a number that's actually answered.
     */
    phone: undefined as string | undefined,
  },
};

/* ── Founders ─────────────────────────────────────────────────────────── */

/**
 * One founder block in the letter section: portrait, bio, signature, role.
 *
 * Bios are deliberately absent. They have to be written in each founder's own
 * words — roughly 90 words, two short paragraphs, why you started it and what
 * you refuse to do — and the block renders a marked placeholder until they
 * are. Do not write these for them.
 */
export type Founder = {
  /** Full name, set in the signature face. */
  name: string;
  /** Mono role line under the signature. */
  role: string;
  /** Paragraphs. Omit until written. */
  bio?: string[];
  /** What the bio should cover. Prints in the placeholder until `bio` is set. */
  bioBrief: string;
  /** 3:4 portrait, plain background, both shot in the same session. */
  portrait?: MediaAsset;
  /** What's still missing, if the name itself isn't final. */
  note?: string;
};

export const founders: Founder[] = [
  {
    name: "Ashan Fernando",
    role: "Co-founder · Design and delivery",
    bioBrief: "Two short paragraphs in your own voice. Why you started it, what you refuse to do. Roughly 90 words.",
  },
  {
    // Surname pending — the signature prints the first name alone until then.
    name: "Jordan",
    role: "Co-founder · Engineering",
    note: "Surname to come",
    bioBrief: "Two short paragraphs in his own voice. Years shipping, what he cares about in a build. Roughly 90 words.",
  },
];

/* ── Layout capacities ────────────────────────────────────────────────── */

/**
 * How many slots each list on the page is laid out for. Where the data is
 * shorter than this, the component pads with marked placeholders so the grid
 * keeps its shape and the gap is visible; where it's longer, it truncates.
 */
export const CAPACITY = {
  featured: 3,
  ledger: 12,
  inProgress: 3,
  quotes: 6,
  team: 4,
} as const;
