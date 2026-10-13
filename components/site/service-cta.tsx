"use client";

import type { Service } from "@/lib/content";
import { PREFILL_EVENT } from "@/lib/prefill";

/**
 * The primary CTA on a service page.
 *
 * This is where the prefill fires now. It used to sit on the home cards, but
 * those open the service page instead — so by the time someone reaches this
 * button they've read what the thing is, and the form arrives with the right
 * box already ticked.
 *
 * The href does the work on its own if JS hasn't loaded: the contact form is on
 * this same page, so the anchor still lands in the right place, just without
 * the preselection.
 */
export function ServiceCta({ service }: { service: Service }) {
  return (
    <a
      href="#contact"
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent(PREFILL_EVENT, { detail: { need: service.slug } })
        )
      }
      className="mt-10 inline-flex items-center gap-3 rounded-full bg-violet-deep px-7 py-4 font-medium text-ink shadow-[0_14px_40px_-14px_rgba(139,79,230,0.7)] transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
    >
      Tell us the problem
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
        <path
          d="M2.5 8h11m0 0-4-4m4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}
