import type { CSSProperties } from "react";
import { elora } from "@/components/elorro/film/script";

/**
 * Elora on screen: her medallion, in the film's frame from her introduction
 * to the end (film.css, "Elora": full size in the first scene, then to her
 * corner). One piece to swap: with `elora.video` set (script.ts) a video of
 * her takes the stand-in's place, cut to the same circle, and film.tsx keeps
 * it in step with the film. Until then the medallion holds her initial: a
 * gold E in Cormorant, the wordmark's face, softly lit, rimmed in the logo's
 * gold.
 *
 * Behind her, a glow that lifts while she speaks (one per line, timed from
 * the captions, `lines`).
 */

type Vars = CSSProperties & Record<`--${string}`, string | number>;
const sec = (t: number) => `${t.toFixed(3)}s`;

export function EloraAvatar({
  lines,
  arrive,
  toCorner,
}: {
  lines: { from: number; to: number }[];
  /** When she comes in, full size, and when she goes to her corner, in seconds into the film. */
  arrive: number;
  toCorner: number;
}) {
  return (
    <div className="elora" aria-hidden="true" style={{ "--e-in": sec(arrive), "--e-corner": sec(toCorner) } as Vars}>
      <div className="elora-halo" />
      {lines.map((l) => (
        <div key={l.from} className="elora-voice" style={{ "--from": sec(l.from), "--len": sec(l.to - l.from) } as Vars} />
      ))}
      <div className="elora-medallion">
        {elora.video ? (
          <video className="elora-video" src={elora.video} poster={elora.poster} muted playsInline preload="auto" />
        ) : (
          <EloraMonogram />
        )}
      </div>
    </div>
  );
}

/** The stand-in, until her video comes: her initial, in gold, on the dark, inside the medallion's two rings. */
function EloraMonogram() {
  return (
    <svg className="elora-art" viewBox="0 0 400 400" focusable="false">
      <defs>
        <radialGradient id="elora-back" cx="50%" cy="40%" r="64%">
          <stop offset="0" stopColor="#E8C27A" stopOpacity=".24" />
          <stop offset=".55" stopColor="#A8802F" stopOpacity=".07" />
          <stop offset="1" stopColor="#0C0A08" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="elora-e" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6E2AE" />
          <stop offset=".48" stopColor="#D9B66A" />
          <stop offset="1" stopColor="#9C7630" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="200" r="188" fill="#0C0A08" />
      <circle cx="200" cy="200" r="188" fill="url(#elora-back)" />
      <text className="elora-e" x="200" y="276" fontSize="240" textAnchor="middle">
        E
      </text>
      <circle className="elora-ring-in" cx="200" cy="200" r="170" />
      <circle className="elora-ring-glow" cx="200" cy="200" r="188" />
      <circle className="elora-ring" cx="200" cy="200" r="188" />
    </svg>
  );
}
