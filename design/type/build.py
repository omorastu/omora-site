#!/usr/bin/env python3
"""
Elorro Display: the build.

Elorro Display is Cormorant Garamond (SIL Open Font License 1.1) with its
signature letters redrawn: the O's as rings, an R with a long leg, an E and an
L with fine hairline serifs, and an ampersand of its own. Everything else is
Cormorant's, at the weights the site sets. README.md, next to this file, says
what each letter is and why.

    python3 -m venv .venv
    .venv/bin/pip install -r design/type/requirements.txt
    .venv/bin/python design/type/build.py              # writes app/fonts/elorro-display-*.woff2
    .venv/bin/python design/type/build.py --ttf DIR    # and TTFs in DIR, for proofing

The sources are in design/type/source: Cormorant Garamond's variable latin
file (the one the site used to serve) and, for the ampersand, Cormorant
Upright's (the same project's upright italic). All coordinates below are in
font units: 1000 to the em, the baseline at 0, the capitals 625 tall.
"""

from __future__ import annotations

import argparse
import math
from pathlib import Path

import pathops
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables import otTables as ot
from fontTools.varLib import instancer

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SOURCE = HERE / "source" / "CormorantGaramond-Variable-latin.woff2"
UPRIGHT = {
    600: HERE / "source" / "CormorantUpright-SemiBold-latin.woff2",
    700: HERE / "source" / "CormorantUpright-Bold-latin.woff2",
}
OUT = ROOT / "app" / "fonts"

VERSION = "1.000"
FAMILY = "Elorro Display"

# The styles: what the site calls each weight, the Cormorant Garamond weight
# it's drawn from, and the Cormorant Upright weight its ampersand comes from
# (a step heavier, as the upright's strokes run lighter than the roman's).
STYLES = [
    {"style": "Regular", "wght": 500, "amp": 600, "file": "elorro-display-regular"},
    {"style": "SemiBold", "wght": 600, "amp": 700, "file": "elorro-display-semibold"},
    {"style": "Bold", "wght": 700, "amp": 700, "file": "elorro-display-bold"},
]

CAP = 625          # cap height
OVER = 12          # how far round letters overshoot the baseline and cap height


# ── Geometry ───────────────────────────────────────────────────────────────


def new() -> pathops.Path:
    return pathops.Path()


def union(*paths: pathops.Path) -> pathops.Path:
    out = new()
    for p in paths:
        out = pathops.op(out, p, pathops.PathOp.UNION, clockwise=True)
    return out


def minus(a: pathops.Path, b: pathops.Path) -> pathops.Path:
    return pathops.op(a, b, pathops.PathOp.DIFFERENCE, clockwise=True)


def meet(a: pathops.Path, b: pathops.Path) -> pathops.Path:
    return pathops.op(a, b, pathops.PathOp.INTERSECTION, clockwise=True)


def rect(x0: float, y0: float, x1: float, y1: float) -> pathops.Path:
    p = new()
    pen = p.getPen()
    pen.moveTo((x0, y0))
    pen.lineTo((x0, y1))
    pen.lineTo((x1, y1))
    pen.lineTo((x1, y0))
    pen.closePath()
    return p


def circle(cx: float, cy: float, r: float) -> pathops.Path:
    """A circle, as four cubic quarter-arcs (off by 0.03% at most)."""
    k = 0.5522847498 * r
    p = new()
    pen = p.getPen()
    pen.moveTo((cx, cy - r))
    pen.curveTo((cx - k, cy - r), (cx - r, cy - k), (cx - r, cy))
    pen.curveTo((cx - r, cy + k), (cx - k, cy + r), (cx, cy + r))
    pen.curveTo((cx + k, cy + r), (cx + r, cy + k), (cx + r, cy))
    pen.curveTo((cx + r, cy - k), (cx + k, cy - r), (cx, cy - r))
    pen.closePath()
    return p


