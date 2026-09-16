# Missing media — resolved

**Status:** all 819 referenced assets resolve. 815 came from the local WordPress
export, 4 from the live site. Verified by a link check over the built `_site/`:
0 broken references out of 1,334. **Last updated:** 2026-09-16

Previously this file recorded "823 of 823 missing" — that was a per-machine gap,
not a missing-forever one (README §9.1). The machine that ran `tools/extract.py`
only had a live-site crawl (HTML, no binaries); `www/wp-content/uploads/` has the
real files, and they are now re-encoded into `site/`.

## How it was resolved

`data/media-manifest.json` maps each original `/wp-content/uploads/...` path to
the pages referencing it. Inverting that gives page → images, which reconnects
each extracted record to its original file — the remapped
`/assets/img/uploads/<type>/<slug>[-<n>].<ext>` scheme (README §6a) does not
retain the original filename. Ordering within a multi-image record follows
attachment ID (upload order) so `-1`/`-2`/`-3` stay stable between runs.

Two schemes are populated, both required:

| Scheme | Count | Holds |
|---|---|---|
| `/assets/img/uploads/<type>/<slug>[-<n>].<ext>` | 706 | per-record media (personnel photos, post images, page banners) |
| `/assets/img/<kind>/`, `/assets/video/`, `/assets/docs/` | 113 | everything referenced from body HTML |

The second group originally used raw `/wp-content/uploads/YYYY/MM/` URLs, and was
kept that way while the files were missing so they would resolve the moment they
landed. Now that they exist and we own them, the date buckets serve no purpose:
the files were moved into purpose-named folders and the references rewritten.
`data/media-map.json` records destination -> original upload, so
`tools/recover-media.py` reproduces the layout exactly.

Two classes of reference needed resolving rather than a direct hit:

- **WordPress size variants** (`-1024x683`, `-300x200`, `-150x150`, …) appear in
  `srcset`. §4 pruned them as derived files but kept every parent, so each maps
  back to its original and is re-encoded to the requested width.
- **`Deyan-2020-2.jpg`** (personnel headshot) was pruned; `Deyan-2020-scaled.jpg`
  is the same photograph and is aliased to it in the script.

Re-encode: longest side capped at 800 (personnel) / 1200 (posts) / 1600 (pages),
JPEG q80, video via ffmpeg at CRF 27 with the audio track dropped. Nothing is
enlarged and nothing is written larger than its source. 163.8 MB → 149.2 MB across 819 files.

**The source has since been deleted.** `www/wp-content/uploads/` (1.2 GB) was
removed once the recovered assets were verified and committed — they are no
longer the only copy of anything (README §4). Re-running the script now exits
with a pointer to the restore instructions; it should not need to run again:

```bash
python3 tools/recover-media.py            # --dry-run to preview
```

## The 4 the export no longer held

The §4 prune dropped these, and no derivative of them survived under any name.
They were downloaded from the live site, which still serves them, and staged in
`data/sourced-media/` (mirroring the uploads layout, with provenance in its
README). `www/` is read-only source material and was not touched.

| Path | Used by |
|---|---|
| `2024/11/Culture-2523735321.jpg` | `/company/` — Culture card |
| `2024/11/Whats-new-2447982425.jpg` | `/company/` — What's New card |
| `2025/08/firm-growth-forum-thumb.jpg` | `/culture/ceo-jeremy-shares-what-sets-us-apart/` |
| `2026/04/2026-Forbes-...-scaled.png` | `/whats-new/jeremy-dubow-named-forbes-2026-best-in-state-top-cpa/` |

`recover-media.py` checks `www/wp-content/uploads/` first and falls back to
`data/sourced-media/`, so a fresh run reproduces the same 819 outputs.

Note the award badge: the export holds only a **2025** Forbes logo
(`2025/04/2025-Forbes-BIS-Top-CPAs-Award-Logo-Square-72PPI.png`). It was never
substituted — the downloaded file is the genuine 2026 badge, confirmed visually.

## Related

`site/assets/img/linkedin.png` — the personnel template referenced
`/assets/img/linkedin.svg`, which exists nowhere in the export. The active
theme's own `assets/img/linkedin.png` (512×512) is the authentic icon; it is
resized to 48px and the template now points at it.
