/**
 * Pricing — the packages, the terms, and the per-service pointers.
 *
 * Ported from the V1 site's /pricing page. The ranges, feature lists and terms
 * below are real published prices, so treat them as content that has been
 * committed to publicly: change a number here only when the number has actually
 * changed, not to make a card look tidier.
 */

export type Tier = {
  name: string;
  price: string;
  tagline: string;
  /** Flags the one card that carries the "Most popular" badge. */
  popular?: boolean;
  features: string[];
};

export const tiers: Tier[] = [
  {
    name: "Landing page",
    price: "from $497",
    tagline: "Look real. Get found.",
    features: [
      "Single custom page",
      "Mobile-optimized",
      "Contact form",
      "Live in about a week",
    ],
  },
  {
    name: "Website",
    price: "from $3,000",
    tagline: "The full custom build.",
    popular: true,
    features: [
      "Everything in Landing page",
      "Multi-page custom site",
      "SEO setup",
      "Editable content, no page builder",
      "Live in under two weeks",
    ],
  },
  {
    name: "E-commerce / AI system",
    price: "$5,000–$15,000",
    tagline: "The store or system runs itself.",
    features: [
      "Everything in Website",
      "Store, booking, or CRM build",
      "AI follow-up / automation",
      "3–6 week build",
    ],
  },
  {
    name: "Custom platform",
    price: "$15,000+",
    tagline: "Marketplaces, dashboards, full systems.",
    features: [
      "Everything in E-commerce / AI",
      "Multi-user / role-based access",
      "Custom admin dashboard",
      "Ongoing support available",
    ],
  },
];

/** The three terms printed under the cards. */
export const terms = [
  {
    label: "Payment",
    body: "50% to start, 50% on launch. Larger builds split across milestones.",
  },
  {
    label: "Ownership",
    body: "Everything we build — code, domain, data — is yours from day one.",
  },
  {
    label: "After launch",
    body: "30 days of free tweaks, then optional retainers from $500/month for hosting and support.",
  },
];

/**
 * The pricing line a service page shows under its CTA, keyed by service slug.
 *
 * Deliberately partial. A slug with no entry renders no line at all — the two
 * missing services have numbers that aren't settled yet, and a made-up range
 * sitting under a call-to-action is worse than saying nothing. Add an entry
 * here and the line appears on that page on its own.
 */
export const servicePriceNote: Record<string, string> = {
  websites: "Most website builds start at $3,000.",
  "booking-systems": "Booking builds typically run $5,000–$15,000.",
  // ai-receptionist:    pending — number not decided
  // sales-intelligence: pending — number not decided
};
