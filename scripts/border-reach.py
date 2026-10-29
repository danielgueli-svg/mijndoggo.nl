# Precompute which other countries each place's radius reaches (coarse).
# Source: Natural Earth 1:50m admin-0 countries (public domain), polygon vertices densified to ~5 km.
# Usage: curl -sLo /tmp/ne.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson && python3 scripts/border-reach.py /tmp/ne.geojson
import json, math, sys
RADII = {"km50": 50, "km100": 100, "km150": 150, "mi50": 80.47, "mi100": 160.93}
def hav(a, b, c, d):
    p = math.pi / 180; x = math.sin((c - a) * p / 2) ** 2 + math.cos(a * p) * math.cos(c * p) * math.sin((d - b) * p / 2) ** 2
    return 12742 * math.asin(math.sqrt(x))
ne = json.load(open(sys.argv[1])); pts = {}
for f in ne["features"]:
    pr = f["properties"]; cc = pr.get("ISO_A2_EH") or pr.get("ISO_A2")
    if not cc or cc == "-99" or pr.get("CONTINENT") not in ("Europe", "Asia", "Africa"): continue
    g = f["geometry"]; polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
    out = pts.setdefault(cc, [])
    for poly in polys:
        ring = poly[0]
        for (x1, y1), (x2, y2) in zip(ring, ring[1:]):
            n = max(1, int(hav(y1, x1, y2, x2) / 5))
            for i in range(n): out.append((y1 + (y2 - y1) * i / n, x1 + (x2 - x1) * i / n))
P = json.load(open("data/places.json")); res = []
for row in P:
    cc, name, la, lo = row[:4]; reach = {}
    near = {}
    for o, ps in pts.items():
        if o == cc: continue
        dmin = min(hav(la, lo, a, b) for a, b in ps if abs(a - la) < 2 and abs(b - lo) < 3.5) if any(abs(a - la) < 2 and abs(b - lo) < 3.5 for a, b in ps) else 9e9
        if dmin < 170: near[o] = dmin
    for k, r in RADII.items():
        hit = sorted(o for o, d in near.items() if d <= r)
        if hit: reach[k] = hit
    res.append([cc, name, la, lo, reach])
json.dump(res, open("data/places.json", "w"), ensure_ascii=False, separators=(",", ":"))
print(sum(1 for r in res if r[4]), "of", len(res), "places reach a border at some radius")
