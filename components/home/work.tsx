import { recentWork, type RecentProject } from "@/lib/home";
import { Reveal } from "@/components/motion";
import { MediaSlot } from "@/components/home/media-slot";

/**
 * Recent work: three projects, each a screenshot slot, category, name, then
 * Problem / Built / Result on three labelled lines. Result carries the number.
 *
 * The full project list lives on the Work page, not here. Any field not yet
 * filled in lib/home.ts prints as a bracketed placeholder in the dashed slot
 * style, so an unfinished card reads as unfinished rather than as a claim.
 */

/** A bracketed stand-in for a field that hasn't been written yet. */
function Pending({ children }: { children: string }) {
  return <span className="font-mono text-[12px] tracking-[0.04em] text-muted/70">[ {children} ]</span>;
}

function Line({
  label,
  value,
  pending,
  accent,
}: {
  label: string;
  value?: string;
  pending: string;
  accent?: boolean;
}) {
  return (
    <div>
      <dt className="mb-[3px] font-mono text-[10px] uppercase tracking-[0.14em] text-muted/80">
        {label}
      </dt>
      <dd className={accent ? "text-violet" : "text-muted"}>
        {value ?? <Pending>{pending}</Pending>}
      </dd>
    </div>
  );
}

function ProjectCard({ item, index }: { item: RecentProject; index: number }) {
  return (
    <Reveal as="li" delay={index * 80}>
      <a href={item.href ?? recentWork.all.href} className="group block">
        <MediaSlot
          media={item.screenshot}
          ratio="16/10"
          label="Project screenshot"
          sizes="(max-width: 768px) 100vw, 33vw"
          className="transition-colors group-hover:border-violet-dim"
        />
        <p className="mt-[18px] font-mono text-[10px] uppercase tracking-[0.16em] text-violet">
          {item.category}
        </p>
        <h3 className="mt-2 font-display text-[19px] font-semibold text-ink">
          {item.name ?? <Pending>Project name</Pending>}
        </h3>
        {item.description && (
          <p className="mt-2 text-pretty text-sm leading-[1.55] text-muted">
            {item.description}
          </p>
        )}
        <dl className="mt-3.5 flex flex-col gap-[9px] text-sm leading-[1.55]">
          <Line label="Problem" value={item.problem} pending="What was broken" />
          <Line label="Built" value={item.built} pending="What we made" />
          <Line label="Result" value={item.result} pending="The number" accent />
        </dl>

        {/* A span, not an anchor: the whole card is already the link, and an
            <a> inside an <a> is invalid. The card's own href decides where
            this goes — the study where there is one, /work where there isn't. */}
        <span className="mt-5 inline-block border-b border-violet-dim pb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-violet transition-colors group-hover:text-ink">
          {recentWork.learnMore}
        </span>
      </a>
    </Reveal>
  );
}

export function Work() {
  return (
    <section id="work" className="layer scroll-mt-16 border-t border-line px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-wrap">
        <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-7">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-[34px]">
            {recentWork.title}
          </h2>
          <a
            href={recentWork.all.href}
            className="border-b border-violet-dim pb-1 font-mono text-xs uppercase tracking-[0.12em] text-violet transition-colors hover:text-ink"
          >
            {recentWork.all.label}
          </a>
        </Reveal>

        <ul className="grid gap-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {recentWork.items.map((item, i) => (
            <ProjectCard key={i} item={item} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}