def ellipse(cx: float, cy: float, rx: float, ry: float) -> pathops.Path:
    kx, ky = 0.5522847498 * rx, 0.5522847498 * ry
    p = new()
    pen = p.getPen()
    pen.moveTo((cx, cy - ry))
    pen.curveTo((cx - kx, cy - ry), (cx - rx, cy - ky), (cx - rx, cy))
    pen.curveTo((cx - rx, cy + ky), (cx - kx, cy + ry), (cx, cy + ry))
    pen.curveTo((cx + kx, cy + ry), (cx + rx, cy + ky), (cx + rx, cy))
    pen.curveTo((cx + rx, cy - ky), (cx + kx, cy - ry), (cx, cy - ry))
    pen.closePath()
    return p


def shape(*segments) -> pathops.Path:
    """A closed outline from ("M", pt), ("L", pt) and ("C", c1, c2, pt) steps."""
    p = new()
    pen = p.getPen()
    for seg in segments:
        kind, pts = seg[0], seg[1:]
        if kind == "M":
            pen.moveTo(pts[0])
        elif kind == "L":
            pen.lineTo(pts[0])
        elif kind == "C":
            pen.curveTo(*pts)
    pen.closePath()
    return p


def spline(points: list[tuple[float, float]]) -> pathops.Path:
    """A closed, smooth outline through a ring of sampled points: each
    sample is an off-curve point of a TrueType-style quadratic spline, so the
    curve runs smoothly just inside them. Corners are made by repeating a
    point."""
    p = new()
    pen = p.getPen()
    n = len(points)
    mid = lambda a, b: ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
    pen.moveTo(mid(points[-1], points[0]))
    for i in range(n):
        pen.qCurveTo(points[i], mid(points[i], points[(i + 1) % n]))
    pen.closePath()
    return p


def moved(p: pathops.Path, dx: float = 0, dy: float = 0) -> pathops.Path:
    out = new()
    p.draw(TransformPen(out.getPen(), (1, 0, 0, 1, dx, dy)))
    return out


def scaled(p: pathops.Path, s: float, ox: float = 0, oy: float = 0) -> pathops.Path:
    out = new()
    p.draw(TransformPen(out.getPen(), (s, 0, 0, s, ox - s * ox, oy - s * oy)))
    return out


def span(p: pathops.Path, *, y: float | None = None, x: float | None = None) -> list[tuple[float, float]]:
    """Where a horizontal (y=) or vertical (x=) line runs through ink: a list
    of (from, to) intervals, measured by cutting a hairline-thin strip."""
    big = 5000
    strip = rect(-big, y - 0.25, big, y + 0.25) if y is not None else rect(x - 0.25, -big, x + 0.25, big)
    cut = meet(p, strip)
    out = []
    for c in cut.contours:
        b = c.bounds
        out.append((b[0], b[2]) if y is not None else (b[1], b[3]))
    return sorted(out)


# ── Font plumbing ──────────────────────────────────────────────────────────


def outline(font: TTFont, name: str) -> pathops.Path:
    p = new()
    font.getGlyphSet()[name].draw(p.getPen())
    return p


def contours(font: TTFont, name: str) -> list[pathops.Path]:
    """A glyph's contours as separate paths, in the font's own order."""
    rec = DecomposingRecordingPen(font.getGlyphSet())
    font.getGlyphSet()[name].draw(rec)
    out, cur = [], None
    for op, args in rec.value:
        if op == "moveTo":
            cur = new()
            pen = cur.getPen()
            pen.moveTo(*args)
        elif op in ("closePath", "endPath"):
            pen.closePath()
            out.append(cur)
        else:
            getattr(pen, op)(*args)
    return out


def put(font: TTFont, name: str, p: pathops.Path, advance: float | None = None, lsb: float | None = None) -> None:
    """Make glyph `name` the outline `p`. With `lsb`, the outline is moved so
    its left edge sits there; `advance` is the width (kept if not given)."""
    p = pathops.Path(p)
    p.simplify(clockwise=True)
    if lsb is not None:
        p = moved(p, lsb - p.bounds[0])
    pen = TTGlyphPen(None)
    p.draw(Cu2QuPen(pen, max_err=0.6, reverse_direction=False))
    glyph = pen.glyph()
    glyph.recalcBounds(font["glyf"])
    font["glyf"][name] = glyph
    adv = round(advance) if advance is not None else font["hmtx"][name][0]
    font["hmtx"][name] = (adv, glyph.xMin if glyph.numberOfContours else 0)


