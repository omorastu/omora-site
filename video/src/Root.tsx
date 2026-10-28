import { Composition } from "remotion";
import { FPS, FRAMES, FRAME_SIZE, NumenLoop } from "./NumenLoop";

/** One composition per card size; scripts/render.mjs renders both. */
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
  </>
);
