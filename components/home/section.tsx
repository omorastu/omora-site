import { cn } from "@/lib/utils";

/**
 * The home page's section shell: a hairline across the top, the standard
 * vertical rhythm, and the 1200px wrap. Every section below the hero renders
 * through it so the seams between them are identical.
 *
 * The founders section overrides the surface — it's the page's one cream zone
 * — and passes its own border colour, since a line-brown hairline on cream is
 * invisible.
 */
export function HomeSection({
  id,
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLElement> & { id: string }) {
  return (
    <section
      id={id}
      className={cn("layer border-t border-line px-6 py-24 sm:py-32", className)}
      {...rest}
    >
      <div className="mx-auto max-w-wrap">{children}</div>
    </section>
  );
}

/**
 * Sub-heading inside a section — the work section uses two to split the shelf
 * from the shop. A display h3 with a mono readout on the right, sitting on a
 * hairline.
 */
export function SubHead({
  title,
  note,
  className,
}: {
  title: string;
  note?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-line pb-4",
        className
      )}
    >
      <h3 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
        {title}
      </h3>
      {note && <p className="plate">{note}</p>}
    </div>
  );
}

/**
 * A grid of cells separated by hairlines, in a rounded border.
 *
 * Built on `gap-px` over a `bg-line` ground rather than per-cell borders, so
 * the lines stay correct at every column count without last-child rules for
 * each breakpoint. The proof band, the leak columns, the ledger and the tiers
 * all use it.
 */
export function Hairlines({
  className,
  cols,
  children,
  ...rest
}: React.HTMLAttributes<HTMLElement> & {
  /** Responsive column classes, e.g. "sm:grid-cols-2 lg:grid-cols-4". */
  cols: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-px overflow-hidden rounded-xl border border-line bg-line",
        cols,
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
