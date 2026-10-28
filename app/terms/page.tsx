import type { Metadata } from "next";
import { LegalPage } from "../legal-layout";

// NOTE for whoever edits this: real, usable boilerplate — not obviously-fake
// placeholder text — but it hasn't been reviewed by a lawyer. Worth a real
// legal pass once the business is taking deposits at volume.

export const metadata: Metadata = {
  title: "Terms — Omora",
  description: "How Omora scopes, bills, and delivers work.",
};

export default function Terms() {
  return (
    <LegalPage
      title="Terms"
      updated="August 2026"
      sections={[
        {
          heading: "Project scope",
          body: (
            <p>
              Every project starts with a written plan covering deliverables,
              timeline, and price. Work outside that plan — new pages, features,
              or a change of direction after approval — gets quoted separately
              rather than assumed to be included.
            </p>
          ),
        },
        {
          heading: "Payment",
          body: (
            <p>
              Standard terms are 50% to begin and 50% on launch. Larger builds
              can be split across milestones instead. Work pauses if a scheduled
              payment is more than 7 days late.
            </p>
          ),
        },
        {
          heading: "Revisions",
          body: (
            <p>
              Each project includes two rounds of revisions during the build.
              Further rounds, or changes requested after the 30-day post-launch
              window, are billed at our standard hourly rate.
            </p>
          ),
        },
        {
          heading: "Cancellation",
          body: (
            <p>
              Either side can cancel in writing. Work completed up to that point
              is billed, and the deposit covers work already done once the build
              has started.
            </p>
          ),
        },
        {
          heading: "Ownership",
          body: (
            <p>
              Once the final payment clears, you own the code, the domain, and
              the content we built for you outright. Nothing stays locked behind
              our accounts.
            </p>
          ),
        },
      ]}
    />
  );
}
