# Prosperity Partners — WordPress → static site migration

Migrating `prosperityllc.com` (WordPress, 4.5 GB export) to a static, buildable site
with no PHP, no MySQL, and no server to patch.

**Status:** Eleventy scaffold in place — homepage, generic content-block pages, personnel/location/post templates all rendering from real content. Styling on the newly scaffolded pages is inconsistent (see §8) and media is largely broken (see §9.1) — this is scaffolding, not a finished site.
**Last updated:** 2026-09-16

---

## 1. Folder layout

```
prosperity-llc-site/
├── README.md          ← this file
├── .gitignore
├── www/               ← WordPress export, REDUCED to 68 MB — NOT IN GIT, see below
│   ├── y7c9a5a_db142477_ndh.sql   67 MB phpMyAdmin dump, all content lives here
│   └── wp-content/themes/ndhcpawp/  active theme (design reference)
│       (wp-content/uploads/ was deleted once every referenced file had been
│        recovered into site/assets/ and committed — see §4)
├── data/              ← site-wide (not per-record) data + media-recovery bookkeeping
│   ├── global.json      footer locations/disclaimer/copyright, site name/tagline — the one
│   │                     "singleton" data file; consumed via site/_data/global.js
│   ├── media-manifest.json   every /wp-content/uploads/ path referenced anywhere
│   ├── media-map.json        recovered asset -> original upload it came from
│   ├── attachment-ids.json   cached _wp_attached_file lookup (derived; rebuildable)
│   ├── sourced-media/        4 files downloaded from the live site — not in the export
│   ├── team-pinned.json      leadership pinned to the top of /meet-the-team/
│   └── missing-media.md      how the media gap was closed — see §9.1
├── site/              ← the new static site (the deliverable), an Eleventy source dir
│   ├── index.njk        homepage (stays at the root — relies on Eleventy's implicit path→URL convention)
│   ├── pages/            everything else with an explicit permalink (page, personnel, location, post, culture, whats-new, meet-the-team)
│   ├── content/          ← one Markdown+JSON-frontmatter file per content record — see §6a
│   │   ├── personnel/<slug>.md     198 files — Decap-CMS-ready
│   │   ├── posts/<slug>.md         104 files — Decap-CMS-ready
│   │   ├── locations/<slug>.md      11 files — Decap-CMS-ready
│   │   └── pages/<file-stem>.md     43 files — NOT Decap-ready (see §6a), developer-edited for now
│   ├── _includes/       shared layout + components (base, header, footer, content-blocks, cta, contact-form)
│   ├── _data/           global.js only — everything else is now an Eleventy collection, see §6a
│   └── assets/
│       ├── css/ js/ icons/       stylesheet, scripts, favicons
│       ├── video/ docs/          hero + recovered video, the one linked PDF
│       └── img/
│           ├── uploads/<type>/<slug>[-<n>].<ext>   per-record media (§6a)
│           ├── people/ services/ books/ awards/    referenced from page body HTML
│           ├── payment/ diagrams/ photos/ ui/      (was /wp-content/uploads/, see data/missing-media.md)
│           ├── values/ posts/                      homepage art
│           └── logo.svg, logo-white.svg, linkedin.png
├── tools/
│   ├── wpdump.py       ← streaming SQL-dump parser (see §14) — PRIMARY extraction path when www/ is present
│   ├── recover-media.py ← re-encodes referenced uploads from www/ into site/assets/ — see data/missing-media.md
│   └── extract.py      ← fallback extraction from a live-site crawl, for machines without www/ — see §9.1;
│                          one-shot bulk import, not the ongoing content-editing path (that's Decap, once wired)
├── eleventy.config.js  ← Eleventy config: passthrough copy, date filters, injectContactForm, collections
├── package.json        ← npm start (dev server), npm run build
└── .claude/launch.json  preview server config (npm start, port 8080)
```

`www/` is the source of truth for content and a reference for design. It is never
deployed and never modified. `tools/wpdump.py` + `www/` is the primary, authoritative
extraction path — use it whenever `www/` is available on your machine. `tools/extract.py`
is a fallback for machines that only have a crawl of the live site (no SQL export);
it cannot see draft/private content or raw ACF field data, only what the live site
renders publicly. Both are meant to run once to populate `site/content/*.md` — ongoing
content edits after that go through Decap CMS (once wired, §9 Phase I) or by hand, not
by re-running the extractor over already-edited files.

### ⚠️ Restoring `www/`

**`www/` is gitignored** — read-only source material that doesn't belong in version
control. A fresh clone will not have it.

Check whether you have it:

