# Work-section live cards

The Numen Ventures loop on the site's Work cards, made with
[Remotion](https://www.remotion.dev). A separate package with its own
dependencies; the site never imports anything from here.

```
cd video
npm install          # first time only
npm run capture      # full-page screenshots of numenventures.co → public/captures/
npm run render       # videos, posters and stills → ../public/m/work/
npm run build        # both
npm run studio       # preview and scrub the compositions in the browser
```

`npm run render -- desktop` (or `phone`) does one size.

What `render` writes into `public/m/work/`:

| File | Size | For |
| --- | --- | --- |
| `numen-d.mp4` | 1280×800, under 1.5 MB | wide screens |
| `numen-d-sd.mp4` | 864×540, under 700 KB | wide screens on slow or Save-Data connections |
| `numen-m.mp4` | 720×900, under 1.5 MB | phones |
| `numen-m-sd.mp4` | 544×680, under 700 KB | phones on slow or Save-Data connections |
| `numen-d-poster.jpg`, `numen-m-poster.jpg` | 960×600, 544×680 | the first frame, shown until the loop plays |
| `numen-d-still.jpg`, `numen-m-still.jpg` | 1920×1200, 1080×1350 | the hero, for visitors with reduced motion on |

All H.264 (High, yuv420p), 30 fps, 18 s, no audio, index first. The script
picks the bitrate that lands each file under its cap and re-encodes lower if
one comes out over. It uses Remotion's own ffmpeg, so nothing needs installing.

- `scripts/capture.mjs` shoots each page at 1440 (2×) and 390 (3×) wide, with
  fonts and images loaded and any popup hidden. It saves overlapping tiles and
  records where the sections the loop pauses on sit (`src/captures.json`). The
  captures aren't committed; capture again before rendering on a new machine.
  If Playwright says its browser is missing, run
  `npx playwright install chromium-headless-shell`.
- `src/NumenLoop.tsx` is the loop itself: the beats (pauses, eased scrolls,
  cross-fades) for each size, and the page drawn from the tiles. The sticky
  header stays put while the page scrolls under it.
- `scripts/render.mjs` renders and encodes.

The site picks between the cuts in `components/kozmoz/work-video.tsx`; the
files are listed on the project in `lib/kozmoz.ts`.