def accents(font: TTFont, name: str) -> list[pathops.Path]:
    """The accent contours of a precomposed capital: the ones above the cap height."""
    return [c for c in contours(font, name) if c.bounds[1] > CAP + 10]


# ── Measuring Cormorant at this weight ─────────────────────────────────────


def measure(font: TTFont) -> dict:
    E, O, I = outline(font, "E"), outline(font, "O"), outline(font, "I")
    o_side = span(O, y=312)                       # [(left stroke), (right stroke)]
    o_top = span(O, x=383)                        # [(bottom), (top)]
    e_top = span(E, x=300)                        # the arms where they're plain bars
    i_serif = span(I, x=60)                       # the I's foot and head serifs, out past its stem
    stem = span(I, y=312)[0]
    return {
        "stem": stem[1] - stem[0],
        "o_thick": o_side[0][1] - o_side[0][0],
        "o_thin": o_top[-1][1] - o_top[-1][0],
        "arm": e_top[-1][1] - e_top[-1][0],         # the top arm
        "foot": e_top[0][1] - e_top[0][0],          # the bottom arm
        "hair": i_serif[-1][1] - i_serif[-1][0],    # a hairline serif: the I's head
    }


# ── The signature letters ──────────────────────────────────────────────────


def ring_o(m: dict, style: str) -> tuple[pathops.Path, float, float]:
    """The O as a ring: a perfect circle, cap height and overshoot. Its
    counter is a vesica, the shape two circles make where they overlap: our
    two rings, met in every O. Returns the outline, the centre x, the width."""
    r_out = (CAP + 2 * OVER) / 2
    cy = CAP / 2
    cx = r_out
    thick, thin = m["o_thick"] * 0.93, m["o_thin"]
    if style == "ellipse":
        counter = ellipse(cx, cy, r_out - thick, r_out - thin)
    elif style == "twin":
        # Two rings a little apart: the union of their outsides, the meeting of their insides.
        d = (thick - thin) / 2
        h = r_out
        R = math.sqrt(h * h + d * d)
        r = R - thin
        outer = union(circle(cx - d, cy, R), circle(cx + d, cy, R))
        counter = meet(circle(cx - d, cy, r), circle(cx + d, cy, r))
        return minus(outer, counter), cx, 2 * (R + d)
    else:
        a, b = r_out - thick, r_out - thin            # the counter's half-width and half-height
        e = (b * b - a * a) / (2 * a)                 # the two circles' distance from the centre
        rho = a + e
        counter = meet(circle(cx - e, cy, rho), circle(cx + e, cy, rho))
    return minus(circle(cx, cy, r_out), counter), cx, 2 * r_out


def nib_stroke(spine, widths, angle_deg: float, samples: int = 48) -> pathops.Path:
    """A broad-nib stroke along a cubic spine: the nib, held at `angle_deg`,
    is `widths(t)` wide at each point, so the stroke is thick where it runs
    across the nib and thin where it runs along it, as with a pen."""
    (x0, y0), (x1, y1), (x2, y2), (x3, y3) = spine
    ca, sa = math.cos(math.radians(angle_deg)), math.sin(math.radians(angle_deg))
    left, right = [], []
    for i in range(samples + 1):
        t = i / samples
        u = 1 - t
        x = u**3 * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t**3 * x3
        y = u**3 * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t**3 * y3
        w = widths(t) / 2
        left.append((x - w * ca, y - w * sa))
        right.append((x + w * ca, y + w * sa))
    ring = right + left[::-1]
    return spline(ring)


def long_leg(m: dict) -> pathops.Path:
    """The R's leg: out of the bowl and down to the baseline in one long,
    easing stroke, then on along it to a hairline tail, like a pen lifting."""
    w = m["stem"] * 1.04
    tip = m["hair"] * 0.7

    def widths(t: float) -> float:
        if t < 0.1:                                   # it starts narrow, inside the bowl's stroke
            return 22 + (w - 22) * math.sin(t / 0.1 * math.pi / 2)
        if t < 0.38:
            return w
        k = min(1.0, (t - 0.38) / 0.62)
        return tip + (w - tip) * (1 - k) ** 1.5

    spine = ((300, 318), (408, 214), (466, -6), (796, 14))
    leg = nib_stroke(spine, widths, 38)
    # It stands on the baseline: anything under it is cut flat.
    return minus(leg, rect(0, -400, 1200, 0))


