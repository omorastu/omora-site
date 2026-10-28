/**
 * Every piece of delivered work, in one place.
 *
 * NOTE: superseded. The live site's projects are `projects` in lib/kozmoz.ts;
 * only the archived V1 site (app/_v1, not routed) still reads this file.
 *
 * This is the single project dataset. The home page's Recent Work strip and the
 * proof strip on each service page both read from it — previously the home
 * strip had its own separate list in lib/content.ts, which meant a project
 * could exist on the home page and be invisible to `projectsForService()`.
 *
 * Tagging rule: `services` says which service pages a project proves. Tag it
 * only where it genuinely belongs. A project with no honest fit carries no tag
 * and simply doesn't appear on any service page — an empty tag is correct, a
 * padded one is not.
 *
 * NOTE for whoever edits this next: `verified: false` entries show a
 * "link pending" tag instead of "LIVE ↗" so we never point a visitor at a
 * dead or login-walled URL.
 *
 * Status: work still in the shop carries `status: "in-progress"` and writes its
 * line as `intent` rather than `outcome`. The cards render the two differently
 * — dashed border, "In progress" plate, no outbound link — so nothing on the
 * site claims a result that hasn't happened yet.
 */

/**
 * Which service page a project should appear on. Matches a `slug` in
 * lib/content.ts — a plain string so retagging never requires a type edit.
 */
export type ServiceSlug = string;

/**
 * Where a build actually is. Absent means "live" — the common case, so shipped
 * work carries no flag and only work still in the shop has to declare itself.
 */
export type ProjectStatus = "live" | "in-progress";

export type Project = {
  name: string;
  /** The kind of job. Also selects the schematic when there's no screenshot. */
  category: string;
  /** Defaults to "live". Read through statusOf(), never directly. */
  status?: ProjectStatus;
  /**
   * What changed for the client. Past tense, and only ever true of shipped
   * work — a live project's card prints this one.
   */
  outcome?: string;
  /**
   * What the build is setting out to do. Forward-looking, for work still in
   * progress. Split from `outcome` because the two are not interchangeable:
   * printing a past-tense outcome under a build that hasn't shipped claims a
   * result the client has not actually had yet.
   */
  intent?: string;
  /** One line on what the thing does. */
  detail: string;
  /** Only set when there's a confirmed, publicly reachable URL. */
  href?: string;
  verified?: boolean;
  featured?: boolean;
  /** Path to a real screenshot in /public/previews. Falls back to a schematic. */
  screenshot?: string;
  /** Include in the home page's Recent Work strip. */
  home?: boolean;
  services: ServiceSlug[];
};

