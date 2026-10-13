import type { ServiceSlug } from "@/lib/projects";

/**
 * Client testimonials.
 *
 * Structured like the projects dataset: one record, tagged with the service it
 * proves, read by both the service pages and the home page.
 *
 * Tagging rule, same as projects — tag only where it genuinely belongs:
 *   with a `service`  → eligible for that service page, and for the home slot
 *   without a `service` → home slot only
 *
 * The home page shows exactly one, and takes the first in this array. To
 * feature a different quote there, move it to the top.
 */
export type Testimonial = {
  quote: string;
  /** Who said it. Omit when we only have the business on record. */
  name?: string;
  /** The business they run or work for. */
  business: string;
  /** Which service page this belongs on. Omit for home-page-only. */
  service?: ServiceSlug;
};

export const testimonials: Testimonial[] = [
  {
    // The strongest proof in the repo and the only one carrying a hard number.
    quote:
      "The AI receptionist books appointments while we sleep — 40-plus a month, automatically.",
    business: "Vacaville Appliance",
    service: "ai-receptionist",
  },
  {
    quote:
      "We needed something to handle 500 or more guest lists a week. The system does it automatically now — our promoters just send a name.",
    business: "Velvet",
    service: "booking-systems",
  },
  {
    quote:
      "The translator app handles over 100 stores across Chicago, and we're expanding into Canada next. It just works.",
    business: "Cubicship / DHL",
    // No service tag: the DHL build maps to none of the four, so this one is
    // home-slot eligible only.
  },
];

/** Testimonials that belong on a given service page. */
export function testimonialsForService(slug: ServiceSlug) {
  return testimonials.filter((t) => t.service === slug);
}

/** The single quote the home page shows — first in array order. */
export function homeTestimonial(): Testimonial | undefined {
  return testimonials[0];
}