def hairline_serif(x: float, base: float, height: float, hair: float, arm: float, up: bool, lean: float = 5) -> pathops.Path:
    """An arm's end: the bar `arm` thick, finishing in a fine vertical
    hairline serif at `x` (its outer edge), `height` tall from the bar's outer
    edge, with only a small bracket where it meets the bar. `base` is the
    bar's outer edge (0 for a bottom arm, the cap height for a top one)."""
    s = 1 if up else -1
    tip = base + s * height
    inner_x = x - hair * 1.25
    bracket = hair * 2.6
    bar_in = base + s * arm                              # the bar's inner edge
    pts = [
        ("M", (250, base)),
        ("L", (x, base)),
        ("C", (x + lean * 0.2, base + s * height * 0.35), (x + lean * 0.7, base + s * height * 0.7), (x + lean, tip)),
        ("L", (inner_x + lean * 0.6, tip - s * hair * 0.9)),
        ("C", (inner_x + lean * 0.3, base + s * height * 0.6), (inner_x, bar_in + s * bracket * 1.2), (inner_x - bracket * 0.35, bar_in + s * bracket * 0.3)),
        ("C", (inner_x - bracket * 0.6, bar_in + s * bracket * 0.08), (inner_x - bracket, bar_in), (inner_x - bracket * 1.6, bar_in)),
        ("L", (250, bar_in)),
    ]
    return shape(*pts)


def middle_serif(x: float, mid: float, half: float, hair: float, arm: float, from_x: float) -> pathops.Path:
    """The E's middle arm: a bar from the stem, ending in a short hairline
    serif `half` above and below its centre line."""
    bar = rect(from_x, mid - arm / 2, x - hair, mid + arm / 2)
    inner = x - hair * 1.25
    br = hair * 2.2
    serif = shape(
        ("M", (x, mid - half)),
        ("L", (x, mid + half)),
        ("L", (inner, mid + half - hair * 0.6)),
        ("C", (inner, mid + arm / 2 + br), (inner - br * 0.4, mid + arm / 2), (inner - br * 1.4, mid + arm / 2)),
        ("L", (inner - br * 1.4, mid - arm / 2)),
        ("C", (inner - br * 0.4, mid - arm / 2), (inner, mid - arm / 2 - br), (inner, mid - half + hair * 0.6)),
    )
    return union(bar, serif)


def draw_E(font: TTFont, m: dict) -> pathops.Path:
    cs = contours(font, "E")
    stem = meet(cs[0], rect(-100, -100, 300, 800))      # stem, its serifs and the arms' first stretch
    top = hairline_serif(463, CAP, 118, m["hair"], m["arm"], up=False)
    bottom = hairline_serif(492, 0, 142, m["hair"], m["foot"], up=True)
    mid_y = (span(cs[1], x=250)[0][0] + span(cs[1], x=250)[0][1]) / 2
    middle = middle_serif(420, mid_y, 52, m["hair"], m["foot"], 150)
    return union(stem, top, bottom, middle)


def draw_L(font: TTFont, m: dict) -> pathops.Path:
    base = meet(outline(font, "L"), rect(-100, -100, 300, 800))
    foot = hairline_serif(518, 0, 150, m["hair"], m["foot"], up=True)
    return union(base, foot)


def draw_R(font: TTFont, m: dict) -> pathops.Path:
    cs = contours(font, "R")
    # Cormorant's R is its leg (the first contour), then the stem and bowl, then the bowl's counter.
    # The new leg joins the stem and bowl, and the counter is cut out of both, so nothing pokes into it.
    return minus(union(cs[1], long_leg(m)), cs[2])


AMP_SCALE = 1.08


