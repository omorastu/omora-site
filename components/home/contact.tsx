import { sections } from "@/lib/home";
import { Reveal } from "@/components/motion";
import { SectionHead } from "@/components/site/section-head";
import { LeadForm } from "@/components/site/lead-form";

/**
 * The ticket. Same form and same /api/lead backend as every other page — the
 * work order, the spam handling, the stamped docket on success — under the
 * home page's heading. Keeps `id="ticket"` because every CTA on the site,
 * including the nav's, lands on it.
 *
 * Under the form, the text line. Nobody on a jobsite fills out a form, so the
 * moment there's a number that's answered it goes in lib/home.ts and this
 * prints it; until then the slot says so rather than printing a fake one.
 */
export function Contact() {
  const { phone } = sections.contact;

  return (
    <section
      id="ticket"
      className="layer border-t border-violet-deep/40 bg-raised/40 px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-wrap">
        <SectionHead
          tone="dark"
          plate="Start here"
          title={sections.contact.title}
          intro={sections.contact.lede}
        />

        <div className="max-w-3xl">
          <Reveal delay={80}>
            <LeadForm />
          </Reveal>

          <Reveal delay={160}>
            {phone ? (
              <p className="mt-7 rounded-lg border border-violet-dim px-5 py-4 text-pretty text-sm leading-relaxed text-muted">
                <b className="font-semibold text-ink">Rather just text?</b> Send a message to{" "}
                <a
                  href={`sms:${phone.replace(/[^\d+]/g, "")}`}
                  className="text-violet underline-offset-4 transition-colors hover:text-ink hover:underline"
                >
                  {phone}
                </a>
                .
              </p>
            ) : (
              <p
                role="note"
                aria-label="Text number — not yet supplied"
                className="mt-7 rounded-lg border border-dashed border-violet/40 px-5 py-4 text-pretty text-sm leading-relaxed text-muted/70"
              >
                <b className="font-semibold text-muted">Rather just text?</b>{" "}
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-violet/70">
                  Number to come
                </span>{" "}
                — the line prints here once there&rsquo;s one that&rsquo;s answered.
              </p>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
