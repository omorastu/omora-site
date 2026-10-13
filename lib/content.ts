/**
 * Site copy and data for the Omora v2 one-pager.
 *
 * Everything a non-developer might want to change lives here rather than inside
 * the components, so copy edits never mean touching JSX.
 */

import type { PreviewId } from "@/components/previews";
import type { MediaAsset } from "@/lib/media";

/* ── What we do ───────────────────────────────────────────────────────── */

/**
 * A service identifier — also its URL slug at /services/<slug>.
 *
 * Deliberately a plain string rather than a closed union: adding or renaming a
 * service should be an edit to the array below, not a type change that ripples
 * through prefill, the previews map and the projects join.
 */
export type ServiceId = string;

/** @deprecated Use ServiceId. Kept so existing imports keep resolving. */
export type CapabilityId = ServiceId;

/**
 * One service. The same record drives three things, so they cannot drift:
 * its card on the home page, its card on /services, and its own detail page.
 *
 * All four are peers. There is no main offer and no nesting — "the Operator
 * Stack" is the systems layer behind this work, described in the team section,
 * not something a client buys off this list.
 */
export type Service = {
  /** URL slug. Must match the `services` tags in lib/projects.ts. */
  slug: ServiceId;
  /** Formal name, used as the detail page's <h1> and the /services card title. */
  name: string;

  /* — home + index card — */
  /** Mono label above the card. */
  label: string;
  /** The card headline: what it does for the owner, in their words. */
  title: string;
  /** One sentence. Plain. No pitch. */
  body: string;
  /**
   * The home page's version of `body`: shorter, and written to answer the
   * matching hole in the leak section directly above it. Falls back to `body`
   * when unset, so a new service renders without one.
   */
  summary?: string;
  /**
   * The 16:9 image above the home-page card. A real screenshot of the product
   * — the receptionist mid-call, a client site on a device, a filled booking
   * week, the lead board — never an abstract graphic. The slot renders as a
   * placeholder until one is supplied.
   */
  image?: MediaAsset;
  /** Three concrete things it handles. */
  points: string[];
  /**
   * Which animated preview to draw. Omit it and the card falls back to a static
   * treatment — a service without a bespoke animation renders quietly rather
   * than crashing. See PREVIEWS in components/previews.tsx.
   */
  previewId?: PreviewId;
  /** Draws the resting violet-line border and drop shadow. At most one. */
  featured?: boolean;
  /**
   * The form checkbox this card preselects. Falls back to `label` when unset.
   */
  needLabel?: string;

  /* — detail page — */
  /** One line under the h1. The promise, in the owner's words. */
  tagline: string;
  /** Two or three sentences: what it is and who it's for. */
  intro: string;
  /** What a build actually includes. */
  includes: string[];
};

