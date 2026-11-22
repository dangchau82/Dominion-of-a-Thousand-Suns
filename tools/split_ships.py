"""Cut a Gemini ship sheet (ships in a row on black) into one image per ship.
Usage: python3 tools/split_ships.py <sheet image> <race id>
Writes public/art/ships/<race>-1.png (smallest) ... <race>-5.png (largest)."""
import sys
from PIL import Image

def split(path, race, expected=5, thresh=22):
    im = Image.open(path).convert("RGB")
    W, H = im.size
    mask = im.convert("L").point(lambda v: 255 if v > thresh else 0)
    cols = [any(mask.getpixel((x, y)) for y in range(0, H, 2)) for x in range(W)]
    runs, start = [], None
    for x, on in enumerate(cols + [False]):
        if on and start is None: start = x
        if not on and start is not None:
            if x - start > 6: runs.append([start, x])
            start = None
    # merge runs separated by tiny gaps until we have the expected count
    while len(runs) > expected:
        gaps = [runs[i + 1][0] - runs[i][1] for i in range(len(runs) - 1)]
        i = gaps.index(min(gaps))
        runs[i:i + 2] = [[runs[i][0], runs[i + 1][1]]]
    for n, (x0, x1) in enumerate(runs, 1):
        part = im.crop((x0, 0, x1, H))
        box = part.convert("L").point(lambda v: 255 if v > thresh else 0).getbbox()
        part = part.crop(box)
        side = int(max(part.size) * 1.1)
        sq = Image.new("RGB", (side, side), (0, 0, 0))
        sq.paste(part, ((side - part.size[0]) // 2, (side - part.size[1]) // 2))
        sq.save(f"public/art/ships/{race}-{n}.png")
    print(race, len(runs), "ships")

if __name__ == "__main__":
    split(sys.argv[1], sys.argv[2])
