import Image from "next/image";
import type { CaseShot, CaseStep, CaseStudy } from "@/lib/case-studies";
import { Page } from "@/components/kozmoz/page";
import { Contact } from "@/components/kozmoz/contact";
import { cn } from "@/lib/utils";

/**
 * The case-study template: one layout, driven entirely by a `CaseStudy` from
 * lib/case-studies. app/work/[slug] renders every study through it, so a new
 * study is a data file, not a page.
 *
 * In the home page's frame (components/kozmoz/page.tsx) and type, but set as
 * a reading page: no seam, and the long text in one left-aligned column.
 *
 * What a study leads with is Capabilities — three lines on what the thing
 * does. The one figure it can carry, `resultNumber`, is optional and only
 * prints when it has a value: a page that cannot publish the client's numbers
 * is better off making a plain claim about the work than dressing an empty
 * metric up as one. Screenshots work the same way: a shot prints only once it
 * has media, and nothing stands in for one meanwhile.
 */
export function CaseStudyPage({ study }: { study: CaseStudy }) {
  const steps = [study.problem, study.build, study.result];
  const resultNumber = study.resultNumber?.value.trim() ? study.resultNumber : undefined;

  return (
    // The header's Contact link stays on the page: the study ends in its own form.
    <Page local={["#contact"]}>
      <header className="cs-head">
        <p className="cs-eyebrow label">{study.eyebrow}</p>
        <h1 className="cs-title">{study.title}</h1>
        <p className="cs-sub">{study.subhead}</p>

        <dl className="cs-facts">
          <div>
            <dt className="label">Client</dt>
            <dd>{study.clientType}</dd>
          </div>
          <div>
            <dt className="label">Status</dt>
            <dd>{study.status}</dd>
          </div>
        </dl>

        <Capabilities items={study.capabilities} />

        <Shot shot={study.hero} priority />
      </header>

      {/* ── Problem → Build → Result ─────────────────────────────────── */}
      <section className="cs-steps" aria-label="The problem, the build and the result">
        <ol>
          {steps.map((step, i) => (
            <Step
              key={step.kind}
              step={step}
              index={i}
              figure={step === study.result ? resultNumber : undefined}
            />
          ))}
        </ol>
      </section>

      {/* ── How we approached it, and how sensitive data is handled ──── */}
      <section className={cn("cs-notes", study.compliance && "cs-notes--two")}>
        <div className="cs-note">
          <h2 className="label">{study.approach.heading}</h2>
          <p className="cs-body">{study.approach.body}</p>
        </div>
        {study.compliance && (
          <ComplianceBlock heading={study.compliance.heading} lines={study.compliance.lines} />
        )}
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
    </Page>
  );
}

/**
 * Three short lines on what the system does, under the facts.
 *
 * Hairline-separated rather than bulleted: it reads as one statement in three
 * parts, which is what it is, rather than as the first three items of a
 * feature list that got cut short.
 */
function Capabilities({ items }: { items: string[] }) {
  return (
    <ul className="cs-caps">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
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
    <li className="cs-step">
      <p className="cs-step-n label">
        <span>{String(index + 1).padStart(2, "0")}</span> {step.kind}
      </p>
      <h2 className="cs-step-h">{step.heading}</h2>
      <p className="cs-body">{step.body}</p>

      {figure && (
        <div className="cs-figure">
          <p className="cs-figure-n">{figure.value}</p>
          <p className="label">{figure.label}</p>
        </div>
      )}

      <Shot shot={step.shot} />
    </li>
  );
}

/**
 * How sensitive data is handled: a few statements of fact, hairline-separated.
 *
 * Deliberately quieter than the steps — smaller type, set beside the approach
 * note rather than under it — because it is reference, not argument. Someone
 * who needs it will go looking for it; someone who doesn't should be able to
 * see at a glance that it is there and move on.
 */
function ComplianceBlock({ heading, lines }: { heading: string; lines: string[] }) {
  return (
    <div className="cs-note cs-note--data">
      <h2 className="label">{heading}</h2>
      <ul>
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

/** A screenshot, once the client has signed one off; until then, nothing. */
function Shot({ shot, priority }: { shot?: CaseShot; priority?: boolean }) {
  const m = shot?.media;
  if (!m) return null;

  return (
    <figure className="cs-shot">
      {m.kind === "image" ? (
        <Image
          src={m.src}
          alt={m.alt}
          fill
          sizes="(max-width: 1023px) 100vw, (min-width: 1921px) 1280px, 67vw"
          priority={priority}
        />
      ) : m.loop ? (
        <video src={m.src} poster={m.poster} title={m.title} autoPlay muted loop playsInline />
      ) : (
        <video src={m.src} poster={m.poster} title={m.title} controls playsInline />
      )}
    </figure>
  );
}
