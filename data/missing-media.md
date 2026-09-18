# Missing media

Everything the built site references now resolves: a link-check over a full
`_site/` build finds **0 missing assets out of 2,226 references**, and the same
check over `site/content/` finds none either — including the draft and private
pages that do not build.

The only *media* gap left is video. One content gap surfaced alongside it —
two post records, below.

## Two post records the import dropped

The homepage used to hardcode six post cards. Two pointed at URLs with no record
behind them, which is where the site's only two broken internal links came from:

| Missing record | Its imported art (still in the repo) |
|---|---|
| `/culture/santa-barbara-summer-outing-at-dodger-stadium/` | `assets/img/posts/santa-barbara-dodger-game.{jpg,webp}` |
| `/whats-new/proud-to-be-named-a-2026-best-place-to-work-in-chicago/` | `assets/img/posts/best-places-to-work-2026.{jpg,webp}` |

The images came across and the records did not, so this is the same silent-drop
pattern as the photo-less personnel records below. Both posts are still on
the live site; recovering them means adding two files under
`site/content/posts/`. Nothing links to them now — the homepage grids read the
newest three from each category instead of a hardcoded list — so this is a
content recovery task, not a broken page.

Five other pre-optimized homepage images (`fastest-growing-firms-2026`,
`chicago-summer-soiree`, `chicago-day-of-service`, `crains-notable-leader-2026`,
`lightyear-partnership`) belonged to records that *do* exist, and went unused
once the card grids switched to each record's own `images[0]`. They sat in
`site/assets/img/posts/`, which is a CMS-owned folder (README §6a), so an editor
wiring up Sveltia (README §6b) would have been offered them as post images. All but one were
deleted when the asset structure was cleaned for the CMS; recover them from git
history if a curated card grid ever comes back. The exception is
`fastest-growing-firms-2026.{jpg,webp}`, still used by the homepage featured
card and now at `site/assets/img/home/`.

## Video — needs a CDN base URL

Video is deliberately not versioned: `.gitignore` excludes `*.mp4`/`*.webm`, and
the three files (26 MB) were removed in "Serve video from the origin site; never
version video". That commit pointed the three references back at their URLs on
the old origin — legacy media paths, which have since been retired. With neither
a local file nor a URL left to point at, each `<video>` was removed and replaced
by a `TODO: VIDEO CDN URL NEEDED` comment in place.

| File to host | Placeholder sits in | Page shows now |
|---|---|---|
| `home.mp4` | `site/index.njk` — homepage hero | the poster frame, so the hero still looks right |
| `year-end-recap.mp4` | `site/content/posts/mid-year-recap.md` | nothing where the player was |
| `uploading-files-to-your-client-portal.mp4` | `site/content/pages/client-portal-uploading-files-to-your-client-portal.md` | nothing where the player was |

The originals are still served from the live site, so nothing is lost — host them
and paste the base URL into the three placeholders. Grep `VIDEO CDN URL NEEDED`.

## Closed: the 19 images that were outstanding

Fetched from the live origin and committed. Listed here because the pages they
belong to are not all built, so a link-check alone will not show them again.

| Asset | Where it landed | Used by |
|---|---|---|
| Team placeholder portrait | `/assets/img/ui/team-placeholder.svg` | the personnel records with no headshot — see below |
| Carousel prev/next arrow | `/assets/img/ui/arrow-grey.png` | `style.css`, visible on `/partnerships/` |
| 6 service icons | `/assets/img/pages/valuation-services-*.png` | `/valuation-services/` (draft) |
| 10 industry icons | `/assets/img/pages/accounting-technology-*.png` | `/accounting-technology/` (private) |
| Sage Intacct logo | `/assets/img/pages/accounting-technologyold-sage-intacct.png` | `/accounting-technologyold/` (private) |

**The team placeholder is a real fallback, not a stopgap.** Seven of the 200
personnel records carried no photo at import; five have since been given one,
leaving two — Vikesh Bansal and Richard Lemanski. The live site
renders a house graphic at the same 550x500 as a real headshot, and
`meet-the-team.njk`, `location.njk` and `personnel.njk` now do the same, so those
cards keep their shape instead of collapsing to an empty figure. Dropping a real
photo into a record's `photo` field replaces it with no other change.
