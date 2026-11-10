import type { CSSProperties } from "react";
import { elora } from "@/components/elorro/film/script";

/**
 * Elora on screen: her medallion, in the film's frame from her introduction
 * to the end (film.css, "Elora": full size in the first scene, then to her
 * corner). One piece to swap: with `elora.video` set (script.ts) a video of
 * her takes the drawing's place, cut to the same circle, and film.tsx keeps
 * it in step with the film. Until then she's drawn: a woman's profile,
 * softly lit from the side she faces, rimmed in the logo's gold.
 *
 * She moves only a little: breathing, her head turned a touch toward the
 * screen and back, and a glow behind her that lifts while she speaks (one per
 * line, timed from the captions, `lines`).
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
          <EloraDrawn />
        )}
      </div>
    </div>
  );
}

/** The drawn stand-in: a profile facing right, its face and neck rimmed in gold. */
function EloraDrawn() {
  const profile =
    "M 230 72 C 258 74, 278 96, 282 128 C 284 140, 282 150, 280 156 C 279 162, 286 176, 298 196 C 300 200, 296 205, 286 206 C 288 210, 292 214, 290 218 C 288 221, 284 222, 284 224 C 288 227, 290 232, 286 236 C 284 240, 290 250, 284 262 C 278 272, 262 276, 250 274 C 252 290, 254 310, 256 334";
  return (
    <svg className="elora-art" viewBox="0 0 400 400" focusable="false">
      <defs>
        <clipPath id="elora-clip">
          <circle cx="200" cy="200" r="188" />
        </clipPath>
        <radialGradient id="elora-back" cx="66%" cy="36%" r="72%">
          <stop offset="0" stopColor="#E8C27A" stopOpacity=".62" />
          <stop offset=".42" stopColor="#A8802F" stopOpacity=".2" />
          <stop offset="1" stopColor="#0C0A08" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="elora-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0B0908" />
          <stop offset=".72" stopColor="#17130F" />
          <stop offset="1" stopColor="#2B2117" />
        </linearGradient>
        <linearGradient id="elora-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6E2AE" />
          <stop offset=".5" stopColor="#C9A055" />
          <stop offset="1" stopColor="#8A6424" />
        </linearGradient>
      </defs>
      <g clipPath="url(#elora-clip)">
        <rect width="400" height="400" fill="#0C0A08" />
        <circle cx="262" cy="150" r="240" fill="url(#elora-back)" />
        <g className="elora-body">
          <path fill="url(#elora-shade)" d="M 0 400 L 0 372 C 40 350, 110 338, 168 330 L 256 330 C 300 336, 350 352, 400 380 L 400 400 Z" />
          <path className="elora-line" d="M 150 344 C 196 366, 250 366, 298 346" />
          <g className="elora-head">
            <path
              fill="url(#elora-shade)"
              d={`M 168 334 L 172 312 C 168 290, 160 276, 150 266 C 120 240, 112 190, 122 150 C 132 100, 176 66, ${profile.slice(2)} L 168 334 Z`}
            />
            <circle fill="url(#elora-shade)" cx="142" cy="236" r="34" />
            <path className="elora-hair" d="M 230 70 C 176 66, 132 100, 122 150 C 112 190, 118 232, 146 262 M 142 202 a 34 34 0 1 0 0.1 0" />
            <path className="elora-hair elora-hair--soft" d="M 232 76 C 248 98, 262 112, 281 118 M 204 82 C 182 122, 172 172, 180 222" />
            <path className="elora-rim-glow" d={profile} />
            <path className="elora-rim" d={profile} />
            <path className="elora-hair" d="M 207 178 C 195 179, 193 200, 205 207" />
            <circle className="elora-gold" cx="205" cy="218" r="4.5" />
            <path className="elora-hair" d="M 205 222 V 236" />
            <path className="elora-eye" d="M 261 160 C 267 163, 274 163, 279 158" />
            <path className="elora-hair elora-hair--soft" d="M 257 146 C 265 141, 274 141, 281 146" />
          </g>
        </g>
      </g>
      <circle className="elora-ring-glow" cx="200" cy="200" r="188" />
      <circle className="elora-ring" cx="200" cy="200" r="188" />
    </svg>
  );
}
