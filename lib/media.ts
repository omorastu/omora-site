/**
 * A piece of media the layout has a slot for.
 *
 * Every image and video slot on the home page takes one of these, or nothing.
 * Nothing is the current state of almost all of them — the reel, the service
 * screenshots, the portraits, the team video. A slot with no asset renders as
 * a dashed placeholder at the right proportions (see components/home/media-slot)
 * rather than a stock photo or a mocked-up screen, so the page is reviewable
 * before the shoot and nothing on it implies an asset that doesn't exist.
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
export type MediaRatio = "16/9" | "4/3" | "3/4" | "1/1";
