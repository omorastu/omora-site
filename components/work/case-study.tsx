import type { CaseStep, CaseStudy } from "@/lib/case-studies";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { MediaSlot } from "@/components/home/media-slot";
import { Contact } from "@/components/home/contact";

/**
 * The case-study template: one layout, driven entirely by a `CaseStudy` from
 * lib/case-studies. app/work/[slug] renders every study through it, so a new
 * study is a data file, not a page.
 *
 * All dark, following the v3 home page rather than the dark → cream → dark of
 * the older subpages: those are still v2 and due a rebuild, so this sets the
 * v3 subpage pattern instead of matching what it will replace.
 *
 * What a study leads with is Capabilities — three lines on what the thing
 * does. The one figure it can carry, `resultNumber`, is optional and only
 * prints when it has a value: a page that cannot publish the client's numbers
 * is better off making a plain claim about the work than dressing an empty
 * metric up as one.
 */
export function CaseStudyPage({ study }: { study: CaseStudy }) {
  const steps = [study.problem, study.build, study.result];
  const resultNumber = study.resultNumber?.value.trim() ? study.resultNumber : undefined;

  return (
    <>
      <Nav contactHref="#contact" />
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

            <Facts clientType={study.clientType} status={study.status} />

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

        {/* ── Problem → Build → Result ─────────────────────────────────── */}
        <section className="layer scroll-mt-16 border-t border-line bg-band px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-wrap">
            <ol className="flex flex-col gap-16 sm:gap-20">
              {steps.map((step, i) => (
                <Step
                  key={i}
                  step={step}
                  index={i}
                  figure={step === study.result ? resultNumber : undefined}
                />
              ))}
            </ol>
          </div>
        </section>

        {/* ── How we approached it, and how sensitive data is handled ──── */}
        <section className="layer scroll-mt-16 border-t border-line px-6 py-20 sm:py-24">
          <div
            className={cn(
              "mx-auto grid max-w-wrap gap-12",
              study.compliance && "lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16"
            )}
          >
            <NoteBlock heading={study.approach.heading} body={study.approach.body} />
            {study.compliance && (
              <ComplianceBlock
                heading={study.compliance.heading}
                lines={study.compliance.lines}
              />
            )}
          </div>
        </section>

        {/* ── Closing ──────────────────────────────────────────────────────
            The home page's contact section, headed by the study's own
            question. One section, not a question stacked on a second contact
            block: the form is the answer to the heading above it. */}
        <Contact
          title={study.cta.heading}
          lede={study.cta.body}
          source={`omora.studio/work/${study.slug}`}
        />
      </main>
      <Footer />

      <div className="grain" aria-hidden="true" />
    </>
  );
}

/**
 * Who the client is and where the work stands, on two labelled lines under
 * the subhead. Same label voice as the Problem / Built / Result lines on the
 * home page's work cards.
 */
function Facts({ clientType, status }: { clientType: string; status: string }) {
  return (
    <dl
      className="rise mt-8 flex flex-wrap gap-x-12 gap-y-4 text-[15px] leading-[1.55]"
      style={{ animationDelay: "300ms" }}
    >
      <div>
        <dt className="mb-[3px] font-mono text-[10px] uppercase tracking-[0.14em] text-muted/80">
          Client
        </dt>
        <dd className="text-ink/90">{clientType}</dd>
      </div>
      <div>
        <dt className="mb-[3px] font-mono text-[10px] uppercase tracking-[0.14em] text-muted/80">
          Status
        </dt>
        <dd className="text-violet">{status}</dd>
      </div>
    </dl>
  );
}

/**
 * Three short lines on what the system does, under the subhead.
 *
 * Hairline-separated rather than bulleted: it reads as one statement in three
 * parts, which is what it is, rather than as the first three items of a
 * feature list that got cut short.
 */
function Capabilities({ items }: { items: string[] }) {
  return (
    <Reveal className="mt-12 sm:mt-14">
      <ul className="grid gap-px overflow-hidden border-y border-line bg-line sm:grid-cols-3">
        {items.map((item) => (
          <li key={item} className="bg-bg px-6 py-6 sm:px-7">
            <p className="max-w-[28ch] text-pretty text-[15px] leading-relaxed text-ink/90">
              {item}
            </p>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

/**
 * One numbered step. The number and its kind sit on a rule above the heading,
 * so the three read as a sequence rather than three unrelated headings.
 */
function Step({
  step,
  index,
  figure,
}: {
  step: CaseStep;
  index: number;
  /** The result number, on the result step only, and only when it's set. */
  figure?: { value: string; label: string };
}) {
  return (
    <Reveal as="li" delay={index * 80} className="border-t border-line pt-7">
      <p className="flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-[0.16em]">
        <span className="text-violet">{String(index + 1).padStart(2, "0")}</span>
        <span className="text-muted/80">{step.kind}</span>
      </p>

      <h3 className="mt-4 max-w-[24ch] text-balance font-display text-2xl font-semibold leading-[1.15] tracking-[-0.02em] text-ink">
        {step.heading}
      </h3>

      <p className="mt-4 max-w-prose text-pretty text-[17px] leading-[1.7] text-muted">
        {step.body}
      </p>

      {figure && (
        <div className="mt-8">
          <p className="font-display text-[clamp(2.75rem,7vw,4.5rem)] font-semibold leading-none tracking-[-0.03em] text-violet">
            {figure.value}
          </p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted/80">
            {figure.label}
          </p>
        </div>
      )}

      {step.shot && (
        <div className="mt-8">
          <MediaSlot
            media={step.shot.media}
            ratio="16/9"
            label={step.shot.label}
            hint={step.shot.hint}
            sizes="(max-width: 1024px) 100vw, 75vw"
          />
        </div>
      )}
    </Reveal>
  );
}

/**
 * A short prose block with a mono heading. One tone — the approach note is the
 * only thing that uses it.
 */
function NoteBlock({ heading, body }: { heading: string; body: string }) {
  return (
    <Reveal>
      <div>
        <p className="plate">{heading}</p>
        <p className="mt-4 max-w-prose text-pretty text-[17px] leading-[1.7] text-muted">
          {body}
        </p>
      </div>
    </Reveal>
  );
}

/**
 * How sensitive data is handled: a few statements of fact, hairline-separated.
 *
 * Deliberately quieter than the numbered steps — smaller type, no display
 * face, bounded by a panel — because it is reference, not argument. Someone
 * who needs it will go looking for it; someone who doesn't should be able to
 * see at a glance that it is there and move on.
 */
function ComplianceBlock({
  heading,
  lines,
}: {
  heading: string;
  lines: string[];
}) {
  return (
    <Reveal delay={80}>
      <div className="rounded-lg border border-line bg-raised/40 px-6 py-6 sm:px-7">
        <p className="plate">{heading}</p>
        <ul className="mt-4">
          {lines.map((line, i) => (
            <li
              key={line}
              className={
                i === 0
                  ? "py-2.5 text-pretty text-sm leading-relaxed text-muted"
                  : "border-t border-line py-2.5 text-pretty text-sm leading-relaxed text-muted"
              }
            >
              {line}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
