#!/usr/bin/env python3
"""Recover referenced media from the WordPress export into site/.

Fills the gap described in data/missing-media.md. The extracted content
references uploads under two schemes, and both are populated here:

  /assets/img/uploads/<type>/<slug>[-<n>].<ext>   frontmatter fields (README §6a)
  /assets/{img/<kind>,video,docs}/<name>.<ext>    everything referenced from body HTML

The second group came from raw /wp-content/uploads/YYYY/MM/ URLs. Those date
buckets are a WordPress artifact with no meaning here, so the files were moved
into purpose-named folders (img/people, img/services, img/books, img/ui, ...),
the content references were rewritten, and data/media-map.json records
destination -> original upload so this stays reproducible.

The remapped scheme loses the original filename, so the mapping is rebuilt from
data/media-manifest.json (original path -> pages that reference it), inverted to
page -> images. Images referenced by more than CHROME_MIN pages are site chrome
(favicon, header logo, banner swoop), not record media, and are excluded. Where a
record owns several images, they are ordered by attachment ID (upload order) so
the -1/-2/-3 suffixes stay stable across runs.

Nothing is copied verbatim unless re-encoding would make it bigger: uploads hold
full-size camera originals (README §12).

Usage:  python3 tools/recover-media.py [--dry-run]
"""
import collections
import json
import os
import re
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOADS = os.path.join(ROOT, "www", "wp-content", "uploads")
DUMP = os.path.join(ROOT, "www", "y7c9a5a_db142477_ndh.sql")
MANIFEST = os.path.join(ROOT, "data", "media-manifest.json")
CONTENT = os.path.join(ROOT, "site", "content")
CACHE = os.path.join(ROOT, "data", "attachment-ids.json")
# Assets referenced by raw /wp-content/uploads/... URLs in body HTML used to be
# served from that same path. They now live in tidy, purpose-named folders under
# site/assets/, and the content references were rewritten to match, so this file
# records destination -> original upload for each of them.
MEDIA_MAP = os.path.join(ROOT, "data", "media-map.json")
# Files the pruned export no longer holds, downloaded from the live site and
# mirrored in the uploads layout. www/ is read-only, so they live apart from it.
SOURCED = os.path.join(ROOT, "data", "sourced-media")

CHROME_MIN = 50
IMG_EXT = re.compile(r"\.(jpe?g|png|gif|webp|svg)$", re.I)
SIZED = re.compile(r"-(\d+)x(\d+)(\.[a-z0-9]+)$", re.I)
# longest-side cap per record type; raw sized variants use their own dimensions
CAPS = {"personnel": 800, "posts": 1200, "pages": 1600}
DEFAULT_CAP = 1600

# Referenced derivative -> a surviving file that is the same photograph. The §4
# prune kept originals and dropped WordPress's generated sizes; this one is a
# rename rather than a size variant, so the suffix rule below cannot find it.
ALIASES = {
    "/assets/img/uploads/personnel/deyan-denev.jpg": "2019/03/Deyan-2020-scaled.jpg",
}


def attachment_ids():
    """path -> attachment post ID, from _wp_attached_file. Cached; the dump is 70 MB."""
    if os.path.isfile(CACHE):
        return json.load(open(CACHE))
    sys.path.insert(0, os.path.join(ROOT, "tools"))
    from wpdump import iter_rows
    ids = {}
    for _t, cols, vals in iter_rows(DUMP, tables={"ynrh_postmeta"}):
        row = dict(zip(cols, vals))
        if row["meta_key"] == "_wp_attached_file":
            ids["/wp-content/uploads/" + row["meta_value"]] = int(row["post_id"])
    json.dump(ids, open(CACHE, "w"))
    return ids


def page_index(manifest, ids):
    chrome = {o for o, pages in manifest.items() if len(pages) > CHROME_MIN}
    index = collections.defaultdict(list)
    for orig, pages in manifest.items():
        if orig in chrome or not IMG_EXT.search(orig):
            continue
        for p in pages:
            index[p.rstrip("/") + "/"].append(orig)
    for key, imgs in index.items():
        index[key] = sorted(set(imgs), key=lambda x: ids.get(x, 10 ** 9))
    return index, chrome


def targets_in(path, prefix):
    text = open(path, encoding="utf-8").read()
    found = set(re.findall(rf"{prefix}[^\"\\ ]+", text))
    return sorted(found, key=lambda p: int(m.group(1)) if (m := re.search(r"-(\d+)\.", p)) else 0)


