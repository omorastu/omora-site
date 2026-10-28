/**
 * A piece of media the layout has a slot for.
 *
 * A case study's screenshot slots take one of these, or nothing (as do the
 * V3 service records in lib/content.ts, which no page renders any more). A
 * slot with no asset prints nothing (components/work/case-study.tsx) rather
 * than a stock photo or a mocked-up screen, so nothing on a page implies an
 * asset that doesn't exist.
 *
 * Images live in /public and are referenced by path. To fill a slot, drop the
 * file in and set the field:
 *
 *   image: { kind: "image", src: "/previews/receptionist.jpg", alt: "…" }
 *   media: { kind: "video", src: "/reel.mp4", poster: "/reel.jpg", loop: true }
 */
export type MediaAsset =
  | {
      kind: "image";
      src: string;
      /** Required. An empty string is fine for a purely decorative image. */
      alt: string;
    }
  | {
      kind: "video";
      src: string;
      /** Still frame shown before playback, and in place of the video under reduced motion. */
      poster?: string;
      /**
       * A reel: autoplays muted, loops, no controls. Leave unset for something
       * with a voice track that a visitor chooses to play — it gets controls
       * and does not autoplay.
       */
      loop?: boolean;
      /** Short description for assistive tech. */
      title?: string;
    };

/** The proportions a slot is built for. Maps to a Tailwind aspect-ratio class. */
export type MediaRatio = "21/9" | "16/9" | "16/10" | "2/1" | "4/3" | "3/4" | "1/1";
