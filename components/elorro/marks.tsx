import { cn } from "@/lib/utils";

/**
 * The marks the site is drawn with.
 *
 * A chapter's mark: its number and name between two gold rules, centred over
 * the chapter. It's the chapter's heading (`as`, h2 by default); the number
 * is for the eye.
 */
export function ChapterMark({
  n,
  label,
  id,
  as: Tag = "h2",
  className,
}: {
  n?: string;
  label: string;
  id?: string;
  as?: "h1" | "h2" | "p";
  className?: string;
}) {
  return (
    <div className={cn("mark", className)}>
      <span className="mark-run" aria-hidden="true" />
      <Tag className="mark-label label" id={id}>
        {n && (
          <span className="mark-n" aria-hidden="true">
            {n}
          </span>
        )}
        {label}
      </Tag>
      <span className="mark-run" aria-hidden="true" />
    </div>
  );
}

/** A play button's triangle, in a ring. */
export function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("play-icon", className)} viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
      <circle cx="20" cy="20" r="18.5" />
      <path d="M16.5 13.5v13l10.5-6.5z" />
    </svg>
  );
}
