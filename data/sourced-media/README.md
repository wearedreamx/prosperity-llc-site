# Externally sourced media

Files here mirror the `wp-content/uploads/YYYY/MM/...` layout but are **not** part
of the WordPress export. They were downloaded from the live site
(`https://www.prosperityllc.com`) on 2026-09-16 because the pruned export
(README §4) no longer contains them under any name.

`www/` is read-only source material and is never modified (README §1), so these
live separately. `tools/recover-media.py` checks `www/wp-content/uploads/` first
and falls back to this directory, so the recovery run stays reproducible.

| File | Used by |
|---|---|
| `2024/11/Culture-2523735321.jpg` | `/company/` — Culture card |
| `2024/11/Whats-new-2447982425.jpg` | `/company/` — What's New card |
| `2025/08/firm-growth-forum-thumb.jpg` | `/culture/ceo-jeremy-shares-what-sets-us-apart/` |
| `2026/04/2026-Forbes-BIS-Top-CPAs-Award-Logo-Square-Dark-300PPI-01-scaled.png` | `/whats-new/jeremy-dubow-named-forbes-2026-best-in-state-top-cpa/` |
