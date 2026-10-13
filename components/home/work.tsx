import { projects, isLive, resultLine, type Project } from "@/lib/projects";
import { sections, CAPACITY } from "@/lib/home";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion";
import { SectionHead } from "@/components/site/section-head";
import { MediaSlot } from "@/components/home/media-slot";
import { HomeSection, SubHead, Hairlines } from "@/components/home/section";

/**
 * Work, in three registers.
 *
 *   featured — three shipped builds with a screenshot each. `featured: true`
 *              in lib/projects.ts picks them, in array order.
 *   ledger   — every other live build as a named row with its category. A
 *              list of names reads as receipts; a wall of thumbnails reads as
 *              filler. Laid out for twelve rows and padded to that with open
 *              rows while the dataset is shorter, so the gap is visible.
 *   shop     — three builds still in progress, dashed and plated so nothing
 *              here claims a result that hasn't happened yet.
 *
 * All three read the one dataset. There is nothing to keep in sync.
 */

const live = projects.filter(isLive);
const featured = live.filter((p) => p.featured).slice(0, CAPACITY.featured);
const shelf = live.filter((p) => !p.featured);
const shop = projects.filter((p) => !isLive(p)).slice(0, CAPACITY.inProgress);

/* ── Featured / in-progress card ──────────────────────────────────────── */

function ProjectCard({ item, index }: { item: Project; index: number }) {
  const shipped = isLive(item);
  // A shipped card prints what changed for the client (resultLine → outcome);
  // one still in the shop prints what the thing does. The intent line is a
  // forward-looking claim and belongs on /work, where the card has room to
  // frame it — not under an "in progress" plate on the home page.
  const line = shipped ? resultLine(item) ?? item.detail : item.detail;

  const body = (
    <>
      <MediaSlot
        media={
          item.screenshot
            ? { kind: "image", src: item.screenshot, alt: `${item.name} — ${item.category}` }
            : undefined
        }
        ratio="4/3"
        label="Screenshot"
        hint={shipped ? "The real site, not a diagram." : "In-progress build."}
        sizes="(max-width: 660px) 100vw, (max-width: 980px) 50vw, 33vw"
        flush
      />
      <div className="flex flex-1 flex-col p-6">
        <p className={cn("self-start", shipped ? "plate-live" : "plate-progress")}>
          {shipped ? "Live" : "In progress"}
        </p>
        <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-ink">
          {item.name}
        </h3>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted">{line}</p>
        {shipped && item.href && (
          <span className="mt-auto inline-flex items-center gap-1.5 pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-blue">
            Visit site
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
              <path
                d="M3 9 9 3m0 0H4.5M9 3v4.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>
    </>
  );

  const shell = cn(
    "flex h-full flex-col overflow-hidden rounded-xl bg-raised",
    shipped
      ? "border border-line transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-violet-dim motion-reduce:hover:translate-y-0"
      : "border border-dashed border-blue/40"
  );

  return (
    <Reveal as="li" delay={index * 90} className="h-full">
      {/* No outbound link while it's in progress, even where a URL exists. */}
      {shipped && item.href ? (
        <a href={item.href} target="_blank" rel="noreferrer noopener" className={cn("group", shell)}>
          {body}
        </a>
      ) : (
        <article className={shell}>{body}</article>
      )}
    </Reveal>
  );
}

function OpenCard({ index }: { index: number }) {
  return (
    <Reveal as="li" delay={index * 90} className="h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-dashed border-blue/40 bg-raised/40">
        <MediaSlot ratio="4/3" label="Screenshot" hint="In-progress build." flush />
        <div className="p-6">
          <p className="plate-progress self-start">In progress</p>
          <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-muted/60">
            Project to come
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted/60">
            One line on what it does, added when it ships.
          </p>
        </div>
      </div>
    </Reveal>
  );
}

/* ── Ledger ───────────────────────────────────────────────────────────── */

function LedgerRow({ item }: { item: Project }) {
  const inner = (
    <>
      <span className="font-display font-semibold tracking-tight text-ink">{item.name}</span>
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
        {item.category}
      </span>
    </>
  );

  const cell = "flex h-full flex-col gap-1.5 bg-bg px-6 py-5";

  return item.href ? (
    <a
      href={item.href}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(cell, "transition-colors duration-300 hover:bg-raised focus-visible:bg-raised")}
    >
      {inner}
    </a>
  ) : (
    <div className={cell}>{inner}</div>
  );
}

function OpenRow() {
  return (
    <div className="flex h-full flex-col gap-1.5 bg-bg px-6 py-5" aria-label="Project name to come">
      <span className="font-display font-semibold tracking-tight text-muted/40">Client name</span>
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted/40">
        Category
      </span>
    </div>
  );
}

/* ── Section ──────────────────────────────────────────────────────────── */

export function Work() {
  const openRows = Math.max(0, CAPACITY.ledger - shelf.length);
  const openCards = Math.max(0, CAPACITY.inProgress - shop.length);

  return (
    <HomeSection id="work">
      <SectionHead
        tone="dark"
        plate="Work"
        title={sections.work.title}
        intro={sections.work.lede}
      />

      {/* Featured */}
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((p, i) => (
          <ProjectCard key={p.name} item={p} index={i} />
        ))}
      </ul>

      {/* The shelf */}
      <Reveal className="mt-20">
        <SubHead
          title={sections.work.shelf}
          note={`${shelf.length} more, all live`}
        />
        <Hairlines
          cols="sm:grid-cols-2 lg:grid-cols-3"
          className="rounded-t-none border-t-0"
        >
          {shelf.slice(0, CAPACITY.ledger).map((p) => (
            <LedgerRow key={p.name} item={p} />
          ))}
          {Array.from({ length: openRows }).map((_, i) => (
            <OpenRow key={`open-${i}`} />
          ))}
        </Hairlines>

        <a
          href="/work"
          className="group mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-violet transition-colors hover:text-ink focus-visible:text-ink"
        >
          See all {projects.length} builds
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </a>
      </Reveal>

      {/* The shop */}
      <Reveal className="mt-20">
        <SubHead title={sections.work.shop} note={sections.work.shopNote} />
      </Reveal>
      <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shop.map((p, i) => (
          <ProjectCard key={p.name} item={p} index={i} />
        ))}
        {Array.from({ length: openCards }).map((_, i) => (
          <OpenCard key={`open-${i}`} index={shop.length + i} />
        ))}
      </ul>
    </HomeSection>
  );
}
