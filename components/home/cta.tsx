import { cn } from "@/lib/utils";

/**
 * The two button shapes on the home page, as the v3 mockup draws them: square
 * corners (3px), no pill, no arrow.
 *
 * Primary fills with violet-strong and sets its label in ink. Ghost is its
 * outline counterpart for the second action — the hero pairs the two, so
 * they're defined together here rather than as two more inline class strings.
 */

const base =
  "inline-flex items-center justify-center rounded-[3px] px-8 py-4 font-display text-[15px] transition-colors duration-300";

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
      className={cn(base, "bg-violet-strong font-semibold text-ink hover:bg-violet-deep", className)}
    >
      {children}
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
        "border border-line font-medium text-ink/85 hover:border-violet-dim hover:text-ink",
        className
      )}
    >
      {children}
    </a>
  );
}