def build_plan(index):
    """target URL -> original /wp-content/uploads path."""
    plan, unresolved = {}, []

    def assign(target, cands, i=0):
        if i < len(cands):
            plan[target] = cands[i]
        else:
            unresolved.append(target)

    for slug_file in sorted(os.listdir(os.path.join(CONTENT, "personnel"))):
        if not slug_file.endswith(".md"):
            continue
        slug = slug_file[:-3]
        m = re.search(r'"photo": "([^"]+)"', open(os.path.join(CONTENT, "personnel", slug_file)).read())
        if m and m.group(1):
            assign(m.group(1), index.get(f"/personnel/{slug}/", []))

    for slug_file in sorted(os.listdir(os.path.join(CONTENT, "posts"))):
        if not slug_file.endswith(".md"):
            continue
        slug = slug_file[:-3]
        tgts = targets_in(os.path.join(CONTENT, "posts", slug_file), "/assets/img/uploads/posts/")
        cands = next((index[k] for k in (f"/{slug}/", f"/culture/{slug}/", f"/whats-new/{slug}/") if index.get(k)), [])
        for i, t in enumerate(tgts):
            assign(t, cands, i)

    for slug_file in sorted(os.listdir(os.path.join(CONTENT, "pages"))):
        if not slug_file.endswith(".md"):
            continue
        p = os.path.join(CONTENT, "pages", slug_file)
        pm = re.search(r'"path": "([^"]+)"', open(p, encoding="utf-8").read())
        tgts = targets_in(p, "/assets/img/uploads/pages/")
        cands = index.get(pm.group(1).rstrip("/") + "/", []) if pm else []
        for i, t in enumerate(tgts):
            assign(t, cands, i)

    # Assets that were referenced by raw upload URLs, now served from tidy folders.
    for target, original in json.load(open(MEDIA_MAP)).items():
        plan[target] = original

    return plan, unresolved


def locate(ref):
    """Absolute path to the file backing `ref`, or None.

    Checks the export first, then the externally sourced mirror, and for each
    falls back to the original a WordPress size variant was generated from --
    §4 pruned the generated sizes but kept every parent.
    """
    rel = ref.split("/wp-content/uploads/", 1)[-1].split("?")[0]
    parent = SIZED.sub(r"\3", rel) if SIZED.search(rel) else None
    for base in (UPLOADS, SOURCED):
        for candidate in (rel, parent):
            if candidate and os.path.isfile(os.path.join(base, candidate)):
                return os.path.join(base, candidate)
    return None


def dimensions(path):
    try:
        out = subprocess.run(["sips", "-g", "pixelWidth", "-g", "pixelHeight", path],
                             capture_output=True, text=True, check=True).stdout
        return (int(re.search(r"pixelWidth:\s*(\d+)", out).group(1)),
                int(re.search(r"pixelHeight:\s*(\d+)", out).group(1)))
    except Exception:
        return None


def cap_for(target):
    if target.startswith("/assets/img/uploads/"):
        return CAPS.get(target.split("/")[4], DEFAULT_CAP)
    m = SIZED.search(target)
    return max(int(m.group(1)), int(m.group(2))) if m else DEFAULT_CAP


def encode(src, dst, cap):
    """Re-encode src to dst, capped at `cap` on the longest side.

    Never enlarges -- `sips -Z` scales a smaller image *up* to the cap, which
    both bloats the file and softens it. Never writes a result larger than the
    source either; plenty of these PNGs are already well optimized.
    """
    ext = os.path.splitext(dst)[1].lower()
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if ext in (".svg", ".pdf"):
        shutil.copy2(src, dst)
        return "copied"
    if ext == ".mp4":
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src,
                        "-vf", "scale='min(1280,iw)':-2", "-an",
                        "-c:v", "libx264", "-crf", "27", "-preset", "medium",
                        "-movflags", "+faststart", dst], check=True)
        return "video"
    d = dimensions(src)
    cmd = ["sips", "-Z", str(min(cap, max(d)) if d else cap)]
    if ext in (".jpg", ".jpeg"):
        cmd += ["-s", "format", "jpeg", "-s", "formatOptions", "80"]
    subprocess.run(cmd + [src, "--out", dst], check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if os.path.getsize(dst) > os.path.getsize(src):
        shutil.copy2(src, dst)
        return "as-is"
    return "encoded"


def main():
    dry = "--dry-run" in sys.argv
    if not os.path.isdir(UPLOADS):
        sys.exit(
            "www/wp-content/uploads not found.\n"
            "It was deleted on purpose once every referenced asset had been recovered\n"
            "into site/assets/ and committed, so this script should not need to run\n"
            "again. Restore the export (README §1) only to re-encode from originals.")

    manifest = json.load(open(MANIFEST))
    index, chrome = page_index(manifest, attachment_ids())
    plan, unresolved = build_plan(index)
    plan.update(ALIASES)
    # A target with no manifest candidate is fine if the map supplies it -- that
    # is how records created after the crawl (and so absent from it) resolve.
    unresolved = [t for t in unresolved if t not in plan]
    print(f"site chrome excluded: {len(chrome)}   targets planned: {len(plan)}")
    if unresolved:
        print(f"no candidate image for {len(unresolved)} target(s): {unresolved}")

    missing, stats = [], collections.Counter()
    src_bytes = out_bytes = 0
    for target, ref in sorted(plan.items()):
        src = locate(ref)
        if not src:
            missing.append(target)
            continue
        if dry:
            stats["would write"] += 1
            continue
        dst = os.path.join(ROOT, "site", target.lstrip("/"))
        try:
            stats[encode(src, dst, cap_for(target))] += 1
        except Exception as exc:
            print(f"  FAILED {target}: {exc}")
            continue
        src_bytes += os.path.getsize(src)
        out_bytes += os.path.getsize(dst)

    print(f"\n{dict(stats)}")
    if not dry:
        print(f"source {src_bytes / 1e6:.1f} MB -> output {out_bytes / 1e6:.1f} MB")
    if missing:
        print(f"\nnot in the export ({len(missing)}) -- must be re-supplied:")
        for t in missing:
            print(f"   {t}")


if __name__ == "__main__":
    main()
