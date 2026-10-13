import Image from "next/image";
import { homeProof, isLive, projects, resultLine, type Project } from "@/lib/projects";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion";
import { SectionHead } from "@/components/site/section-head";

/**
 * Stand-in for a project that has no screenshot yet.
 *
 * Deliberately schematic — an engraved diagram of what was built — rather than
 * a mocked-up browser window. A fake screenshot on a real portfolio implies a
 * screen that never existed; a diagram doesn't.
 *
 * Add a real image to /public/previews and set `screenshot` on the work item in
 * lib/content.ts and this is replaced automatically.
 */
function Schematic({ kind }: { kind: string }) {
  const common = "h-full w-full text-violet-ink";

  if (kind === "SEO audit") {
    return (
      <svg viewBox="0 0 200 125" className={common} fill="none" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect
              x="24"
              y={22 + i * 18}
              width={110 - i * 18}
              height="7"
              rx="3.5"
              fill="currentColor"
              opacity={0.9 - i * 0.15}
            />
            <circle cx="16" cy={25.5 + i * 18} r="2.5" fill="currentColor" opacity="0.5" />
          </g>
        ))}
        <path
          d="M150 96 L163 74 L176 82 L189 48"
          stroke="#35597E"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="189" cy="48" r="3" fill="#35597E" />
      </svg>
    );
  }

  if (kind === "AI receptionist") {
    return (
      <svg viewBox="0 0 200 125" className={common} fill="none" aria-hidden="true">
        <circle cx="100" cy="62" r="20" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        <circle cx="100" cy="62" r="32" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        <circle cx="100" cy="62" r="44" stroke="currentColor" strokeWidth="1" opacity="0.15" />
        {[
          [76, 10], [83, 20], [90, 32], [97, 24], [104, 38], [111, 22], [118, 12],
        ].map(([x, h], i) => (
          <rect
            key={i}
            x={x}
            y={62 - h / 2}
            width="3"
            height={h}
            rx="1.5"
            fill="#35597E"
            opacity={0.55 + (i % 3) * 0.15}
          />
        ))}
      </svg>
    );
  }

  if (kind === "Site rebuild") {
    return (
      <svg viewBox="0 0 200 125" className={common} fill="none" aria-hidden="true">
        {/* before */}
        <rect x="14" y="24" width="76" height="78" rx="4" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
        {[36, 48, 60, 72].map((y, i) => (
          <rect key={i} x="24" y={y} width={i % 2 ? 40 : 56} height="4" rx="2" fill="currentColor" opacity="0.25" />
        ))}
        {/* after */}
        <rect x="110" y="24" width="76" height="78" rx="4" stroke="currentColor" strokeWidth="1.2" opacity="0.8" />
        <rect x="120" y="34" width="56" height="20" rx="3" fill="currentColor" opacity="0.55" />
        <rect x="120" y="60" width="44" height="4" rx="2" fill="currentColor" opacity="0.4" />
        <rect x="120" y="70" width="52" height="4" rx="2" fill="currentColor" opacity="0.4" />
        <rect x="120" y="84" width="34" height="10" rx="5" fill="#35597E" opacity="0.9" />
        <path d="M95 63h10m0 0-3.5-3.5M105 63l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "Booking flow" || kind === "Booking platform") {
    return (
    <svg viewBox="0 0 200 125" className={common} fill="none" aria-hidden="true">
      <rect x="30" y="20" width="140" height="86" rx="5" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <line x1="30" y1="38" x2="170" y2="38" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      {Array.from({ length: 20 }).map((_, i) => {
        const filled = [1, 3, 6, 9, 12, 14, 17].includes(i);
        return (
          <rect
            key={i}
            x={42 + (i % 5) * 24}
            y={48 + Math.floor(i / 5) * 15}
            width="18"
            height="10"
            rx="2"
            fill={filled ? "#35597E" : "currentColor"}
            opacity={filled ? 0.85 : 0.18}
          />
        );
      })}
      </svg>
    );
  }

  // Everything else — storefronts, platforms, apps. A neutral page frame rather
  // than falling through to the booking grid, which would misdescribe the work.
  return (
    <svg viewBox="0 0 200 125" className={common} fill="none" aria-hidden="true">
      <rect x="26" y="20" width="148" height="86" rx="5" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
      <line x1="26" y1="36" x2="174" y2="36" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
      <circle cx="36" cy="28" r="2.5" fill="currentColor" opacity="0.4" />
      <circle cx="45" cy="28" r="2.5" fill="currentColor" opacity="0.4" />
      <rect x="38" y="48" width="62" height="8" rx="3" fill="currentColor" opacity="0.6" />
      <rect x="38" y="62" width="96" height="4" rx="2" fill="currentColor" opacity="0.3" />
      <rect x="38" y="71" width="80" height="4" rx="2" fill="currentColor" opacity="0.3" />
      <rect x="38" y="86" width="34" height="11" rx="5" fill="#35597E" opacity="0.85" />
      <rect x="120" y="48" width="42" height="34" rx="3" stroke="currentColor" strokeWidth="1.1" opacity="0.35" />
    </svg>
  );
}