def ampersand(wght: int) -> pathops.Path:
    """The ampersand: the italic "Et" form, from Cormorant Upright (the
    Cormorant project's upright italic) in place of Cormorant Garamond's
    roman one, a weight heavier than the letters around it and 8% larger, so
    it holds its own in gold between two names."""
    return scaled(outline(TTFont(UPRIGHT[wght]), "ampersand"), AMP_SCALE, 0, 0)


# ── Kerning ────────────────────────────────────────────────────────────────


def pair_kern(font: TTFont, a: str, b: str) -> int:
    """What Cormorant's kerning does to the pair a-b: the first matching
    subtable of each kern lookup, added up, as a browser applies them."""
    gpos = font["GPOS"].table
    total = 0
    for i in sorted(kern_lookups(font)):
        for st in gpos.LookupList.Lookup[i].SubTable:
            if a not in st.Coverage.glyphs:
                continue
            if st.Format == 1:
                ps = st.PairSet[st.Coverage.glyphs.index(a)]
                rec = next((r for r in ps.PairValueRecord if r.SecondGlyph == b), None)
                if rec is None:
                    continue
                total += getattr(rec.Value1, "XAdvance", 0) or 0
                break
            c1 = st.ClassDef1.classDefs.get(a, 0)
            c2 = st.ClassDef2.classDefs.get(b, 0)
            v = st.Class1Record[c1].Class2Record[c2].Value1
            total += getattr(v, "XAdvance", 0) or 0
            break
    return total


def kern_lookups(font: TTFont) -> set[int]:
    gpos = font["GPOS"].table
    return {i for fr in gpos.FeatureList.FeatureRecord if fr.FeatureTag == "kern" for i in fr.Feature.LookupListIndex}


def add_kerning(font: TTFont, pairs: dict[tuple[str, str], int]) -> None:
    """Add `pairs` on top of Cormorant's kerning, as a lookup of their own at
    the end of the kern feature (pair adjustments add up)."""
    pairs = {k: v for k, v in pairs.items() if v}
    if not pairs:
        return
    gid = font.getGlyphID
    st = ot.PairPos()
    st.Format = 1
    st.ValueFormat1, st.ValueFormat2 = 4, 0           # XAdvance on the first glyph
    firsts = sorted({a for a, _ in pairs}, key=gid)
    st.Coverage = ot.Coverage()
    st.Coverage.glyphs = firsts
    st.PairSet = []
    for a in firsts:
        ps = ot.PairSet()
        ps.PairValueRecord = []
        for (x, b), v in sorted(pairs.items(), key=lambda kv: gid(kv[0][1])):
            if x == a:
                rec = ot.PairValueRecord()
                rec.SecondGlyph = b
                rec.Value1 = ot.ValueRecord()
                rec.Value1.XAdvance = v
                ps.PairValueRecord.append(rec)
        ps.PairValueCount = len(ps.PairValueRecord)
        st.PairSet.append(ps)
    st.PairSetCount = len(st.PairSet)
    lookup = ot.Lookup()
    lookup.LookupType, lookup.LookupFlag = 2, 0
    lookup.SubTable, lookup.SubTableCount = [st], 1
    gpos = font["GPOS"].table
    gpos.LookupList.Lookup.append(lookup)
    gpos.LookupList.LookupCount = len(gpos.LookupList.Lookup)
    index = len(gpos.LookupList.Lookup) - 1
    for fr in gpos.FeatureList.FeatureRecord:
        if fr.FeatureTag == "kern":
            fr.Feature.LookupListIndex.append(index)
            fr.Feature.LookupCount = len(fr.Feature.LookupListIndex)


BAND = 10


def profile(p: pathops.Path, side: str, lo: float = -40, hi: float = 760) -> dict[int, float]:
    """A glyph's edge, band by band (BAND units tall): its rightmost or
    leftmost ink in each."""
    out = {}
    y = lo
    while y < hi:
        cut = meet(p, rect(-3000, y, 3000, y + BAND))
        b = cut.bounds if list(cut.contours) else None
        if b and b[2] > b[0]:
            out[int(y)] = b[2] if side == "right" else b[0]
        y += BAND
    return out


