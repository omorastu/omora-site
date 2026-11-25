import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FILM_COPY, RECORD } from "./clinical/data";
import { ClinicalCopy, DraftDialog, RecordScreen, SUMMARY_LINES, SummaryScreen } from "./clinical/screens";
import { Viewport } from "./clinical/tw";
import { RESET, Scale } from "./clinical/ui";
import {
  AppFrame,
  FPS,
  PAD,
  SHOT,
  VIEW,
  chars,
  closeUp,
  dipIn,
  dipOut,
  ease,
  glide,
  progress,
  type Content,
  type Key,
  type Scene,
  type Shot,
  type Size,
} from "./ClinicalLoop";

/**
 * Clinical Scribe for the film's Custom tools demo (/film): the same
 * replica and invented consult as the Work card's loop (ClinicalLoop.tsx,
 * which this leaves as it is), cut as one flow instead of a loop.
 *
 * The consult recorded (the timer running, then Stop), then written up (the
 * summary filling in line by line, the camera following it down), then the
 * coaching for it: the "Recommended next move" card, what to do, why, and
 * the moments in the consult that say so. Then "Draft this message" is
 * pressed and the follow-up letter to the family drafts itself, and holds.
 * Played once (the demo is no longer than it), so it has no seam.
 */

export const FILM_FRAMES = 465; // 15.5 s

/** The beats, in frames. */
const F = {
  stop: 64,
  summary: [70, 84],
  revealAt: (line: number) => 88 + line * 7,
  reveal: 10,
  coach: [200, 236], // down to the recommendation
  press: 290, // "Draft this message"
  dialog: [298, 308],
  draftStream: [310, 384],
};

const COACH: Shot = { id: "recommend", align: "center" };

const PATH: Key[] = [
  [0, SHOT.record],
  [F.summary[0], SHOT.record],
  [F.summary[1], SHOT.summaryTop],
  [F.revealAt(1), SHOT.summaryTop],
  [F.revealAt(SUMMARY_LINES - 2) + F.reveal, SHOT.summaryEnd, glide], // down with the lines as they appear
  [F.coach[0], SHOT.summaryEnd],
  [F.coach[1], COACH], // on to the coaching
  [FILM_FRAMES - 1, COACH],
];

function contentsAt(size: Size, frame: number): Content[] {
  const t = frame / FPS;
  const record: Scene = {
    key: "record",
    nav: "record",
    t,
    node: <RecordScreen seconds={RECORD.startSeconds + Math.floor(frame / FPS)} stopPressed={frame >= F.stop && frame < F.stop + 4} />,
  };
  const open = progress(frame, F.dialog);
  const summary: Scene = {
    key: "summaryPage",
    nav: null,
    t,
    node: (
      <SummaryScreen
        tab="summary"
        shown={(line) => (frame - F.revealAt(line)) / F.reveal}
        letterChars={0}
        drafting={false}
        pressed={frame >= F.press && frame < F.press + 6}
      />
    ),
    overlay:
      open > 0
        ? (visible) => (
            <DraftDialog
              chars={chars(frame, F.draftStream, FILM_COPY.draft)}
              visible={ease(open) * visible}
              zoom={closeUp(size)}
              width={VIEW[size].column + 2 * PAD - 32}
            />
          )
        : undefined,
  };
  if (frame < F.summary[0]) return [{ scene: record, opacity: 1 }];
  if (frame < F.summary[1]) {
    const k = progress(frame, F.summary);
    return [
      { scene: record, opacity: dipOut(k) },
      { scene: summary, opacity: dipIn(k) },
    ];
  }
  return [{ scene: summary, opacity: 1 }];
}

export const ClinicalFilm: React.FC<{ size: Size }> = ({ size }) => {
  const frame = useCurrentFrame();
  return (
    <Viewport.Provider value={VIEW[size].width}>
      <Scale.Provider value={closeUp(size)}>
        <AbsoluteFill style={{ background: "#fff" }}>
          <style>{RESET}</style>
          <ClinicalCopy.Provider value={FILM_COPY}>
            <AppFrame size={size} frame={frame} contents={contentsAt(size, frame)} path={PATH} />
          </ClinicalCopy.Provider>
        </AbsoluteFill>
      </Scale.Provider>
    </Viewport.Provider>
  );
};
