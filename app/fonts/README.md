# Fonts

The site's two families, self-hosted so a build never fetches them. Each is
the latin file Google Fonts serves, byte for byte, and each is under the SIL
Open Font License 1.1 (the OFL files here). They're loaded with
`next/font/local` in `app/layout.tsx`, `components/elorro/hero-font.ts` and
`components/elorro/fonts.ts`.

| File | What it is | From |
| --- | --- | --- |
| `cormorant-garamond-latin-wght.woff2` | Cormorant Garamond, variable (300–700), latin; the site uses it at 500 and 600 | https://fonts.gstatic.com/s/cormorantgaramond/v21/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYqXtKky2F7g.woff2 |
| `cormorant-garamond-latin-700.woff2` | Cormorant Garamond Bold (700), latin; the hero's last names | https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_hg9KnTOitk9IfqxUQ.woff2 |
| `hanken-grotesk-latin-wght.woff2` | Hanken Grotesk, variable (100–900), latin; the site uses it at 400, 500 and 600 | https://fonts.gstatic.com/s/hankengrotesk/v12/ieVn2YZDLWuGJpnzaiwFXS9tYtpd59CxCis4.woff2 |

Latin is all the site sets in them (Google's latin range: U+0000–00FF, the
general punctuation block and a few more). Text in another script, or a
letter outside that range, falls back to the next font in the stack.

To add a weight or a style, take it from the same place: request the family
from `https://fonts.googleapis.com/css2?family=…` with a current Chrome user
agent, and take the file under the `/* latin */` block.