def clearance_kerning(font: TTFont, old: TTFont, first: str, gap: float, above: float) -> dict[tuple[str, str], int]:
    """Kerning for a glyph whose right side has changed (the R): against
    every character that can follow it (letters, figures, accented letters,
    punctuation and the ampersand), keep the space Cormorant gave
    its upper part (the bowl, above `above`), but never let the new parts
    come within `gap` of the next letter. Low punctuation (a comma, a
    full stop), with nothing up by the bowl, comes as close to the tail's
    tip as Cormorant had it to the end of its leg."""
    new_r, old_r = profile(outline(font, first), "right"), profile(outline(old, first), "right")
    adv_new, adv_old = font["hmtx"][first][0], old["hmtx"][first][0]
    cmap = font.getBestCmap()
    followers = sorted({cmap[c] for c in cmap if chr(c).isprintable() and not chr(c).isspace() and c < 0x2200})
    out = {}
    for b in followers:
        left = profile(outline(font, b), "left")
        left_old = profile(outline(old, b), "left")
        k_old = pair_kern(old, first, b)
        # Cormorant's tightest spot between the two, above the leg.
        up = [adv_old + k_old + left_old[y] - old_r[y] for y in old_r if y >= above and y in left_old]
        if up:
            target = min(up)
            k = target - min(adv_new + left[y] - new_r[y] for y in new_r if y >= above and y in left)
        else:
            whole = [adv_old + k_old + left_old[y] - old_r[y] for y in old_r if y in left_old]
            if not whole:
                continue
            k = max(min(whole), gap) - min(adv_new + left[y] - new_r[y] for y in new_r if y in left)
        # And nowhere closer than `gap`, the leg and its tail included.
        close = min((adv_new + k + left[y] - new_r[y] for y in new_r if y in left), default=gap)
        if close < gap:
            k += gap - close
        delta = round(k - k_old)
        if abs(delta) >= 4:
            out[(first, b)] = delta
    return out


def shift_marks(font: TTFont, deltas: dict[str, float]) -> None:
    """Move the accent anchors of glyphs whose width changed, so a combining
    accent still lands over the letter's middle."""
    gpos = font["GPOS"].table
    for lookup in gpos.LookupList.Lookup:
        for st in lookup.SubTable:
            if lookup.LookupType == 9:
                st = st.ExtSubTable
            if getattr(st, "LookupType", None) != 4 and type(st).__name__ != "MarkBasePos":
                continue
            for i, g in enumerate(st.BaseCoverage.glyphs):
                if g in deltas:
                    for anchor in st.BaseArray.BaseRecord[i].BaseAnchor:
                        if anchor is not None:
                            anchor.XCoordinate = round(anchor.XCoordinate + deltas[g])


# ── Names and tables ───────────────────────────────────────────────────────


def rename(font: TTFont, s: dict) -> None:
    style = s["style"]
    ribbi = style in ("Regular", "Bold")
    ps = f"ElorroDisplay-{style}"
    names = {
        0: "Copyright 2015 The Cormorant Project Authors (github.com/CatharsisFonts/Cormorant). "
        "Elorro Display's changes copyright 2026 Elorro (elorro.com).",
        1: FAMILY if ribbi else f"{FAMILY} {style}",
        2: style if ribbi else "Regular",
        3: f"{VERSION};ELRO;{ps}",
        4: f"{FAMILY} {style}",
        5: f"Version {VERSION}; a derivative of Cormorant Garamond 4.001",
        6: ps,
        13: "This Font Software is licensed under the SIL Open Font License, Version 1.1. "
        "This license is available with a FAQ at: https://openfontlicense.org",
        14: "https://openfontlicense.org",
    }
    if not ribbi:
        names[16], names[17] = FAMILY, style
    table = font["name"]
    table.names = []
    for nid, text in names.items():
        table.setName(text, nid, 3, 1, 0x409)
        table.setName(text, nid, 1, 0, 0)
    for tag in ("STAT", "DSIG"):
        if tag in font:
            del font[tag]
    os2 = font["OS/2"]
    os2.usWeightClass = s["wght"]
    os2.achVendID = "ELRO"
    sel = os2.fsSelection & ~0b1100001                # clear italic, bold, regular
    sel |= 1 << 7                                      # use the typo metrics, as Cormorant does
    if style == "Regular":
        sel |= 1 << 6
    if style == "Bold":
        sel |= 1 << 5
    os2.fsSelection = sel
    font["head"].macStyle = 1 if style == "Bold" else 0
    font["head"].fontRevision = float(VERSION)
    # Same sources, same files: the dates stay Cormorant's, so a rebuild is byte for byte.
    font.recalcTimestamp = False


