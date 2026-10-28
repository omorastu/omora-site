import { Composition } from "remotion";
import * as Clinical from "./ClinicalLoop";
import { FPS, FRAMES, FRAME_SIZE, NumenLoop } from "./NumenLoop";

/** One composition per card size; scripts/render.mjs renders them. */
export const Root: React.FC = () => (
  <>
    <Composition
      id="NumenDesktop"
      component={NumenLoop}
      durationInFrames={FRAMES}
      fps={FPS}
      {...FRAME_SIZE.desktop}
      defaultProps={{ size: "desktop" as const }}
    />
    <Composition
      id="NumenPhone"
      component={NumenLoop}
      durationInFrames={FRAMES}
      fps={FPS}
      {...FRAME_SIZE.phone}
      defaultProps={{ size: "phone" as const }}
    />
    <Composition
      id="ClinicalDesktop"
      component={Clinical.ClinicalLoop}
      durationInFrames={Clinical.FRAMES}
      fps={Clinical.FPS}
      {...Clinical.FRAME_SIZE.desktop}
      defaultProps={{ size: "desktop" as const }}
    />
    <Composition
      id="ClinicalPhone"
      component={Clinical.ClinicalLoop}
      durationInFrames={Clinical.FRAMES}
      fps={Clinical.FPS}
      {...Clinical.FRAME_SIZE.phone}
      defaultProps={{ size: "phone" as const }}
    />
  </>
);
