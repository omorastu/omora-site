import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion";

/**
 * Section header: an engraved violet plate, the heading, an optional intro,
 * and a milled rule. Consistent across every section so the page reads as one
 * object.
 *
 * `tone` picks the surface it sits on. Light is the default — every existing
 * call site is inside a cream zone — and the home page's dark sections pass
 * "dark" to get the same shape in the dark palette rather than a second header
 * component that could drift from this one.
 */
export function SectionHead({
  plate,
  title,
  intro,
  tone = "light",
  className,
}: {
  plate: string;
  title: React.ReactNode;
  intro?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";

  return (
    <Reveal className={cn("mb-12 sm:mb-16", className)}>
      <p className={dark ? "plate" : "plate-light"}>{plate}</p>
      <h2
        className={cn(
          "mt-3 max-w-[20ch] text-balance font-display text-3xl font-semibold leading-[1.05] tracking-tightest sm:text-4xl md:text-5xl",
          dark ? "text-ink" : "text-cream-ink"
        )}
      >
        {title}
      </h2>
      {intro && (
        <p
          className={cn(
            "mt-4 max-w-prose text-pretty text-base leading-relaxed sm:text-lg",
            dark ? "text-muted" : "text-cream-muted"
          )}
        >
          {intro}
        </p>
      )}
      <div className={cn("mt-8 max-w-[8rem]", dark ? "rule" : "rule-light")} />
    </Reveal>
  );
}
