import { Composition } from "remotion";
import * as Clinical from "./ClinicalLoop";
import { ClinicalFilm, FILM_FRAMES } from "./ClinicalFilm";
import * as Film from "./FilmLoops";
import { FPS, FRAMES, FRAME_SIZE, NumenLoop } from "./NumenLoop";

/** One composition per card size; scripts/render.mjs renders them. The film's (/film) are scripts/film.mjs's. */
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
    {/* The film's loops (scripts/film.mjs). */}
    {(["desktop", "phone"] as const).map((size) => {
      const tag = size === "desktop" ? "Desktop" : "Phone";
      return [
        <Composition key={`site-${size}`} id={`PearlsSite${tag}`} component={Film.PearlsSite} durationInFrames={Film.SITE_FRAMES} fps={Film.FPS} {...Film.FRAME_SIZE[size]} defaultProps={{ size }} />,
        <Composition key={`reel-${size}`} id={`PhotoReel${tag}`} component={Film.PhotoReel} durationInFrames={Film.REEL_FRAMES} fps={Film.FPS} {...Film.FRAME_SIZE[size]} defaultProps={{ size }} />,
        <Composition key={`clinical-${size}`} id={`ClinicalFilm${tag}`} component={ClinicalFilm} durationInFrames={FILM_FRAMES} fps={Clinical.FPS} {...Clinical.FRAME_SIZE[size]} defaultProps={{ size }} />,
      ];
    })}
  </>
);