```bash
ls www/y7c9a5a_db142477_ndh.sql && du -sh www/
# expect: ~67 MB dump, ~68 MB total (uploads removed — see §4)
```

If that fails, obtain the original WordPress export (from the client, the hosting
backup, or whoever ran the migration) and unpack it so the paths above resolve. A
restored *full* export is 4.5 GB and works fine — it's a superset; prune it again
only if you want the disk back. It must contain at minimum:

| Path | Needed for |
|---|---|
| `www/y7c9a5a_db142477_ndh.sql` | **All content.** Every extraction script reads this |
| `www/wp-content/themes/ndhcpawp/` | Design reference — exact colours, spacing, template logic |
| `www/wp-content/uploads/` | Only if media must be re-encoded from originals again — every *referenced* file is already recovered and committed under `site/assets/` |

Verify a restored export parses correctly:

```bash
cd www && python3 -c "
import sys; sys.path.insert(0,'../tools')
from wpdump import iter_rows
from collections import Counter
c=Counter()
for t,cols,v in iter_rows('y7c9a5a_db142477_ndh.sql', tables={'ynrh_posts'}):
    r=dict(zip(cols,v))
    if r['post_status']=='publish': c[r['post_type']]+=1
print(dict(c))
"
# expect: personnel 200, post 104, page 45, portfolio 18, location 11
```

**Without `www/` you can still** run the preview server, edit `site/`, and do any
CSS/markup work. **You cannot** extract content via `wpdump.py` (fall back to
`tools/extract.py` against a live-site crawl instead, see §9.1), check a design
detail against the original theme, or process media — i.e. most of §9.

---

## 2. Quick start

```bash
npm install    # once, or whenever package.json changes
npm start      # Eleventy dev server with live reload
```

Then open `http://localhost:8080`. In Claude Code the `site` launch config does the
same thing via the Browser pane. `npm run build` produces a static `_site/` (gitignored)
for deploy.

