import type { Metadata } from "next";
import { LegalPage } from "../legal-layout";

// NOTE for whoever edits this: real, usable draft — not obviously-fake
// placeholder text — but it hasn't had a lawyer's review yet. Fine to ship
// before that; worth a real pass once you're handling client data at volume.

export const metadata: Metadata = {
  title: "Privacy — Kozmoz",
  description: "What Kozmoz collects through the site, and what happens to it.",
};

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy"
      updated="August 2026"
      sections={[
        {
          heading: "What we collect",
          body: (
            <p>
              When you start a project we collect your name, email or phone number, business name,
              what you said you need, and whatever you write in the message. We
              don&rsquo;t use tracking cookies and we don&rsquo;t sell anything
              to third parties.
            </p>
          ),
        },
        {
          heading: "How it's used",
          body: (
            <p>
              Messages go to our inbox so we can reply, and are stored against the
              reference number we send back to you. That&rsquo;s it. You
              don&rsquo;t get added to a mailing list.
            </p>
          ),
        },
        {
          heading: "Analytics",
          body: (
            <p>
              We use privacy-respecting analytics to see which sections get read
              and which links get clicked — no individual tracking, no cookies,
              no ad networks.
            </p>
          ),
        },
        {
          heading: "Your data",
          body: (
            <p>
              Email{" "}
              <a
                href="mailto:studio.omora@gmail.com"
                className="text-violet underline decoration-violet-deep underline-offset-4 transition-colors hover:text-violet"
              >
                studio.omora@gmail.com
              </a>{" "}
              any time to see what we hold on you or to have it deleted. Quote
              your reference number if you have one and it&rsquo;s faster.
            </p>
          ),
        },
      ]}
    />
  );
}
