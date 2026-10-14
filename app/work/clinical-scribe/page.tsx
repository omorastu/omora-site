import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { caseStudyFor } from "@/lib/case-studies";
import { Reveal } from "@/components/motion";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { Closing } from "@/components/site/closing";
import { MediaSlot } from "@/components/home/media-slot";
import { Capabilities, Step, NoteBlock } from "@/components/work/case-study";

const SLUG = "clinical-scribe";

export const metadata: Metadata = {
  title: "Clinical Scribe — Omora",
  description:
    "A documentation tool built for a clinical practice: one recorded consult drafts the note, the referral letter and the patient summary, each approved by a clinician before it is filed.",
};

/**
 * /work/clinical-scribe — the first case study.
 *
 * A static route beside the /work index rather than a dynamic segment: there
 * is one study today, and a [slug] route that prerenders a single page is
 * indirection with nothing on the other side of it. When there are three,
 * `caseStudies` already carries the slug, so moving to app/work/[slug] is a
 * file move and a generateStaticParams, not a rewrite.
 *
 * All dark, matching the v3 home page. The older subpages still run v2's
 * dark → cream → dark and are due a rebuild; this sets the pattern they move
 * to rather than copying the one they are leaving.
 */
export default function ClinicalScribe() {
  const study = caseStudyFor(SLUG);
  if (!study) notFound();

  return (
    <>
      <Nav />
      <main id="main" className="relative">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <header className="layer px-6 pb-20 pt-36 sm:pb-24 sm:pt-44">
          <div className="mx-auto max-w-wrap">
            <p className="rise plate" style={{ animationDelay: "40ms" }}>
              {study.eyebrow}
            </p>

            <h1
              className="rise mt-7 max-w-[18ch] text-balance font-display text-[clamp(2.4rem,6vw,4.25rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink"
              style={{ animationDelay: "120ms" }}
            >
              {study.title}
            </h1>

            <p
              className="rise mt-7 max-w-[62ch] text-pretty text-lg leading-relaxed text-muted sm:text-xl"
              style={{ animationDelay: "220ms" }}
            >
              {study.subhead}
            </p>

            <Capabilities items={study.capabilities} />

            {/* The product shot sits high on purpose: the reference site makes
                you read three sections before seeing the thing. */}
            <div className="mt-14 sm:mt-16">
              <MediaSlot
                media={study.hero.media}
                ratio="16/9"
                label={study.hero.label}
                hint={study.hero.hint}
                priority
              />
            </div>
          </div>
        </header>

        {/* ── Before → Build → Result ──────────────────────────────────── */}
        <section className="layer scroll-mt-16 border-t border-line bg-band px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-wrap">
            <ol className="flex flex-col gap-16 sm:gap-20">
              {study.steps.map((step, i) => (
                <Step key={step.n} step={step} index={i} />
              ))}
            </ol>
          </div>
        </section>

        {/* ── How we approached it, and what this page claims ──────────── */}
        <section className="layer scroll-mt-16 border-t border-line px-6 py-20 sm:py-24">
          <div className="mx-auto grid max-w-wrap gap-14 lg:grid-cols-2 lg:gap-16">
            <NoteBlock heading={study.note.heading} body={study.note.body} />
            <NoteBlock
              heading={study.scope.heading}
              body={study.scope.body}
              tone="bounded"
            />
          </div>
        </section>

        {/* ── Closing ──────────────────────────────────────────────────────
            The case-specific question, then the form itself. No button
            between them: Closing carries the work order and is the next thing
            on screen, so a CTA here would only scroll past its own answer. */}
        <section className="layer border-t border-line bg-band px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-wrap">
            <Reveal>
              <h2 className="max-w-[20ch] text-balance font-display text-3xl font-semibold leading-[1.12] tracking-[-0.025em] text-ink sm:text-[34px]">
                {study.cta.heading}
              </h2>
              <p className="mt-5 max-w-prose text-pretty text-[17px] leading-[1.7] text-muted">
                {study.cta.body}
              </p>
            </Reveal>
          </div>
        </section>

        <Closing />
      </main>
      <Footer />

      <div className="grain" aria-hidden="true" />
    </>
  );
}
