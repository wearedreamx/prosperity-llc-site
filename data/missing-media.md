# Missing media — needs sourcing before Phase F (media re-encode)

Generated from `data/media-manifest.json` (built by `tools/extract.py` from
`reconstructed-site/site-crawl-prosperity.json`).

**823 of 823** distinct `/wp-content/uploads/...` paths referenced across the 380-page
crawl are missing locally. `reconstructed-site/prosperity/assets/` (the folder that
shipped with the crawl) contains only theme/plugin CSS/JS
(`wp-content/themes/ndhcpawp`, `wp-content/plugins/*`) and one icon
(`assets/img/linkedin.svg`) — no actual uploaded photos, logos, or PDFs.

Every extracted data file (`personnel.json`, `posts.json`, `pages.json`,
`locations.json`) currently contains image paths (e.g.
`/wp-content/uploads/2019/03/Jeremy-3.23-1-550x500-2.jpg`) that resolve to nothing
on disk.

## What's missing, by category

- **~198 personnel headshots** — one per team member, referenced from
  `single-post-figure` on each `/personnel/<slug>/` page.
- **Culture / What's New event photos** — hundreds of images across the 104 posts
  (holiday parties, outings, team photos, slideshow galleries on some posts).
- **Award / press logos** — Accounting Today rankings, Best Workplaces badges,
  Crain's recognition graphics, etc.
- **A few PDFs** — e.g. `wp-content/uploads/2024/07/CCH-Client-Axcess-User-Guide.pdf`
  linked from `/client-portal/`.
- **SVGs** — site logos (`Prosperity-Partners-Logo-RGB-header.svg`,
  `logo-Bird-post.svg`), the services-grid arrow icon (`arrow20.svg`).
- **Location office photos** — banner images per `/location/<slug>/` page
  (e.g. `chicago-01.jpg`).

## How to resolve

Full list of all 823 paths, each mapped to the page(s) that reference it, is in
`data/media-manifest.json`. Options to fill the gap:
1. Obtain the original WordPress export (see README §1 "Restoring www/") — it has
   the real files under `wp-content/uploads/`.
2. Re-crawl the live site (`https://www.prosperityllc.com`) and download each
   referenced path directly.

Until one of these happens, Phase F (media processing: resize, re-encode to
WebP/JPEG, `<picture>` fallback per README §8) cannot proceed for anything beyond
the homepage, and any Eleventy templates built in Phase B/C should reference these
paths as-is (relative, `/wp-content/uploads/...`) so they resolve automatically
once the files land in the right place — don't hardcode a different path scheme.