To query site content without standing up MySQL (there is no `mysql` binary on this
machine — don't try to import the dump):

```bash
cd www
python3 -c "
import sys; sys.path.insert(0,'../tools')
from wpdump import iter_rows
for t,c,v in iter_rows('y7c9a5a_db142477_ndh.sql', tables={'ynrh_posts'}):
    r=dict(zip(c,v))
    if r['post_type']=='page' and r['post_status']=='publish':
        print(r['ID'], r['post_name'], r['post_title'])
"
```

---

## 3. Stack decisions

| Layer | Choice |
|---|---|
| Generator | **Eleventy, full-site** |
| Hosting | Cloudflare Pages (git integration, atomic deploys, PR previews) |
| CMS | Decap CMS at `/admin`, GitHub OAuth via a Cloudflare Worker |
| Forms | Cloudflare Pages Function → Turnstile verify → SMTP relay (Resend) |
| Search | Pagefind (replaces Relevanssi) |
| Edge | Cloudflare CDN/WAF; Pro plan ($25/mo) |

### Eleventy over Astro

Astro genuinely wins on two points here — content collections with schema
validation (real value across 200 personnel records) and a more ergonomic image
component. It loses on the project's own stated constraint of "boring and proven":
Eleventy is 2018-era with no client runtime by design; Astro shipped v1→v5 in about
three years, and Next.js was already rejected partly for framework churn. The one
thing Astro islands would buy — the team directory filter — is ~100 lines of vanilla
JS over server-rendered cards, which is what the existing theme already does.

`eleventy-img` covers the image pipeline. The lost schema validation should be
replaced with ~30 lines of validation in the `_data` layer that throws on a bad
facet value.

### Full-site, not "Eleventy only for /blog/"

The original migration plan scoped the build to `/blog/` and had static pages
hand-authored with no build step. That doesn't survive the actual URL count:

| Type | Count | Bucket in original plan |
|---|---|---|
| `page` | 45 | hand-authored |
| `post` | 104 | `/blog/`, Eleventy |
| **`personnel`** | **200** | **none** |
| ~~`portfolio`~~ | ~~18~~ | theme demo content, excluded — see §5 |
| `location` | 11 | none |
| **Total** | **360** | |

229 of 378 URLs are data-driven detail pages — one record each, one template.
Nobody hand-authors 200 staff bios. The original plan documented full-site Eleventy
as its own fallback ("if duplicated header/footer across many static files becomes
error-prone"); that condition was already met at signing time.

### Other deviations from the original plan

1. **Pages are not Markdown.** The plan said "strip theme HTML → clean Markdown".
   Page content carries layout semantics (`content_block_columns`) that Markdown
   cannot express — flatten it and every multi-column layout is lost. Pages need
   structured frontmatter with a block array. Markdown is correct for the 104 posts
   and 200 personnel bios.
2. **Decap must cover `personnel`, not just posts.** At a 200-person firm, staff
   churn is the highest-frequency content change on the site. If editors can't add a
   person without a developer, the CMS solved the wrong problem.
3. **9 forms, not 1.** See §10 — this turned out cheap, but the plan assumed a
   single contact form.

---

## 4. The source export

**The export has been reduced to only what the project still needs: 4.40 GB → 68 MB**,
in two passes — pruned to 1.29 GB during extraction, then cut to 68 MB once the
media recovery finished.

What remains:

| Item | Size | Why kept |
|---|---|---|
| `y7c9a5a_db142477_ndh.sql` | 67 MB | All content; parse with `tools/wpdump.py`. Still the only source for §11's open decisions |
| `wp-content/themes/ndhcpawp` | 1.1 MB / 48 PHP files | Design reference; §9.2's styling QA and the Phase D templates both need it |
| `.htaccess`, `nginx.conf` | 50 KB | Server-config reference |

`wp-content/uploads` (1.2 GB) was deleted **after** all 821 referenced assets were
recovered, re-encoded into `site/assets/`, verified (0 broken of 2,822 references
in the built site) and committed to git. It is no longer the only copy of
anything the site serves. Restore the full export only if media must be
re-encoded from originals — see §1.

What was deleted (3.11 GB), and why it was safe:

| Removed | Size |
|---|---|
| Unreferenced uploads + all WP-generated thumbnails (23,523 files) | 2.81 GB |
| `wp-content/plugins` (26 plugins) | 242 MB |
| `uploads/ithemes-security` (security logs) | 119 MB |
| `wp-includes`, `wp-admin`, WP core root PHP | 98 MB |
| Unused themes `infinite`, `twentytwentyfive` | 61 MB |
| `wp-content/wordfence`, `maintenance`, cache configs | 19 MB |
| `wp-config.php` | — deleted on security grounds: live DB credentials and auth salts |

Thumbnails are derived files and are never used — media is always re-encoded from
originals (see §8). Three plugins still need *functional* replacements, but their
code is not needed to build them: Gravity Forms → §10, Relevanssi → Pagefind,
Redirection → `_redirects`.

**`tools/uploads-manifest.txt`** lists the 1,227 kept paths. It is the record of
what survived; regenerate it with the reference scan if the export is ever
restored in full (see below).

Site identity: `https://www.prosperityllc.com`, "Prosperity Partners", tagline
"Accounting, Tax, & Sage Intacct Solutions". Permalinks `/%postname%/`.
DB table prefix `ynrh_`. MariaDB 11.4.3 dump from phpMyAdmin 5.2.3.

Legal entities (appear in the footer disclaimer, keep verbatim): NDH Advisors LLC
dba Prosperity Partners; NDH CPA LLP dba Prosperity Partners CPA.

---

## 5. Content inventory

**378 public URLs.** Total content HTML across the entire site: **542 KB.**

| Type | Published | Body HTML | Notes |
|---|---|---|---|
| `page` | 45 (+9 draft, +2 private) | 104 KB in 96 ACF blocks | See §6 |
| `post` | 104 | 62 KB (avg 612 chars) | Categories: Culture (id 1), What's New (id 85) |
| `personnel` | 200 | 362 KB (avg 1,854 chars) | 3 facet fields each |
| ~~`portfolio`~~ | ~~18~~ | — | **Theme demo content — not migrated, see below** |
| `location` | 11 | 5 KB | |
| `attachment` | 1,659 | — | 1,047 jpg · 520 png · 66 pdf · 10 svg · 7 mp4 · 6 xlsx |

**`portfolio` is not real content.** All 18 records share one identical 492-byte
placeholder body, are dated May 2016 (theme install), and are titled after layout
styles (`Full Image Style`, `Video With Vertical Info`, `Project Half Box Style`).
They appear nowhere in the 380-page crawl and `/portfolio/` and
`/portfolio/<slug>/` both return **404** on the live site — the post type was
never publicly routed. They are excluded from the migration, which drops the real
URL count from 378 to **360**.

**Page templates** — 38 of 47 pages share one generic renderer:

| Template | Pages |
|---|---|
| `default` (generic content blocks) | 38 |
| `pages/services.php` | 4 |
| `pages/sage.php` | 2 |
| `pages/team.php` | 1 |
| `pages/home.php` | 1 ✅ done |
| `pages/portal.php` | 1 |

**Menus:** Main (21 items, 2 levels deep), Mobile (22), Footer (8), Social (1),
Sage (0, unused).

**Taxonomies in use:** `category` (2), `post_tag` (18), `portfolio_tag` (23),
`portfolio_category` (4), `personnel_category` (4). The rest are plugin noise.

---

## 6. Data model

### Pages — ACF flexible content

Page `post_content` is empty (71 characters across all 45 pages). Everything is in
`postmeta` as an ACF flexible-content repeater:

```
content_blocks                              = <count>
content_blocks_<i>_block_name               admin label only — NOT a block type
content_blocks_<i>_content_block_columns    the actual layout discriminator
content_blocks_<i>_content_block_content1..5  raw WYSIWYG HTML
content_blocks_<i>_content_block_id         anchor id
content_blocks_<i>_content_block_class      extra CSS classes
```

`block_name` looks like 40 distinct block types ("Why partner boxes row 1") but it's
a human label in the admin. **There is one block type.** The real variation is
`content_block_columns`, 96 blocks total:

| Layout | Count | Renders as |
|---|---|---|
| `one` | 104 | single column of `content1` |
| `two` | 34 | `content1` / `content2` |
| `sidebar` | 26 | main + sidebar (`content_block_sidebar_title`) |
| `carousel` | 10 | slick carousel, sub-repeater `content_block_carousel_*` |
| `three` | 7 | content1–3 |
| `tiles` | 6 | sub-repeater `content_block_tiles_<n>_content_block_tile_{type,page,category}` |
| `five` | 6 | content1–5 |
| `twoimage` | 5 | `content_block_image` + `content_block_image_side` |
| `four` | 4 | content1–4 |

(Counts exceed 96 because column values repeat across block indexes.)

Carousel config lives in `content_block_carousel_{autoplay,infinite,adaptiveHeight,slides_show,slides_scroll}`.
Team blocks use `content_block_team_members_<n>_content_block_team_member` (a post ID).

Page-level meta: `page_banner_{image,title,description}`, `remove_cta`,
`service_page_excerpt`, `page_background_graphic`.

### Personnel

201 records each carry: `personnel_title`, `personnel_first_name`,
`personnel_last_name`, `personnel_certifications`, `personnel_specializations`,
`personnel_location` (11 distinct offices). ACF field keys needed to resolve the
select-option labels: title = `field_6679cee8fa574`, specializations =
`field_6695315a92f52`.

The team directory filters on title / specialization / location via CSS classes on
each card plus `data-term` attributes. See `www/wp-content/themes/ndhcpawp/pages/team/filters.php`
and the team-filter block in `assets/js/g.min.js`.

### Global options (ACF options page, `ynrh_options` rows prefixed `options_`)

`site_logo_white`, `site_logo_black` (both SVG), `footer_copyright`,
`footer_disclaimer`, `cta_content`, `cta_form` (= Gravity Form id 3),
`page_banner_graphic`, `footer_locations` (10 office entries).

### Footer widgets

| Slot | Contents |
|---|---|
| `footer-widgets-1` | text: phone/fax/email · custom_html: **accessiBe** third-party script |
| `footer-widgets-2` | nav menu "Site Menu" |
| `footer-widgets-3` | recent posts (4) |
| `footer-widgets-4` | nav menu "Follow Us" (LinkedIn only) |

---

## 6a. Content model on the new site — `site/content/`

The above describes the *original WordPress* data model — kept for reference since
it explains where each field came from. The new site does not mirror that structure
directly; content lives as one Markdown file per record under
`site/content/<type>/<slug>.md`, each with JSON frontmatter (`---json` delimiter,
parsed by gray-matter — already a transitive Eleventy dependency, no new package)
plus a body (rendered HTML, used for the record's main prose):

| Folder | Files | Frontmatter fields | Body |
|---|---|---|---|
| `personnel/` | 198 | `slug`, `name`, `certifications`, `job_title`, `location_name`, `location_url`, `photo`, `linkedin_url`, `facet_title`, `facet_specializations`, `date_modified` | bio HTML |
| `posts/` | 104 | `slug`, `title`, `published`, `date_modified`, `category_name`, `category_url`, `images[]` | post HTML |
| `locations/` | 11 | `slug`, `name`, `address_html`, `date_modified` | description HTML |
| `pages/` | 43 | `slug`, `path`, `page_type`, `title`, `meta_description`, `banner_title`, `banner_description_html`, `banner_image`, `date_modified`, `blocks[]` | *(empty — everything lives in `blocks[]`)* |

Each folder has a `<type>.11tydata.js` directory-data file (`tags`, `permalink: false`,
`templateEngineOverride: false`) so Eleventy auto-populates `collections.personnel`,
`collections.posts`, `collections.locations`, `collections.pages` — no manual data
loading. A few derived collections (`culturePosts`, `whatsNewPosts`, `recentPosts`,
`genericPages` — filtered/sorted views over the base collections) are defined in
`eleventy.config.js`. Templates access frontmatter via `.data.<field>` and body HTML
via `.content` (both standard Eleventy collection-item properties).

`date_modified` comes from Yoast's `article:modified_time` meta tag where present,
falling back to the JSON-LD block's `dateModified` or `datePublished` (covers 356 of
380 crawled pages — the rest have no date signal anywhere in the crawl). Not
currently rendered anywhere, but available for a future "last updated" UI or a
staleness-flagging script once editors are making ongoing changes through Decap.

**Personnel, posts, and locations are Decap-CMS-ready as-is** — a `folder` collection
per type, `format: json`, standard widgets (string/text/image/markdown) map cleanly
onto their flat frontmatter. **Pages are not.** A page's `blocks[]` is an array of
arbitrary per-layout HTML (see §6's `content_block_columns` discussion) — none of
Decap's standard widgets can edit that structure; only its raw object/code widget
could, which isn't a real editorial experience. Pages stay developer-edited until a
custom Decap widget for content-block editing exists — that's separate, larger scope
(§9 Phase I), not something solved by moving pages into individual files.

Images are remapped from WordPress's flat, date-bucketed
`wp-content/uploads/YYYY/MM/name.ext` scheme to
`site/assets/img/uploads/<type>/<slug>[-<n>].<ext>` — grouped by the record that owns
them (multi-image posts get `-1`, `-2`, etc., in original order). This is where real
media lands once sourced (§9.1); re-encoding to WebP (§8) just adds a sibling file at
the same basename, no further remapping needed.

`tools/extract.py` produces this structure from a live-site crawl (fallback path,
§9.1); `tools/wpdump.py` + `www/` remains the primary path when available, though it
does not yet itself write `site/content/*.md` — see §14. Either way, extraction is a
one-shot bulk import; it is not meant to be re-run against already-edited content —
ongoing edits go through Decap (once wired) or by hand.

---

## 7. Design system

Extracted from the theme's compiled CSS — these are exact values, not eyeballed.

```css
--blue:       #02518a   /* primary; also the mobile drawer background */
--blue-dark:  #023c70
--blue-deep:  #143b62   /* values section */
--sky:        #22a8de   /* hover / accent */
--green:      #4aad52   /* "What's New!" flag */
--orange:     #ff5d05
--grey-text:  #6d6e70   /* nav links */
--grey-light: #f1f1f1
```

Font: **Urbanist** (Google Fonts), weights 200/400/700. Headings 700; large display
text uses 200.

Container `max-width: 80em`, 4% side padding below 1320px.
Nav breakpoint **1080px** (desktop bar ↔ drawer). Other breakpoints: 1600, 1320,
1152, 1024, 960, 900, 840, 768, 640, 560, 480.

Card shadow: `0 12px 32px rgba(2,81,138,.2), 0 3px 6px rgba(2,81,138,.1)`.

---

## 8. What's built

`site/` is now an Eleventy source directory (Nunjucks templates + `_includes` +
`_data` + `content`), not static HTML. Content comes from `site/content/*/*.md`
(§6a), produced by either `tools/wpdump.py` (primary, needs `www/`) or
`tools/extract.py` (fallback, needs only a live-site crawl — see §9.1). Site-wide
data (footer locations, disclaimer, copyright) comes from `data/global.json` via
`site/_data/global.js` — the one "singleton" data file left; everything else is a
native Eleventy collection.

| File/dir | Contents |
|---|---|
| `site/_includes/base.njk` | Shared `<head>`, doctype, header/footer wrapper |
| `site/_includes/header.njk`, `footer.njk` | Nav, footer columns/locations/disclaimer/copyright — all pulled from `global` data, not hardcoded (dynamic year too) |
| `site/_includes/content-blocks.njk` | Generic ACF-layout renderer — walks a page's `blocks[]` and renders each by `layout` (`one`/`two`/`sidebar`/`tiles`/`carousel`/etc., see §6) |
| `site/_includes/cta.njk`, `contact-form.njk` | Shared CTA section + the contact-form component itself, parameterized by `formVariant` (`standard` 5-field vs `contact` — adds the referral-source radio, see §10) |
| `site/index.njk` | Homepage — hero, intro, values, achievements, Culture/What's New (hand-picked, pre-optimized images under `assets/img/posts/` — see §9.1 for why this isn't data-driven), CTA |
| `site/pages/page.njk` | Generic + services + portal pages, paginated over `collections.genericPages` |
| `site/pages/personnel.njk`, `location.njk`, `post.njk` | One page per personnel/location/post record, paginated over `collections.personnel`/`locations`/`posts` |
| `site/pages/culture.njk`, `whats-new.njk`, `meet-the-team.njk` | Archive/directory listing pages, over `collections.culturePosts`/`whatsNewPosts`/`personnel` |
| `eleventy.config.js` | Passthrough copy, `longDate`/`isoDate` filters, `injectContactForm` (swaps a Gravity-Forms-widget marker for the real component), the derived collections listed in §6a |
| `assets/css/style.css` | Palette + homepage styles (original, verified) plus a second pass added for page-banner/content-block/personnel/location/team-grid — **not yet verified, see §9.2** |
| `assets/js/main.js` | Drawer nav, submenu accordions, search toggle, scroll-reveal, video autoplay fallback, contact-form "Other" field toggle |
| `assets/icons/` | Favicons/manifest/browserconfig — source tidied into one folder, passthrough-copied back to the served root so no URL changed |

Media processing applied to the homepage's hand-picked images only (repeat for
everything else once real media is sourced, see §9.1):
- Hero video 19 MB → **7.9 MB** (`ffmpeg`, audio track dropped — it plays muted, 1280×720, CRF 27, `+faststart`)
- Post thumbnails resized to 800px, WebP + JPEG fallback via `<picture>`
- Value icons 512px → 288px PNG
- Logos copied as-is (SVG, 8 KB)

### Stubs left in place

- Contact form posts to `/api/contact`; Turnstile div has `data-sitekey="TURNSTILE_SITE_KEY"`
- Search submits to `/search/?q=` — wire to Pagefind (package added to `package.json`, build step + UI not yet wired)
- Page permalinks are `/<slug>/` at root, matching the live site's actual permalinks (confirmed via crawl). Post permalinks are `/culture/<slug>/` / `/whats-new/<slug>/` — moved off the flat root to sit under their existing category pages; still needs the 104 redirect rules from the old flat URLs (§9 Phase H, open decision §11.9)
- accessiBe widget omitted pending a decision

---

## 9. Remaining work

Estimates are Claude token budgets, based on the homepage actually costing ~130k
including the plan review.

| # | Phase | Status | Tokens | Unlocks |
|---|---|---|---|---|
| A | Extraction pipeline: all types → data files; media reference-scan + re-encode | ✅ content extracted; ⚠️ media re-encode blocked, see §9.1 | 60–90k | all 378 URLs' content |
| B | Eleventy scaffold; port `site/` chrome into Nunjucks layouts/includes | ✅ done | 50–70k | shared header/footer |
| C | Generic content-block renderer (9 column layouts) | ✅ done, ⚠️ styling unverified, see §9.2 | 80–120k | **38 pages at once** |
| D | 4 bespoke templates: services, sage, team (+3-facet filter), portal | partial — services/portal render via the generic renderer; sage and the 3-facet team filter still outstanding | 120–160k | 8 pages + team directory |
| E | 4 content-type templates + archives, pagination, RSS, 404, search page | partial — personnel/location/post templates + Culture/What's New archives done; RSS, 404, search page outstanding | 120–160k | 333 URLs |
| F | Visual QA pass + spot fixes (~60 URLs actually worth eyeballing) | outstanding | 100–200k | |
| G | Forms: 1 component + 1 Worker (see §10) | component done (2 variants, standard + contact); Worker outstanding | 50–70k | all 9 forms |
| H | Pagefind + 65 redirects + sitemap | outstanding | 40–60k | SEO continuity |
| I | Decap CMS + OAuth Worker + Cloudflare Pages setup | content model ready for personnel/posts/locations (§6a); pages need a custom block-editing widget first; Decap config/OAuth Worker itself outstanding | 80–120k | editors + deploy |
| | **Total** | | **700k – 1.05M** | ≈ 6–10 sessions |

Dependencies: A → B → C → {D, E} → F. G, H, I are independent and can run anytime
after B.

**Calendar time is not set by the token budget.** Realistically 2–4 weeks, gated by:
human content sign-off across 378 URLs; Resend domain verification (DNS
propagation); the missing-media recovery in §9.1; and the open decisions in §11.

### 9.1 Missing media — blocks the rest of Phase A

**823 of 823** `/wp-content/uploads/...` paths referenced across the extracted
content (personnel photos, event photos, award/press logos, a couple of PDFs,
office banner images — full breakdown and per-page reference list in
`data/missing-media.md` / `data/media-manifest.json`) resolve to nothing when
`tools/extract.py`'s fallback path was used, because that path only had a
live-site *crawl* (HTML only, no binary assets) to work from, not the actual
`www/wp-content/uploads/` files.

**If you have `www/` on your machine**, this isn't a real gap — re-run extraction
with `tools/wpdump.py` against the SQL dump and the real files are right there
under `www/wp-content/uploads/`, ready for the same re-encode pipeline already
proven on the homepage (§8). This is a per-machine availability problem, not a
missing-forever asset problem.

**If you don't have `www/`**, options are: (1) get it from the client/hosting
backup/whoever ran the migration (§1), or (2) re-crawl the live site for the
binary files at the same paths (the crawl only captured rendered HTML+text, not
images). Either way, until the real files land, every non-homepage `<img>` tag
sourced from `site/content/*/*.md` will 404.

The homepage is unaffected — its images are hand-picked, already re-encoded,
and committed under `site/assets/img/`, independent of this gap.

### 9.2 Styling gaps on newly scaffolded pages — needs a full pass

The CSS added for personnel/location/team-grid/content-block/services/portal
pages (`site/assets/css/style.css`, added on top of the original
homepage-only stylesheet) was reconstructed from inline `<style>` fragments
captured per-page in the live-site crawl, not from a single authoritative
stylesheet. Coverage is uneven: some pages look right, some are close but off
on spacing/color, and some layouts (bespoke ones especially, see Phase D above)
haven't been checked against the live site at all. **Treat everything under
`site/pages/page.njk`, `personnel.njk`, `location.njk`, `culture.njk`, `whats-new.njk`,
and `meet-the-team.njk` as scaffolding, not verified output** — a page-by-page
visual QA pass (Phase F) against the live site is still required before any of
this ships.

---

## 10. Forms — audited, simpler than expected

9 forms, 3,782 stored entries (historical — export to CSV for the archive, they do
not migrate).

| id | Active | Fields | Title |
|---|---|---|---|
| 1 | ✅ | 7 (1 conditional) | Contact Form |
| 2 | ❌ | 5 | Accounting Tech Contact Form |
| 3 | ✅ | 5 | CTA Form ← the site-wide CTA |
| 4–9 | ✅ | 5 each | CTA Partnerships, Controllership Services, Fractional CFO, Accounting Discovery, Family Office Services, Accounting & Bookkeeping Services |

**No page breaks anywhere. One conditional rule in total.** Forms 3–9 are the
identical 5-field shape: name, email, phone, textarea, captcha. Form 1 adds a radio
and a text field.

So this is **one form component parameterised by form id + recipient**, plus one
Cloudflare Pages Function. Not nine integrations. Form 2 is inactive — drop it.

Captcha fields become Cloudflare Turnstile. The Worker verifies the Turnstile token,
then relays over **SMTP** (not a vendor REST API) so the provider is swappable by
changing credentials.

---

## 11. Open decisions — needs client input

1. **9 draft pages.** Seven form a coherent unpublished Valuation Services line:
   `/valuation-services/`, `/financial-reporting/`,
   `/income-estate-and-gift-valuations/`, `/intellectual-property-valuation/`,
   `/marital-dispute-valuations/`, `/mergers-and-acquisitions-valuations/`,
   `/shareholder-dispute-valuations/`. Ship, or drop?
   ⚠️ **`/valuation-services/` is linked from the Mobile Menu but the page is a
   draft — it's a broken link on the live site today.**
2. **Page 6449 "Payment (old page backup)"** has slug `/` — it would collide with
   the site root. Almost certainly delete.
3. **2 private pages.** `/accounting-technology/` ("Accounting Software - Sage
   Intacct", 6 blocks, 3.1 KB, uses `sage.php`) is substantial but private.
   Publish or drop? `/accounting-technologyold/` is presumably dead.
4. **accessiBe** — third-party accessibility overlay in footer widget 1. Keep the
   vendor, or drop it?
5. **Greenhouse careers embed** (`boards.greenhouse.io/embed/job_board/js?for=ndhcpa`)
   on the Careers page — note it still uses the old `ndhcpa` board slug.
6. **Redirect conflicts.** `/client-portal/` is both a published page (id 5400) and
   a redirect source. There are also multi-hop chains
   (`/client-portal-login/` → `/client-portal/` → `/client-portal-login/client-portal/`
   → `/client-portal-login/uploading-files-to-your-client-portal/`). Cloudflare
   `_redirects` resolves one hop — these must be **flattened to their final
   destination**, and the page-vs-redirect conflict resolved.
7. **Front page slug.** The homepage is `/homepage-main/` in WordPress. It must
   serve at `/`, and `/homepage-main/` should 301 → `/`. The Footer menu currently
   links "Home" → `/homepage-main/`.
8. **Stale footer data.** An old text widget references a **Philadelphia** office
   that no longer appears in `footer_locations`. Confirm it's closed.
9. ~~**Post URL structure.**~~ **Decided:** posts moved from flat `/<slug>/` to
   `/culture/<slug>/` and `/whats-new/<slug>/` — organizes 104 posts under their
   existing category landing pages (`/culture/`, `/whats-new/` already exist, no
   404 risk) without inventing a third `/blog/` concept the nav/menus don't have.
   Still needs 104 redirect rules from the old flat URLs (`_redirects`, §9 Phase H)
   since those were the live site's actual URLs — see the "Post/page permalinks"
   line in §8's stub list.

---

## 12. Gotchas — read before continuing

**Verify UI with real clicks, not scripted ones.** A scripted `element.click()`
does not move focus; a real tap does. The mobile submenu bug in §13 passed a
scripted test and failed for actual users.

**Don't let desktop hover rules reach the mobile drawer.** `:focus-within` rules
carry higher specificity than a `.is-open` state class and will silently win. All
desktop nav interaction is now behind `@media (min-width: 1081px)`.

**CSS Grid track sizing, when a child spans all columns:**
- An `fr` track takes free space *before* an intrinsic track can grow into it —
  a `minmax(0, max-content)` label track collapses to its longest word.
- `justify-content: start` shrinks tracks to content, so a `grid-column: 1/-1`
  child inherits that narrow width rather than the container's.
- A content-sized track plus a spanning child is circular: the child's width feeds
  back into the track, so sibling rows resolve differently.
- Conclusion used in the nav: `grid-template-columns: 1fr auto`.

**`www/` is gitignored and won't exist in a fresh clone.** Before starting any
content or media work, confirm it's present — see "Restoring `www/`" in §1. Don't
reconstruct content from the live site if the export is merely missing locally.

**No MySQL on this machine.** Don't try to import the dump — use `tools/wpdump.py`.

**`sips` and `cwebp` and `ffmpeg` are available; ImageMagick and PIL are not.**

**Uploads contain 15–20 MB camera JPEGs.** Always re-encode; never copy originals
into `site/`.

**When reference-scanning uploads, two things produce false "referenced" hits** —
both cost ~600 MB–2 GB of needlessly kept files if you miss them:
- A post's `guid` column holds an attachment's *own* URL. Scanning it marks every
  attachment as referenced by itself.
- Serialised PHP is full of string-length prefixes (`s:150:"…"`). A loose
  "any 2–6 digit number is an attachment ID" scan collides with them constantly.
  Extract IDs only from bare-integer meta values and from `s:N:"digits"` inside
  serialised arrays.

---

## 13. Fixed so far

| Bug | Cause |
|---|---|
| Hero text off-centre | Reveal animation's `transform: none` cancelled the centring `translate(-50%,-50%)`; switched to flex centring |
| Hero text invisible on load | Depended on an IntersectionObserver callback; above-the-fold elements now reveal synchronously, plus a `pageshow` pass for bfcache restores |
| Contact form first/last name misaligned | `.field + .field` margin leaked into the side-by-side row; scoped to direct children of the form |
| Mobile Services/Company dropdowns wouldn't open, label vanished | `:focus-within` rules outranked `.is-open`, and painted the label `--blue` on a `--blue` drawer |
| Nav arrow tap target 24px | Now 44px, with negative margins so rows don't stretch |
| Nav arrows misaligned / wrapping | See Grid notes in §12 |

---

## 14. Tooling — `tools/wpdump.py`

Streaming parser for the phpMyAdmin dump. Handles multi-row extended INSERTs and
MySQL string escaping without loading 70 MB into memory.

```python
from wpdump import iter_rows

# yields (table_name, [column names], [values])
for table, cols, vals in iter_rows(path, tables={"ynrh_posts", "ynrh_postmeta"}):
    row = dict(zip(cols, vals))
```

Pass `tables=` to skip everything else — it makes a full pass in seconds rather
than minutes. Running it as a script prints post-type/status counts and attachment
mime types.

Note that ACF option values and widget settings are PHP-serialised strings; the
parser returns them raw. `footer_locations`-style repeaters are flat numbered meta
keys (`options_footer_locations_0_footer_location`) and can be read without
unserialising. Widget blobs (`widget_text`, `widget_nav_menu`) do need a PHP
unserialiser or careful regex.