export const services: Service[] = [
  {
    slug: "ai-receptionist",
    name: "AI receptionist",
    previewId: "receptionist",
    needLabel: "AI receptionist",
    label: "Voice",
    title: "It answers the phone",
    summary:
      "An AI receptionist that picks up every time, books the appointment, and texts you the summary. It doesn’t take lunch.",
    body: "A voice agent that picks up on the first ring, answers the questions you'd answer, and books the job into your calendar while you're under a car or on a ladder.",
    points: ["Picks up 24/7", "Books into your calendar", "Texts you the summary"],
    tagline: "Every call answered, including the ones you can't take.",
    intro:
      "Most missed calls never call back — they call the next place on the list. A voice agent picks up on the first ring, answers what a regular caller asks, and puts the job straight into your calendar. It works the same at 2pm and 2am.",
    includes: [
      "Answers on the first ring, 24/7",
      "Trained on your services, hours and pricing",
      "Books straight into your calendar",
      "Screens and routes the calls that need a human",
      "Texts you a summary of every call",
      "Call transcripts you can read back",
    ],
  },
  {
    slug: "websites",
    name: "Websites",
    previewId: "website",
    needLabel: "Website",
    featured: true,
    label: "Web",
    title: "It sells while you sleep",
    summary:
      "A site built to be found and to convert, with a page for every city you serve so you show up where the work is.",
    body: "A site built around the one action you want a visitor to take, then stripped of everything that gets in the way of it.",
    points: ["Built mobile-first", "Loads in under a second", "You can edit it yourself"],
    tagline: "Built around the one thing you want visitors to do.",
    intro:
      "A site earns its keep by getting people to do one thing — call, book, or buy. We build around that action and cut whatever gets in its way. Local search is part of this: being findable is half of being chosen.",
    includes: [
      "Custom design, no template",
      "Built mobile-first",
      "Loads in under a second",
      "Local SEO and Google Business Profile setup",
      "Technical and local-search audits",
      "You can edit the content yourself",
    ],
  },
  {
    slug: "booking-systems",
    name: "Booking systems",
    previewId: "booking",
    needLabel: "Booking system",
    label: "Scheduling",
    title: "It fills your calendar",
    summary:
      "Booking, reminders and no-show follow-up that runs itself. Flat fee, no cut of every cover.",
    body: "Customers pick a slot that's actually free, get their confirmation, and show up. Nobody plays phone tag.",
    points: ["Live availability", "Deposits and reminders", "Syncs to your calendar"],
    tagline: "Customers book themselves in. You stop playing phone tag.",
    intro:
      "Taking bookings by phone costs you the ones who call while you're busy. A booking flow shows what's genuinely free, takes the deposit, and sends the reminders — so the calendar fills without anyone answering the phone to do it.",
    includes: [
      "Live availability, not a request form",
      "Deposits and payments at the point of booking",
      "Automatic confirmations and reminders",
      "Two-way sync with your existing calendar",
      "Rescheduling and cancellations that handle themselves",
      "No-show tracking",
    ],
  },
  {
    slug: "sales-intelligence",
    name: "Sales intelligence",
    previewId: "intel",
    needLabel: "Sales intelligence",
    label: "Sales",
    title: "It tells you who to call",
    summary:
      "Your leads scored and ranked, so the morning starts with a list instead of a guess.",
    body: "Your leads, scored and sorted, so the first call your team makes each morning is the one most likely to close.",
    points: ["Scores every lead", "Flags who's gone cold", "Ranks the day's call list"],
    tagline: "The first call of the day, chosen for you.",
    intro:
      "Most teams work their leads in the order they arrived, which is rarely the order worth working. This scores every lead on what actually predicts a close in your business, then hands your team a ranked call list each morning.",
    includes: [
      "Every lead scored on your own close data",
      "A ranked call list, refreshed daily",
      "Flags leads going cold before they do",
      "Sits on top of the CRM you already use",
      "Owner dashboard for pipeline at a glance",
    ],
  },
];

/**
 * @deprecated Use `services`. Kept so anything still importing `capabilities`
 * keeps working — the home cards read the same records either way.
 */
export const capabilities = services;
export type Capability = Service;

/* ── Proof ────────────────────────────────────────────────────────────
   Moved to lib/projects.ts. The home strip and the service-page proof strips
   now read one dataset, so a project can no longer be visible on the home page
   yet invisible to projectsForService(). See `homeProof` there. */

/* ── How we work ──────────────────────────────────────────────────────── */

export const steps = [
  {
    n: "01",
    title: "You tell us the problem",
    body: "Not a spec — the problem. Calls going unanswered, a site nobody books from, a process eating your week. One conversation, no charge.",
  },
  {
    n: "02",
    title: "We design and build it",
    body: "You see the design before anything gets built, and the working thing after. You're never guessing what you're getting.",
  },
  {
    n: "03",
    title: "You launch and grow",
    body: "We put it live, watch how it behaves with real customers, and fix what the real world turns up.",
  },
];

/* ── Team ─────────────────────────────────────────────────────────────── */

/**
 * One person, or one slot held open for a person.
 *
 * `placeholder` slots render as visibly unfinished cards rather than being
 * filled with invented copy — an empty seat is honest, a made-up bio is not.
 * The name/role/line fields are optional only so a placeholder can carry none
 * of them; every real entry sets all three.
 */
export type TeamMember = {
  name?: string;
  role?: string;
  line?: string;
  /**
   * Square headshot for the home page grid. All four from one shoot, so they
   * match. The slot renders as a placeholder until one is supplied.
   */
  photo?: MediaAsset;
  /** TODO slot. Delete this flag once the three fields above are filled in. */
  placeholder?: boolean;
};

export const team: TeamMember[] = [
  {
    name: "Ashan",
    role: "Design direction + QA",
    line: "Decides how it looks and how it should feel to use, then tries to break it before a customer does.",
  },
  {
    name: "Jordan",
    role: "Technical build",
    line: "Builds the thing. Runs the Operator Stack — the systems layer behind the receptionists, booking flows, and automations.",
  },

  /* TODO: two more operators. Names, role labels and bios to be supplied — do
     not write copy for these, they render as marked placeholders until the
     real details land. Fill in name/role/line and drop `placeholder`. */
  { placeholder: true },
  { placeholder: true },
];
