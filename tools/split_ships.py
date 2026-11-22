"""Cut a Gemini ship sheet into one image per ship, whatever the layout
(row, column or loose grid). Finds the separate shapes on the black
background, keeps the 5 biggest, orders them smallest to largest,
optionally rotates each so the nose points up.
Usage: python3 tools/split_ships.py <sheet> <race id> [rotate_degrees]
Writes public/art/ships/<race>-1.png (smallest) ... <race>-5.png (largest)."""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

def count_shapes(im, thresh, grow=8):
    lum = np.asarray(im.convert("L")) > thresh
    n = ndimage.label(ndimage.binary_dilation(lum, iterations=grow))[1]
    return n

def best_thresh(im, expected, grow=8):
    """Background darkness varies per sheet; pick the cutoff that finds the ships."""
    for t in (22, 30, 15, 40, 10, 50):
        if count_shapes(im, t, grow) == expected:
            return t
    return min((22, 30, 15, 40, 10, 50), key=lambda t: abs(count_shapes(im, t, grow) - expected))

def split(path, race, rotate=0, expected=5, thresh=None, grow=8):
    im = Image.open(path).convert("RGB")
    if thresh is None:
        # Try looser then tighter joining until the ships come apart cleanly.
        for g in (grow, 4, 2):
            thresh = best_thresh(im, expected, g)
            if count_shapes(im, thresh, g) == expected:
                grow = g
                break
    lum = np.asarray(im.convert("L")) > thresh
    # Join each ship's loose parts (engine glow, fins) before labelling.
    joined = ndimage.binary_dilation(lum, iterations=grow)
    labels, n = ndimage.label(joined)
    boxes = ndimage.find_objects(labels)
    sizes = ndimage.sum(lum, labels, range(1, n + 1))
    by_size = sorted(range(n), key=lambda i: sizes[i])
    by_size = [i for i in by_size if sizes[i] > sizes[by_size[-1]] * 0.01]  # drop specks
    # If Gemini drew extra ships, keep the smallest (scout) and the biggest ones.
    keep = by_size if len(by_size) <= expected else [by_size[0]] + by_size[-(expected - 1):]
    for k, i in enumerate(keep, 1):
        sl = boxes[i]
        part = np.asarray(im)[sl].copy()
        part[~(labels[sl] == i + 1)] = 0  # blank out neighbours poking into the box
        p = Image.fromarray(part)
        if rotate: p = p.rotate(rotate, expand=True)
        p = p.crop(p.convert("L").point(lambda v: 255 if v > thresh else 0).getbbox())
        side = int(max(p.size) * 1.1)
        sq = Image.new("RGB", (side, side), (0, 0, 0))
        sq.paste(p, ((side - p.size[0]) // 2, (side - p.size[1]) // 2))
        a = np.asarray(sq).astype(float)
        lum = a.max(axis=2)
        alpha = np.clip((lum - 8) / 32, 0, 1)  # see-through background, soft edges
        inside = ndimage.binary_fill_holes(ndimage.binary_closing(lum > 40, iterations=3))
        alpha = np.maximum(alpha, inside.astype(float))
        Image.fromarray(np.dstack([a, alpha * 255]).astype("uint8"), "RGBA").save(f"public/art/ships/{race}-{k}.png")
    print(race, len(keep), "ships found out of", n, "shapes")

if __name__ == "__main__":
    split(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 0)