export const projects: Project[] = [
  /* ── The four on the home page's Recent Work strip ─────────────────── */

  {
    name: "Roofing contractor",
    category: "SEO audit",
    detail:
      "A full technical and local-search audit of a roofing company's site, down to the page level.",
    status: "in-progress",
    intent:
      "Auditing every page against the searches it should be winning.",
    home: true,
    // Local search and Google Business Profile work sits inside the Websites
    // offer rather than being sold as a separate service.
    services: ["websites"],
  },
  {
    name: "iSmile",
    category: "AI receptionist",
    detail:
      "A voice agent that answers the practice line, screens the caller, and books the appointment.",
    status: "in-progress",
    intent:
      "Built to catch the after-hours calls that currently hit voicemail.",
    home: true,
    services: ["ai-receptionist"],
  },
  {
    name: "Restaurant booking",
    category: "Booking flow",
    detail:
      "A reservation flow with live table availability, deposits, and automatic reminders.",
    status: "in-progress",
    intent:
      "Built to take reservations off the front-of-house phone during service.",
    home: true,
    services: ["booking-systems"],
  },

  /* ── The rest of the portfolio ─────────────────────────────────────── */

  {
    name: "Clinical Scribe",
    category: "Consult capture",
    // Built, entering pilot testing on a few real consults — no outcome to
    // claim yet. Move to `outcome` when the pilot reports, in step with
    // /work/clinical-scribe.
    status: "in-progress",
    intent: "Built to keep a record of every consult. Now entering pilot testing.",
    detail:
      "A consult capture and follow-up system for an orthodontic practice. It records the consultation, drafts the doctor letter and the patient take-home letter from it, and gives the coordinator follow-up messages written from what was actually said.",
    // No `href`: the system handles patient data and will sit behind the
    // practice's login, so there is nothing a visitor could be sent to.
    // /work/clinical-scribe is the public record instead, which is why this
    // carries no "Visit site" anywhere on the site. The practice is not named.
    //
    // Untagged on purpose: consult capture is none of the four services we
    // sell by name. An honest empty tag beats padding it onto a page it
    // doesn't belong on — see the tagging rule at the top of this file.
    services: [],
  },
  {
    name: "Travelyt",
    category: "Booking platform",
    outcome: "Full quote-to-booking flow, live",
    detail:
      "A door-to-airport baggage delivery platform, built end to end — quote, book, pay, all in one flow.",
    href: "https://travelyt-psi.vercel.app",
    verified: true,
    featured: true,
    services: ["websites", "booking-systems"],
  },
  {
    name: "FW Wheels",
    category: "Automotive e-commerce",
    outcome: "Full wheel & tire storefront, live",
    detail:
      "An online storefront for a wheels and tire business — product catalog, built to sell.",
    href: "https://fw-wheels.vercel.app/",
    verified: true,
    featured: true,
    services: ["websites"],
  },
  {
    name: "Joon",
    category: "Automotive site",
    outcome: "Live automotive build",
    detail: "A clean, built-to-convert site for an automotive business.",
    href: "https://joon11ee.com",
    verified: true,
    featured: true,
    screenshot: "/previews/joon.jpg",
    services: ["websites"],
  },
  {
    name: "OlyLife Ohana",
    category: "E-commerce store",
    outcome: "Product education + full store flow",
    detail:
      "An e-commerce build focused on product education alongside the storefront itself.",
    href: "https://www.olylifeohana.com/",
    verified: true,
    services: ["websites"],
  },
  {
    name: "The Sticker Smith",
    category: "Print shop website",
    outcome: "Custom ordering path + full brand system",
    detail: "A custom ordering flow built for a print shop, tied to a full brand refresh.",
    href: "https://tssprint.vercel.app/",
    verified: true,
    // Ordering, not appointments — e-commerce rather than a booking system.
    services: ["websites"],
  },
  {
    name: "Pomaika'i Co",
    category: "Business website",
    outcome: "Full brand + site build, live",
    detail: "A clean, professional site build for a local business.",
    href: "https://poika.vercel.app/",
    verified: true,
    services: ["websites"],
  },
  {
    name: "Velvet",
    category: "Nightclub booking + automation",
    outcome: "500+ guest lists automated per week",
    detail:
      "A booking and automation system for Vegas nightclub promoters. Promoters send a name — the system handles the rest.",
    href: "https://www.reesvip.com/",
    verified: true,
    services: ["booking-systems"],
  },

  /* ── Untagged on purpose ───────────────────────────────────────────────
     These three were V1's "Creative & Custom" bucket, which is not one of the
     four services. There is no honest fit, so they carry no slug and appear on
     /work only. Padding them onto a service page would misrepresent the offer. */

  {
    name: "Cubicship",
    category: "Enterprise training app",
    outcome: "Live across 100+ DHL stores, expanding to Canada",
    detail: "A gamified training app deployed across DHL premier partner stores in Chicago.",
    href: "https://cubicship-translator.vercel.app",
    verified: true,
    services: [],
  },
  {
    name: "Paper Trader",
    category: "Trading simulator",
    outcome: "Tier ladder, live practice mode, auth + saved progress",
    detail:
      "A funded-evaluation trading simulator with real accounts and database-backed progress.",
    href: "https://paper-trader-two-eta.vercel.app/",
    verified: true,
    services: [],
  },
  {
    name: "Quanta",
    category: "Online casino platform",
    outcome: "$50K+ platform · 23 games · real-time multiplayer",
    detail: "A full sweepstakes casino built from scratch, including the admin panel behind it.",
    href: "https://quantplay-ten.vercel.app/play",
    verified: true,
    services: [],
  },
];

/* ── Queries ──────────────────────────────────────────────────────────── */

/** The four shown on the home page's Recent Work strip, in order. */
export const homeProof = projects.filter((p) => p.home);

/** A project's status. Absent means live, so shipped work carries no flag. */
export function statusOf(p: Project): ProjectStatus {
  return p.status ?? "live";
}

export function isLive(p: Project): boolean {
  return statusOf(p) === "live";
}

/**
 * The line a card prints under the description: the outcome once it's shipped,
 * the intent while it's still in the shop.
 *
 * Deliberately no fallback between the two. An in-progress project with only an
 * `outcome` renders no line at all rather than borrowing a past-tense claim —
 * silently falling back is exactly how a card ends up promising a result the
 * client hasn't had yet, which is the thing this split exists to prevent.
 */
export function resultLine(p: Project): string | undefined {
  const line = isLive(p) ? p.outcome : p.intent;

  if (!line && process.env.NODE_ENV !== "production") {
    console.warn(
      `[projects] "${p.name}" is ${statusOf(p)} but has no ` +
        `${isLive(p) ? "`outcome`" : "`intent`"}, so its card prints no ` +
        `result line. Add one, or move the copy to the right field.`
    );
  }

  return line;
}

export function projectsForService(slug: ServiceSlug) {
  const matched = projects.filter((p) => p.services.includes(slug));

  // The proof strip is the point of a service page. If a slug matches nothing,
  // the page still renders — just with its most persuasive section silently
  // empty. That is exactly the failure that survives review, so say it loudly
  // in dev. sales-intelligence is a known, deliberate zero: it ships a product
  // mock instead, until there is delivered work to show.
  if (
    matched.length === 0 &&
    slug !== "sales-intelligence" &&
    process.env.NODE_ENV !== "production"
  ) {
    console.warn(
      `[projects] No projects tagged "${slug}". The proof strip on that ` +
        `service page will be empty. Tagged slugs in use: ` +
        `${knownServiceSlugs().join(", ")}`
    );
  }

  return matched;
}

/** Every slug currently tagged on at least one project. */
export function knownServiceSlugs(): string[] {
  return [...new Set(projects.flatMap((p) => p.services))].sort();
}

/**
 * slug → number of projects tagged with it.
 *
 * Run this against a candidate service list before shipping the pages: any slug
 * that comes back 0 needs projects retagged, or its page ships without proof.
 */
export function serviceCoverage(slugs: string[]): Record<string, number> {
  return Object.fromEntries(
    slugs.map((s) => [s, projects.filter((p) => p.services.includes(s)).length])
  );
}
