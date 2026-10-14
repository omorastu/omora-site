import type { CaseStep } from "@/lib/case-studies";
import { Reveal } from "@/components/motion";
import { MediaSlot } from "@/components/home/media-slot";

/**
 * The pieces a case-study page is built from.
 *
 * All dark, following the v3 home page rather than the dark → cream → dark of
 * the older subpages: those are still v2 and due a rebuild, so this sets the
 * v3 subpage pattern instead of matching what it will replace.
 *
 * There is no figure component here on purpose. What a case study has instead
 * is Capabilities — three lines on what the thing does. A page that cannot
 * publish the client's numbers is better off making a plain claim about the
 * work than dressing an empty metric band up as one.
 */

/**
 * Three short lines on what the system does, under the subhead.
 *
 * Hairline-separated rather than bulleted: it reads as one statement in three
 * parts, which is what it is, rather than as the first three items of a
 * feature list that got cut short.
 */
export function Capabilities({ items }: { items: string[] }) {
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
export function Step({ step, index }: { step: CaseStep; index: number }) {
  return (
    <Reveal as="li" delay={index * 80} className="border-t border-line pt-7">
      <p className="flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-[0.16em]">
        <span className="text-violet">{step.n}</span>
        <span className="text-muted/80">{step.kind}</span>
      </p>

      <h3 className="mt-4 max-w-[24ch] text-balance font-display text-2xl font-semibold leading-[1.15] tracking-[-0.02em] text-ink">
        {step.heading}
      </h3>

      <p className="mt-4 max-w-prose text-pretty text-[17px] leading-[1.7] text-muted">
        {step.body}
      </p>

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
export function NoteBlock({ heading, body }: { heading: string; body: string }) {
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
 * How patient data is handled: a few statements of fact, hairline-separated.
 *
 * Deliberately quieter than the numbered steps — smaller type, no display
 * face, bounded by a panel — because it is reference, not argument. Someone
 * who needs it will go looking for it; someone who doesn't should be able to
 * see at a glance that it is there and move on.
 */
export function ComplianceBlock({
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
