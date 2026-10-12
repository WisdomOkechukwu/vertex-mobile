"""
Sample exact values out of a reference screenshot instead of eyeballing them.

Dev tooling only. Run with the project venv: `.venv/bin/python scripts/measure.py ...`

    # what colour is that pixel?
    measure.py pick <img> <x> <y> [<x> <y> ...]

    # the N most common colours (find accent / card / key / bg)
    measure.py palette <img> [top]

    # colour of every pixel down a vertical line — finds band edges, section boundaries
    measure.py col <img> <x> [y0] [y1]

    # colour of every pixel across a horizontal line
    measure.py row <img> <y> [x0] [x1]

    # bounding boxes of runs matching a hex colour (buttons, pills, cards)
    measure.py find <img> <hex> [tolerance]

    # image size, and the inner phone-screen box if the shot has a device frame
    measure.py info <img>
"""

import sys
from collections import Counter

from PIL import Image


def load(p):
    return Image.open(p).convert("RGB")


def hx(c):
    return "#%02x%02x%02x" % c


def near(a, b, tol):
    return all(abs(x - y) <= tol for x, y in zip(a, b))


def cmd_pick(img, args):
    im = load(img)
    coords = [int(v) for v in args]
    for x, y in zip(coords[::2], coords[1::2]):
        print(f"({x},{y}) {hx(im.getpixel((x, y)))}")


def cmd_palette(img, args):
    im = load(img)
    top = int(args[0]) if args else 12
    counts = Counter(im.getdata())
    total = im.width * im.height
    for colour, n in counts.most_common(top):
        print(f"{hx(colour):9} {n:8}  {100 * n / total:5.2f}%")


def _scan(im, fixed_axis, fixed, start, end, vertical):
    """Print each colour change along a line — the boundaries are what matter."""
    prev = None
    run_start = start
    for i in range(start, end):
        c = im.getpixel((fixed, i) if vertical else (i, fixed))
        if prev is None:
            prev, run_start = c, i
            continue
        if not near(c, prev, 6):
            print(f"{fixed_axis}{run_start:4}-{i - 1:4} ({i - run_start:3}px) {hx(prev)}")
            prev, run_start = c, i
    print(f"{fixed_axis}{run_start:4}-{end - 1:4} ({end - run_start:3}px) {hx(prev)}")


def cmd_col(img, args):
    im = load(img)
    x = int(args[0])
    y0 = int(args[1]) if len(args) > 1 else 0
    y1 = int(args[2]) if len(args) > 2 else im.height
    _scan(im, "y", x, y0, y1, vertical=True)


def cmd_row(img, args):
    im = load(img)
    y = int(args[0])
    x0 = int(args[1]) if len(args) > 1 else 0
    x1 = int(args[2]) if len(args) > 2 else im.width
    _scan(im, "x", y, x0, x1, vertical=False)


def cmd_find(img, args):
    im = load(img)
    target = tuple(int(args[0].lstrip("#")[i : i + 2], 16) for i in (0, 2, 4))
    tol = int(args[1]) if len(args) > 1 else 12
    px = im.load()
    xs, ys = [], []
    for y in range(im.height):
        for x in range(im.width):
            if near(px[x, y], target, tol):
                xs.append(x)
                ys.append(y)
    if not xs:
        print("no match")
        return
    print(
        f"bbox x{min(xs)}-{max(xs)} y{min(ys)}-{max(ys)}  "
        f"w={max(xs) - min(xs) + 1} h={max(ys) - min(ys) + 1}  px={len(xs)}"
    )


def cmd_srgb(img, args):
    """Convert a colour sampled from a reference back to sRGB.

    The `/design` PNGs are Display-P3 captures of sRGB-authored colours. Neutrals are unaffected
    (a grey is a grey in both spaces), but saturated colours read back desaturated: the brand red
    #ec3013 samples as #de431e, and the green #0f8a5f samples as #398861. Taking those sampled
    values at face value would ship a duller brand. Pass a sampled hex here to recover the sRGB
    value the design was actually authored in.
    """

    def to_linear(c):
        c /= 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    def encode(c):
        c = min(1.0, max(0.0, c))
        v = 12.92 * c if c <= 0.0031308 else 1.055 * (c ** (1 / 2.4)) - 0.055
        return round(v * 255)

    def mul(m, v):
        return [sum(m[i][j] * v[j] for j in range(3)) for i in range(3)]

    p3_to_xyz = [
        [0.4865709, 0.2656677, 0.1982173],
        [0.2289746, 0.6917385, 0.0792869],
        [0.0000000, 0.0451134, 1.0439444],
    ]
    xyz_to_srgb = [
        [3.2404542, -1.5371385, -0.4985314],
        [-0.9692660, 1.8760108, 0.0415560],
        [0.0556434, -0.2040259, 1.0572252],
    ]

    # `img` is the hex here, not a path — this command takes a colour, not an image.
    h = img.lstrip("#")
    rgb = [to_linear(int(h[i : i + 2], 16)) for i in (0, 2, 4)]
    out = [encode(c) for c in mul(xyz_to_srgb, mul(p3_to_xyz, rgb))]
    print(f"#{h} (as sampled, P3)  ->  {hx(tuple(out))} (sRGB, use this in code)")


def cmd_info(img, args):
    im = load(img)
    print(f"size {im.width}x{im.height}")
    # The shots sit on a lavender page behind a rounded device frame; find the frame edges by
    # scanning the middle row inward for where the page colour stops.
    mid = im.height // 2
    page = im.getpixel((2, 2))
    left = next((x for x in range(im.width) if not near(im.getpixel((x, mid)), page, 10)), 0)
    right = next(
        (x for x in range(im.width - 1, -1, -1) if not near(im.getpixel((x, mid)), page, 10)),
        im.width - 1,
    )
    col = im.width // 2
    top = next((y for y in range(im.height) if not near(im.getpixel((col, y)), page, 10)), 0)
    bottom = next(
        (y for y in range(im.height - 1, -1, -1) if not near(im.getpixel((col, y)), page, 10)),
        im.height - 1,
    )
    w = right - left + 1
    print(f"page colour {hx(page)}")
    print(f"device box x{left}-{right} y{top}-{bottom}  w={w} h={bottom - top + 1}")
    print(f"scale vs 390pt: {w / 390:.3f}  (divide measured px by this for pt)")


COMMANDS = {
    "pick": cmd_pick,
    "palette": cmd_palette,
    "col": cmd_col,
    "row": cmd_row,
    "find": cmd_find,
    "info": cmd_info,
    "srgb": cmd_srgb,
}

if __name__ == "__main__":
    if len(sys.argv) < 3 or sys.argv[1] not in COMMANDS:
        print(__doc__)
        sys.exit(1)
    COMMANDS[sys.argv[1]](sys.argv[2], sys.argv[3:])