# ── The build ──────────────────────────────────────────────────────────────


def build(s: dict, o_style: str = "vesica") -> TTFont:
    font = instancer.instantiateVariableFont(TTFont(SOURCE), {"wght": s["wght"]}, updateFontNames=False)
    font.flavor = None
    base = instancer.instantiateVariableFont(TTFont(SOURCE), {"wght": s["wght"]}, updateFontNames=False)
    m = measure(font)
    old_o = outline(font, "O").bounds

    # O, and every letter built on it.
    ring, cx, width = ring_o(m, o_style)
    side = font["hmtx"]["O"][1] - 4                     # a little tighter than Cormorant's: a circle is narrower
    put(font, "O", ring, advance=width + 2 * side, lsb=side)
    new_o = outline(font, "O").bounds
    dx_o = (new_o[0] + new_o[2]) / 2 - (old_o[0] + old_o[2]) / 2
    for name in ("Ograve", "Oacute", "Ocircumflex", "Otilde", "Odieresis"):
        put(font, name, union(outline(font, "O"), *[moved(a, dx_o) for a in accents(font, name)]), advance=font["hmtx"]["O"][0])
    q_tail = [c for c in contours(font, "Q") if c.bounds[1] < -30]
    put(font, "Q", union(outline(font, "O"), *[moved(c, dx_o) for c in q_tail]), advance=font["hmtx"]["O"][0])
    o = outline(font, "O")
    ob = o.bounds
    slash_w = m["o_thin"] * 1.15
    slash = shape(("M", (ob[0] + 40, ob[1] - 28)), ("L", (ob[0] + 40 + slash_w * 1.3, ob[1] - 28)),
                  ("L", (ob[2] - 40, ob[3] + 28)), ("L", (ob[2] - 40 - slash_w * 1.3, ob[3] + 28)))
    put(font, "Oslash", union(o, slash), advance=font["hmtx"]["O"][0])

    # E, L, R.
    put(font, "E", draw_E(font, m))
    for name in ("Egrave", "Eacute", "Ecircumflex", "Edieresis"):
        put(font, name, union(outline(font, "E"), *accents(font, name)), advance=font["hmtx"]["E"][0])
    put(font, "L", draw_L(font, m))
    r = draw_R(font, m)
    put(font, "R", r, advance=r.bounds[2] - 12)      # the tail's hairline tip runs just past the width

    # The ampersand.
    amp = ampersand(s["amp"])
    put(font, "ampersand", amp, advance=amp.bounds[2] - amp.bounds[0] + 40 + 26, lsb=40)

    shift_marks(font, {"O": dx_o})
    pairs = clearance_kerning(font, base, "R", gap=18, above=300)
    # The L's open corner leaves a hole before a round letter: close it a little.
    for o in ("O", "Oacute", "Ograve", "Ocircumflex", "Otilde", "Odieresis", "Q", "C", "G"):
        pairs[("L", o)] = -24
    add_kerning(font, pairs)
    rename(font, s)
    return font


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--ttf", type=Path, help="also write TTFs here, for proofing")
    ap.add_argument("--no-woff2", action="store_true", help="don't write app/fonts")
    ap.add_argument("--o", default="vesica", choices=["vesica", "twin", "ellipse"], help="the O's counter (proofing)")
    args = ap.parse_args()
    for s in STYLES:
        font = build(s, args.o)
        if args.ttf:
            args.ttf.mkdir(parents=True, exist_ok=True)
            font.save(args.ttf / f"{s['file']}.ttf")
        if not args.no_woff2:
            font.flavor = "woff2"
            font.save(OUT / f"{s['file']}.woff2")
        print(f"{s['style']:9} {s['wght']}  {font['maxp'].numGlyphs} glyphs")


if __name__ == "__main__":
    main()
