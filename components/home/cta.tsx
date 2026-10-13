import { cn } from "@/lib/utils";

/**
 * The two button shapes on the home page.
 *
 * Primary is the site's one exception to "brass becomes violet": a violet-deep
 * fill with the label in ink, the same pill the service pages and the lead
 * form use. Ghost is its outline counterpart for the second action — the
 * mockup pairs the two in the hero, so they're defined together here rather
 * than as two more inline class strings.
 */

const base =
  "group inline-flex items-center gap-3 rounded-full px-7 py-4 font-medium transition-[transform,border-color,background-color] duration-300 hover:-translate-y-0.5 active:translate-y-0 motion-reduce:hover:translate-y-0";

function Arrow() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 8h11m0 0-4-4m4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PrimaryCta({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        base,
        "bg-violet-deep text-ink shadow-[0_14px_40px_-14px_rgba(139,79,230,0.7)] hover:bg-violet hover:text-bg",
        className
      )}
    >
      {children}
      <Arrow />
    </a>
  );
}

export function GhostCta({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        base,
        "border border-line text-ink hover:border-violet-dim hover:bg-raised",
        className
      )}
    >
      {children}
    </a>
  );
}