function WorkCard({ item, index }: { item: Project; index: number }) {
  const live = isLive(item);
  const line = resultLine(item);

  const inner = (
    <>
      <div
        className={cn(
          "relative aspect-[16/10] overflow-hidden rounded-lg bg-cream-raised",
          live
            ? "border border-cream-line"
            : "border border-dashed border-blue-ink/40"
        )}
      >
        {item.screenshot ? (
          <Image
            src={item.screenshot}
            alt={`${item.name} — ${item.category}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="h-full w-full p-4 transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
            <Schematic kind={item.category} />
          </div>
        )}
        {/* The category badge doubles as the status badge: what it is once it's
            shipped, where it is while it isn't. */}
        <span
          className={cn(
            "absolute left-3 top-3 rounded border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] backdrop-blur-sm",
            live
              ? "border-cream-line bg-cream-raised/90 text-violet-ink"
              : "border-blue-ink/40 bg-blue-soft/90 text-blue-ink"
          )}
        >
          {live ? item.category : "In progress"}
        </span>
      </div>

      <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-cream-ink">
        {item.name}
      </h3>
      <p className="mt-1.5 text-pretty text-sm leading-relaxed text-cream-muted">{item.detail}</p>

      {/* Pinned to the bottom so the outcome rules line up across the row even
          though the descriptions above them differ in length. */}
      {line && (
        <p
          className={cn(
            "mt-auto border-l-2 pl-3 pt-4 text-pretty text-sm leading-relaxed text-cream-ink",
            live ? "border-violet-line" : "border-blue-ink/40"
          )}
        >
          {line}
        </p>
      )}
    </>
  );

  return (
    <Reveal as="li" delay={index * 90} className="h-full">
      {live && item.href ? (
        <a
          href={item.href}
          target="_blank"
          rel="noreferrer noopener"
          className="group flex h-full flex-col rounded-xl transition-transform duration-400 hover:-translate-y-1 motion-reduce:hover:translate-y-0"
        >
          {inner}
          <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-blue-ink">
            Visit site
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
              <path d="M3 9 9 3m0 0H4.5M9 3v4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </a>
      ) : (
        <div className="group flex h-full flex-col">{inner}</div>
      )}
    </Reveal>
  );
}

/**
 * The card grid on its own, so the service pages can render a proof strip that
 * looks exactly like the home page's rather than reimplementing it.
 */
export function ProofGrid({ items }: { items: Project[] }) {
  return (
    <ul className="grid items-stretch gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => (
        <WorkCard key={item.name} item={item} index={i} />
      ))}
    </ul>
  );
}

export function Proof() {
  return (
    <section id="work" className="layer px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-wrap">
        <SectionHead
          plate="Recent work"
          title="What's shipped, and what's in the shop."
          intro="A sample of what's come through lately — what's live for the client, and what's still on the bench."
        />

        <ProofGrid items={homeProof} />

        {/* The curated four. Everything else lives on /work. */}
        <Reveal className="mt-12">
          <a
            href="/work"
            className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-violet-ink transition-colors hover:text-blue-ink focus-visible:text-blue-ink"
          >
            See all {projects.length} projects
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
