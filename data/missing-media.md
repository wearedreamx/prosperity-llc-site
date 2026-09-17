# Missing media

Everything the built site references now resolves: a link-check over a full
`_site/` build finds **0 missing assets out of 2,226 references**, and the same
check over `site/content/` finds none either — including the draft and private
pages that do not build.

The only gap left is video.

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
| Team placeholder portrait | `/assets/img/ui/team-placeholder.svg` | the 7 personnel records with no headshot — see below |
| Carousel prev/next arrow | `/assets/img/ui/arrow-grey.png` | `style.css`, visible on `/partnerships/` |
| 6 service icons | `/assets/img/uploads/pages/valuation-services-*.png` | `/valuation-services/` (draft) |
| 10 industry icons | `/assets/img/uploads/pages/accounting-technology-*.png` | `/accounting-technology/` (private) |
| Sage Intacct logo | `/assets/img/uploads/pages/accounting-technologyold-sage-intacct.png` | `/accounting-technologyold/` (private) |

**The team placeholder is a real fallback, not a stopgap.** Seven of the 200
personnel records carry no photo — Vikesh Bansal, Mazin El Harith, Richard
Lemanski, Brock Lock, Steve Mizrach, Blake Rath, Jonathan Yuen. The live site
renders a house graphic at the same 550x500 as a real headshot, and
`meet-the-team.njk`, `location.njk` and `personnel.njk` now do the same, so those
cards keep their shape instead of collapsing to an empty figure. Dropping a real
photo into a record's `photo` field replaces it with no other change.
