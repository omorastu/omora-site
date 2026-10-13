import Image from "next/image";
import { cn } from "@/lib/utils";
import type { MediaAsset, MediaRatio } from "@/lib/media";

/**
 * A media slot: the one component every image and video on the home page
 * renders through.
 *
 * Given an asset it draws it at the slot's proportions — `next/image` for
 * stills, a plain <video> for footage. Given nothing it draws a dashed,
 * hatched box at the same proportions, labelled with what belongs there. That
 * fallback is the whole point: the layout can be reviewed with every slot
 * empty and read as unfinished rather than broken, and filling a slot later
 * is a data edit, not a markup change.
 *
 * `tone` follows the surface — the founders section is the page's one cream
 * zone and needs the light treatment.
 */

const RATIO: Record<MediaRatio, string> = {
  "16/9": "aspect-video",
  "4/3": "aspect-[4/3]",
  "3/4": "aspect-[3/4]",
  "1/1": "aspect-square",
};

const RATIO_LABEL: Record<MediaRatio, string> = {
  "16/9": "16:9",
  "4/3": "4:3",
  "3/4": "3:4",
  "1/1": "1:1",
};

export type MediaSlotProps = {
  media?: MediaAsset;
  ratio: MediaRatio;
  /** What belongs here — "Hero reel", "Portrait", "Screenshot". Shown when empty. */
  label: string;
  /** One more line under the label, for what the asset should show. */
  hint?: string;
  tone?: "dark" | "light";
  /** `sizes` for next/image, so a card thumbnail doesn't fetch a hero-sized file. */
  sizes?: string;
  /** Above-the-fold slots: the hero reel poster. */
  priority?: boolean;
  /**
   * Cards flush the slot against their own edges, so they drop the radius and
   * the dashed outline and let the card border do the work.
   */
  flush?: boolean;
  className?: string;
};

export function MediaSlot({
  media,
  ratio,
  label,
  hint,
  tone = "dark",
  sizes = "100vw",
  priority,
  flush,
  className,
}: MediaSlotProps) {
  const light = tone === "light";

  if (!media) {
    return (
      <div
        role="img"
        aria-label={`${label} — not yet supplied`}
        className={cn(
          light ? "slot-light" : "slot",
          RATIO[ratio],
          "w-full p-5",
          flush && "rounded-none border-0 border-b",
          className
        )}
      >
        <div className="max-w-[28ch]">
          <p
            className={cn(
              "font-mono text-[11px] font-medium uppercase tracking-[0.18em]",
              light ? "text-violet-ink" : "text-violet"
            )}
          >
            {label}
            <span className={cn("ml-2 font-normal", light ? "text-cream-muted" : "text-muted")}>
              {RATIO_LABEL[ratio]}
            </span>
          </p>
          {hint && (
            <p
              className={cn(
                "mt-1.5 text-pretty font-mono text-[11px] leading-relaxed",
                light ? "text-cream-muted" : "text-muted"
              )}
            >
              {hint}
            </p>
          )}
        </div>
      </div>
    );
  }

  const frame = cn(
    "relative w-full overflow-hidden",
    RATIO[ratio],
    light ? "bg-cream-raised" : "bg-raised",
    flush ? "border-b border-line" : "rounded-lg border",
    !flush && (light ? "border-cream-line" : "border-line"),
    className
  );

  if (media.kind === "image") {
    return (
      <div className={frame}>
        <Image
          src={media.src}
          alt={media.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover object-top"
        />
      </div>
    );
  }

  // A reel autoplays muted and loops; anything else waits for the visitor.
  // The reduced-motion case falls back to the poster via the global CSS rule
  // only for CSS animation, so a looping reel also carries `poster` for the
  // browsers that honour autoplay blocking.
  return (
    <div className={frame}>
      <video
        src={media.src}
        poster={media.poster}
        title={media.title}
        className="absolute inset-0 h-full w-full object-cover"
        playsInline
        preload={media.loop ? "auto" : "metadata"}
        {...(media.loop
          ? { autoPlay: true, muted: true, loop: true }
          : { controls: true })}
      />
    </div>
  );
}
