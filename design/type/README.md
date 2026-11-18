# Elorro Display

The site's display face: the ELORRO wordmark in the header and every heading
(the names on the door, section titles, service and project titles, the
film's big words). Everything smaller (labels, body copy, buttons, fields,
captions) stays in Hanken Grotesk.

It's Cormorant Garamond with five letters redrawn so it's recognisably ours.
The rest of the alphabet, the figures, the punctuation and the accents are
Cormorant's, at the weights the site sets. The specimen is at `/type`, a page
nothing links to.

## The five letters

- **O: our two rings.** A perfect circle outside, cap height plus overshoot.
  Inside, the counter is a vesica: the shape two circles make where they
  overlap. So each O is a ring with the logo's two rings meeting in it, and
  ELORRO has two. The thick sides keep Cormorant's weight, and the thin top
  and bottom keep its hairline, so it sits with the other letters. At header
  size it reads as a plain round O; from about 60px up, the counter's two
  points show. Every O-based capital follows it: Ó Ò Ô Õ Ö, Ø and Q, with the
  accents and Q's tail kept and re-centred.
- **R: a long leg.** The leg leaves the bowl in one stroke, as if drawn with
  a broad pen held at 38°. It eases down to the baseline, stands on it, and
  runs on to a hairline tip about 100 units past where Cormorant's stopped.
  That's the R in the gold logo, made into type. The R is wider to hold the
  leg; the build then kerns it against every character that can follow (see
  "Kerning").
- **E: hairline serifs.** Each arm ends in a fine vertical hairline, as thin
  as Cormorant's head serifs, with only a small bracket. The middle arm gets
  a short, symmetrical one. Cormorant's arms swept into their serifs with
  long curves; these are crisp, nearer the cut-stone E in the gold logo. The
  stem and its serifs are Cormorant's.
- **L: the same hairline**, rising off the foot, so the L matches the E
  beside it in the wordmark.
- **The ampersand.** The italic "Et" form, which the Cormorant project draws
  upright in Cormorant Upright, in place of Cormorant Garamond's roman one.
  It's taken a weight heavier than the letters around it (Upright's strokes
  run lighter) and set 8% larger, so it holds its own in gold between "Ashan"
  and "Jordan". A version with its crossbar drawn on into a long hairline,
  like the R's tail, looked forced, so the curl and ball stay as Cormorant
  Upright has them.

## Weights

| File (app/fonts) | Style | Drawn from | Ampersand from | The site sets it at |
| --- | --- | --- | --- | --- |
| `elorro-display-regular.woff2` | Regular | Cormorant Garamond 500 | Cormorant Upright 600 | 500: headings, the plain wordmark |
| `elorro-display-semibold.woff2` | SemiBold | Cormorant Garamond 600 | Cormorant Upright 700 | 600: the gold wordmark, bold words in headings |
| `elorro-display-bold.woff2` | Bold | Cormorant Garamond 700 | Cormorant Upright 700 | 700: the hero's last names (home page only) |

The Regular is Cormorant's Medium, because the site has always set its
headings at 500, so nothing on the site changes weight. Each file is the
latin set Google serves for Cormorant: A–Z, a–z, figures, punctuation,
Latin-1 accents (Spanish, French, German and more), Œ œ, curly quotes, dashes
and €. About 24 KB each.

## Rebuilding

```
python3 -m venv .venv
.venv/bin/pip install -r design/type/requirements.txt
.venv/bin/python design/type/build.py
```

That writes the three woff2 files into `app/fonts`. The same sources always
give the same bytes. Add `--ttf DIR` to also write TTFs for proofing, and
`--no-woff2` to leave `app/fonts` alone. `--o twin` and `--o ellipse` build
the two O's this one was chosen over (two offset rings; a circle with an
elliptical counter), for proofing only.

`build.py`, step by step:

1. **Instance.** Cormorant Garamond's variable file
   (`source/CormorantGaramond-Variable-latin.woff2`, the file the site served
   before) is fixed at each weight.
2. **Measure.** It reads that weight's stem, the O's thick and thin, the
   arms and the hairline serif, so every redrawn letter matches its weight.
3. **Redraw.** It draws the O, R, E, L and ampersand with skia-pathops, then
   rebuilds the accented and related capitals from them.
4. **Kern.** It adds the kerning below, on top of Cormorant's own.
5. **Rename.** It writes a new name table, and the OS/2 weight and style
   bits.

The ampersand comes from `source/CormorantUpright-*-latin.woff2`, Google's
latin files for Cormorant Upright.

## Kerning

Cormorant's kerning is kept. One lookup is added after it:

- **R against everything that can follow it.** Above the leg, the R keeps
  the space Cormorant gave its bowl. Lower down, the leg and tail never come
  within 18 units of the next letter. So round letters (O, C, G, Q, U, V, W,
  Y, o, e, a) tuck over the tail, and letters with a foot serif (E, R, N, i,
  n) stand clear of its tip. A full stop or comma sits as far from the tail's
  tip as Cormorant had it from the end of its leg.
- **L before O, Q, C and G: −24**, closing the hole the L's open corner
  leaves (it shows most in ELORRO).

## Loading

`app/layout.tsx` loads the Regular and SemiBold for every page with
`next/font/local`. Both are preloaded, with `font-display: swap`.
`components/elorro/hero-font.ts` loads the Bold on the home page only.

Until the files arrive, the text is set in "Elorro Display Fallback"
(`app/globals.css`): Times New Roman, scaled so the headings take the same
width.

- **size-adjust (97.25%)** was measured on the built site. It's the total
  width of all 262 display-type elements on eight pages (home, /services, two
  service pages, /work, a case study, /questions, /film) set in Elorro
  Display, divided by the same text in plain Times New Roman, at the same
  sizes, with letter-spacing off.
- **ascent-override** and **descent-override** are Elorro Display's own
  ascent and descent (924 and 287, out of 1000), divided by that
  size-adjust, so lines stand where they will.

Re-measure if the letters' widths change much.

## Licence and credit

Cormorant is by Christian Thalmann (Catharsis Fonts), under the SIL Open
Font License 1.1. Elorro Display is a modified version of it, so it's under
the same licence (`OFL.txt` here, and `app/fonts/OFL-ElorroDisplay.txt` next
to the fonts). As the licence asks, it's released under a new name, with
Cormorant's copyright kept in its name table and licence. Cormorant's own
licence is in `source/OFL-Cormorant.txt`.

## Not done (yet)

- **Œ keeps Cormorant's O.** It's rare, and it would need its O half redrawn
  to the ring.
- **Lowercase is untouched,** including the o.
- **No hinting,** like the Cormorant files the site served before. Browsers
  render it smoothly; Windows at small sizes is the one place it could look
  softer than a hinted font.
