# Prosperity Partners — static site

`prosperityllc.com`, rebuilt as a static Eleventy site: no CMS runtime, no
database, no server to patch. Content was imported once from the previous
CMS (§4) and now lives in this repo as files.

**Status:** All 360 URLs render from real content, and every published page and
template archetype has been compared against the live site — layout, chrome and
media are in parity, with the intentional differences listed in §9.2. All images
resolve (§9.1); the three videos still need a CDN (§9.3).

**Before this ships** it needs: the form Worker (§9 Phase G), the page-level
redirects and `sitemap.xml` (Phase H), Decap and the deploy (Phase I), a copy
read across 360 URLs, and the client decisions in §11.

**Last updated:** 2026-09-17

---

## 1. Folder layout

```
prosperity-llc-site/
├── README.md          ← this file
├── .gitignore
├── data/              ← site-wide (not per-record) data + media bookkeeping
│   ├── global.json      footer locations/disclaimer/copyright, site name/tagline — the one
│   │                     "singleton" data file; consumed via site/_data/global.js
│   ├── team-filters.json     options for the /meet-the-team/ 3-facet filter
│   ├── team-pinned.json      leadership pinned to the top of /meet-the-team/
│   └── missing-media.md      what is still to source (video only) — see §9.3
├── site/              ← the new static site (the deliverable), an Eleventy source dir
│   ├── index.njk        homepage (stays at the root — relies on Eleventy's implicit path→URL convention)
│   ├── pages/            everything else with an explicit permalink (page, personnel, location, post, culture, whats-new, meet-the-team, search)
│   ├── content/          ← one Markdown+JSON-frontmatter file per content record — see §6a
│   │   ├── personnel/<slug>.md     198 files — Decap-CMS-ready
│   │   ├── posts/<slug>.md         104 files — Decap-CMS-ready
│   │   ├── locations/<slug>.md      11 files — Decap-CMS-ready
│   │   └── pages/<file-stem>.md     43 files — NOT Decap-ready (see §6a), developer-edited for now
│   ├── _redirects       Cloudflare Pages redirects → copied to the deploy root
│   ├── _headers         Cloudflare Pages response headers (CSP etc.) → deploy root
│   ├── robots.txt       → deploy root
│   ├── _includes/       shared layout + components (base, header, footer, content-blocks,
│   │                     cta, contact-form, team-filters, post-card, team-card, post-archive)
│   ├── _data/           global.js only — everything else is now an Eleventy collection, see §6a
│   └── assets/
│       ├── css/ js/ icons/       stylesheet, scripts, favicons
│       ├── video/ docs/          hero + recovered video, the one linked PDF
│       └── img/
│           ├── uploads/<type>/<slug>[-<n>].<ext>   per-record media (§6a)
│           ├── people/ services/ books/ awards/    referenced from page body HTML
│           ├── payment/ diagrams/ photos/ ui/      (was flat, date-bucketed WP uploads)
│           ├── values/ posts/                      homepage art
│           └── logo.svg, logo-white.svg, linkedin.png
├── tools/             ← npm-script helpers only; nothing runs at build time (see §14)
│   ├── open-chrome-tab.js + .applescript  ← npm start's browser opener (see §2)
│   └── debug-eleventy.js  ← npm run debug's DEBUG= wrapper (see §2)
├── eleventy.config.js  ← Eleventy config: passthrough copy, date filters, injectContactForm, collections,
│                         and the eleventy.after hook that builds the Pagefind index (§15)
├── package.json        ← npm start (dev server), npm run build
└── .claude/launch.json  preview server config (npm start, port 8080)
```

Everything the site needs is in this repo. `npm start` works from a fresh clone —
there is no external content source to obtain, restore or point at.

### Provenance

The content in `site/content/` was imported once from the site's previous CMS:
all pages, posts, personnel and location records, plus the media they reference
(re-encoded into `site/assets/img/`). That import is finished and is not
re-runnable — the source system and its tooling have been removed, deliberately.
Ongoing edits go through Decap CMS (once wired, §9 Phase I) or by hand.

One consequence is worth knowing about: page bodies are blocks of HTML produced
by the old editor, so `site/content/pages/*.md` carries markup that is more
verbose than anything you would hand-write. Personnel, posts and locations are
clean.

## 2. Quick start

```bash
npm install    # once, or whenever package.json changes
npm start      # Eleventy dev server with live reload
```

Then open `http://localhost:8080`. In Claude Code the `site` launch config does the
same thing via the Browser pane. `npm run build` produces a static `_site/` (gitignored)
for deploy.

### npm scripts must stay shell-agnostic

`npm run` executes scripts through `cmd.exe` on Windows, so anything relying on
POSIX shell syntax fails there — and it fails at the *first* script, before
Eleventy ever runs. Every script is therefore plain `node`, with the shell-specific
parts moved into `tools/`:

| Was (bash-only) | Now | Why the old form broke on Windows |
|---|---|---|
| `rm -rf _site` | `node -e "require('fs').rmSync(...)"` | no `rm` in cmd.exe |
| `(sleep 1.5 && ./tools/open-chrome-tab.sh &) ; …` | `node tools/open-chrome-tab.js` | no `sleep`, no `&` backgrounding, no subshell, no `;` |
| `DEBUG=Eleventy* eleventy` | `node tools/debug-eleventy.js` | `VAR=value cmd` prefix is not cmd.exe syntax |

`tools/open-chrome-tab.js` re-execs itself detached so the browser opens ~1.5s
later without holding up the dev server, and picks the opener per platform
(`osascript` → the sibling `.applescript`, `start` on Windows, `xdg-open`
elsewhere). Only the macOS path focuses an existing tab instead of stacking
duplicates on each restart.

`tools/debug-eleventy.js` sets `DEBUG` in the child's environment (respecting an
existing value, so `DEBUG=Eleventy:TemplateData npm run debug` still narrows the
output). It invokes `node_modules/@11ty/eleventy/cmd.cjs` by path deliberately:
`@11ty/eleventy` exports neither `./cmd.cjs` nor `./package.json`, so both
`require` forms fail with `ERR_PACKAGE_PATH_NOT_EXPORTED`.

---

## 3. Stack decisions

| Layer | Choice |
|---|---|
| Generator | **Eleventy, full-site** |
| Hosting | Cloudflare Pages (git integration, atomic deploys, PR previews) |
| CMS | Decap CMS at `/admin`, GitHub OAuth via a Cloudflare Worker |
| Forms | Cloudflare Pages Function → Turnstile verify → SMTP relay (Resend) |
| Search | Pagefind — see §15 |
| Edge | Cloudflare CDN/WAF; Pro plan ($25/mo) |

### Eleventy over Astro

Astro genuinely wins on two points here — content collections with schema
validation (real value across 200 personnel records) and a more ergonomic image
component. It loses on the project's own stated constraint of "boring and proven":
Eleventy is 2018-era with no client runtime by design; Astro shipped v1→v5 in about
three years, and Next.js was already rejected partly for framework churn. The one
thing Astro islands would buy — the team directory filter — is ~100 lines of vanilla
JS over server-rendered cards, which is what the previous site already did.

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
| ~~`portfolio`~~ | ~~18~~ | demo content, excluded — see §5 |
| `location` | 11 | none |
| **Total** | **360** | |

229 of 378 URLs are data-driven detail pages — one record each, one template.
Nobody hand-authors 200 staff bios. The original plan documented full-site Eleventy
as its own fallback ("if duplicated header/footer across many static files becomes
error-prone"); that condition was already met at signing time.

### Other deviations from the original plan

1. **Pages are not Markdown.** The plan said "strip the old HTML → clean Markdown".
   Page content carries layout semantics (the block `layout` discriminator, §6)
   that Markdown cannot express — flatten it and every multi-column layout is
   lost. Pages need
   structured frontmatter with a block array. Markdown is correct for the 104 posts
   and 200 personnel bios.
2. **Decap must cover `personnel`, not just posts.** At a 200-person firm, staff
   churn is the highest-frequency content change on the site. If editors can't add a
   person without a developer, the CMS solved the wrong problem.
3. **9 forms, not 1.** See §10 — this turned out cheap, but the plan assumed a
   single contact form.

---

## 4. Where the content came from

Content was imported once from the site's previous CMS and now lives entirely in
`site/content/` (§6a), with its media re-encoded into `site/assets/img/`. The
source system, its 4.4 GB export and the one-shot import scripts have all been
deleted; a build from a clean clone produces the full site with no broken asset
references. §11 lists what the import surfaced that still needs a decision.

`portfolio` (18 records) was deliberately not imported — demo content shipped
with the old design, see §5.

**Site identity.** `https://www.prosperityllc.com`, "Prosperity Partners",
tagline "Accounting, Tax, & Sage Intacct Solutions". Page URLs are `/<slug>/`.

**Legal entities** (appear in the footer disclaimer, keep verbatim): NDH
Advisors LLC dba Prosperity Partners; NDH CPA LLP dba Prosperity Partners CPA.

---

## 5. Content inventory

**360 public URLs.** Total content HTML across the entire site: **542 KB.**

| Type | Published | Body HTML | Notes |
|---|---|---|---|
| `page` | 45 (+8 draft, +2 private) | 138 blocks | See §6 |
| `post` | 104 | 62 KB (avg 612 chars) | Categories: Culture, What's New |
| `personnel` | 200 | 362 KB (avg 1,854 chars) | 3 facet fields each |
| `location` | 11 | 5 KB | |
| ~~`portfolio`~~ | ~~18~~ | — | **Demo content — not imported, see below** |

**`portfolio` was not real content.** All 18 records shared one identical
492-byte placeholder body, were dated to the old design's install date, and were
titled after layout styles (`Full Image Style`, `Video With Vertical Info`,
`Project Half Box Style`). `/portfolio/` and `/portfolio/<slug>/` both returned
**404** on the live site — the type was never publicly routed. Excluding them
drops the URL count from 378 to **360**.

**Page templates** — 38 of 47 pages share one generic renderer
(`site/pages/page.njk`); the rest are the services, sage, team, home and portal
variants, of which home and team have bespoke templates and the others render
through the generic path (§9 Phase D).

**Menus:** Main (21 items, 2 levels deep), Mobile (22), Footer (8), Social (1).

---

## 6. Page blocks — the `layout` discriminator

A page's body is `blocks[]` in its frontmatter (§6a). Each block carries a
`layout` and one or more HTML strings; `site/_includes/content-blocks.njk` maps
`layout` to a container class, and `site/assets/css/style.css` sizes the grid.

| Layout | Count | Renders as |
|---|---|---|
| `one` | 44 | single column |
| `raw:cta` | 29 | the shared CTA component (see below) |
| `sidebar` | 26 | main + sidebar |
| `two` | 10 | two equal columns |
| `twoimage-20` | 5 | image beside text |
| `raw:services-grid` | 4 | verbatim — the services card grid |
| `raw:services-team` | 3 | verbatim — the "group leader" block |
| `three` | 3 | three equal columns |
| `four` | 2 | four equal columns |
| `tiles` | 2 | card grid linking to pages/categories |
| `five` | 1 | five equal columns |
| `raw:home-*` | 6 | verbatim — the homepage sections (see §8 note) |
| `raw:team` | 1 | verbatim — the team directory placeholder |
| `raw:content-container`, `raw:content-block` | 2 | verbatim |

138 blocks across the 55 page records (layout values repeat across blocks).

`site/_includes/content-blocks.njk` has three arms, not one per layout: every
column layout resolves to the same container with a layout-suffixed class and
the CSS sizes the grid, `twoimage-20` names its inner container differently, and
`raw:*` is emitted with no container at all. **There is no `carousel` layout in
the content** — the one carousel on the site was frozen Slick output in
`partnerships.md` and is now a static grid (§13).

### `section_class` — the block's own section modifiers

A block may also carry `section_class`, which lands on its `<section>` alongside
`content-block`. The previous site used these to style whole bands of a page,
and the CSS for all of them was ported — but the import dropped the field, so
they rendered as plain white sections until they were recovered from the live
pages (§13). **24 blocks across 6 pages** carry one:

| Value | Blocks | Effect |
|---|---|---|
| `content-block-cards` | 8 | each column becomes a shadowed white card |
| `content-block-blue` | 8 | blue band, white text |
| `content-block-container-twoimage-top content-block-container-twoimage-20` | 5 | the image-beside-text band; also what makes consecutive ones sit 3em apart, since that rule is an adjacent-sibling selector |
| `content-block-border-top` | 3 | hairline rule above the band |
| `content-block-custom-2-border` | 2 | vertical divider between two columns |
| `content-block-custom-1` | 1 | gradient tiles with a ▶ watermark |

A block whose `html` is already a complete `<section>` is emitted as-is rather
than wrapped again — six blocks came out of the import that way.

A `raw:` prefix means the block is emitted verbatim with no container — used by
the hand-built homepage and team page sections, and by `raw:cta`, which renders
the shared CTA component instead of the block's own HTML.

Page-level frontmatter alongside `blocks[]`: `banner_image`, `banner_title`,
`banner_description_html`, `meta_description`, `page_type`, `status`.

Empty blocks are not a thing: five wrappers with no text, media or id were
removed site-wide (§13), the third such class of dead import markup after the
lazy-load placeholders and the editor-only classes (§12).

---

## 6a. Content model on the new site — `site/content/`

Content lives as one Markdown file per record under
`site/content/<type>/<slug>.md`, each with JSON frontmatter (`---json` delimiter,
parsed by gray-matter — already a transitive Eleventy dependency, no new package)
plus a body (rendered HTML, used for the record's main prose):

| Folder | Files | Frontmatter fields | Body |
|---|---|---|---|
| `personnel/` | 198 | `slug`, `name`, `certifications`, `job_title`, `location_name`, `location_url`, `photo`, `linkedin_url`, `facet_title`, `facet_specializations`, `date_modified` | bio HTML |
| `posts/` | 104 | `slug`, `title`, `published`, `date_modified`, `category_name`, `category_url`, `images[]` | post HTML |
| `locations/` | 11 | `slug`, `name`, `address_html`, `date_modified` | description HTML |
| `pages/` | 55 | `slug`, `path`, `page_type`, `title`, `meta_description`, `banner_title`, `banner_description_html`, `banner_image`, `date_modified`, `blocks[]` (each block: `layout`, `html`, optional `section_class` — §6) | *(empty — everything lives in `blocks[]`)* |

Each folder has a `<type>.11tydata.js` directory-data file (`tags`, `permalink: false`,
`templateEngineOverride: false`) so Eleventy auto-populates `collections.personnel`,
`collections.posts`, `collections.locations`, `collections.pages` — no manual data
loading. A few derived collections (`culturePosts`, `whatsNewPosts`, `recentPosts`,
`genericPages` — filtered/sorted views over the base collections) are defined in
`eleventy.config.js`. Templates access frontmatter via `.data.<field>` and body HTML
via `.content` (both standard Eleventy collection-item properties).

`date_modified` came across with the import and is present on 356 of 380 records;
the rest carried no date signal at the source. Not
currently rendered anywhere, but available for a future "last updated" UI or a
staleness-flagging script once editors are making ongoing changes through Decap.

**Personnel, posts, and locations are Decap-CMS-ready as-is** — a `folder` collection
per type, `format: json`, standard widgets (string/text/image/markdown) map cleanly
onto their flat frontmatter. **Pages are not.** A page's `blocks[]` is an array of
arbitrary per-layout HTML (§6) — none of
Decap's standard widgets can edit that structure; only its raw object/code widget
could, which isn't a real editorial experience. Pages stay developer-edited until a
custom Decap widget for content-block editing exists — that's separate, larger scope
(§9 Phase I), not something solved by moving pages into individual files.

Per-record media lives at `site/assets/img/uploads/<type>/<slug>[-<n>].<ext>`,
grouped by the record that owns it (multi-image posts get `-1`, `-2`, etc., in
order). The old flat, date-bucketed upload scheme is gone. Re-encoding to WebP
(§8) just adds a sibling file at the same basename, so nothing has to be
remapped.

---

## 7. Design system

Taken from the previous site's compiled CSS — exact values, not eyeballed.

```css
--blue:       #02518a   /* primary; also the mobile drawer background */
--blue-dark:  #023c70
--blue-deep:  #143b62   /* values section */
--sky:        #22a8de   /* hover / accent */
--green:      #4aad52   /* "What's New!" flag */
--orange:     #ff5d05
--grey-text:  #6d6e70   /* nav links */
--grey-light: #f1f1f1
--grey-mid:   #666
--grey-dark:  #333      /* filter hover text */
--grey-border:#ccc      /* filter + input borders */
--grey-muted: #999      /* filter placeholder / resting label */
--red-invalid:#f6474e   /* the only error colour the previous site used */
```

The last four were already in the ported stylesheet as raw hex; naming them
means every colour in `style.css` now resolves through a token. The only raw
hex left is the `:root` block itself and the vendor-prefixed gradient fallbacks,
which exist for engines that predate `var()`.

Font: **Urbanist** (Google Fonts), weights 200/400/700. Headings 700; large display
text uses 200.

Container `max-width: 80em`, 4% side padding below 1320px.
Nav breakpoint **1080px** (desktop bar ↔ drawer). Other breakpoints, as actually
declared: 1600, 1320, 1280, 1152, 1024, 960, 900, 840, 768, 720, 640, 600, 560,
500, 480. The ported rules use `(max-width:768px)` and the hand-written ones
`(max-width: 768px)`; the whitespace is the seam between the two, not a
different condition.

Card shadow: `0 12px 32px rgba(2,81,138,.2), 0 3px 6px rgba(2,81,138,.1)`.

---

## 8. What's built

`site/` is now an Eleventy source directory (Nunjucks templates + `_includes` +
`_data` + `content`), not static HTML. Content comes from `site/content/*/*.md`
(§6a). Site-wide data (footer locations, disclaimer, copyright) comes from `data/global.json` via
`site/_data/global.js` — the one "singleton" data file left; everything else is a
native Eleventy collection.

| File/dir | Contents |
|---|---|
| `site/_includes/base.njk` | Shared `<head>`, doctype, header/footer wrapper |
| `site/_includes/header.njk`, `footer.njk` | Nav + footer. The footer's contact details, locations, disclaimer, copyright, fax, LinkedIn URL and non-attest note all come from `global` data (dynamic year too); the header's 21-item main nav and the footer's 8-item Site Menu are deliberately hardcoded markup |
| `site/_includes/content-blocks.njk` | Generic block renderer — walks a page's `blocks[]` and renders each by `layout` (`one`/`two`/`sidebar`/`tiles`/`carousel`/etc., see §6) |
| `site/_includes/cta.njk`, `contact-form.njk` | Shared CTA section + the contact-form component itself, parameterized by `formVariant` (`standard` 5-field vs `contact` — adds the referral-source radio, see §10) and by `idPrefix`, so a page carrying both an embedded form and the CTA form does not emit duplicate element ids |
| `site/_includes/post-card.njk`, `team-card.njk` | The post card (homepage + both archives) and the personnel card (team directory + location pages), each previously duplicated per call site |
| `site/_includes/team-filters.njk` | The 3-facet filter, as real `<button>`s, plus the office jump menu that location pages carry (§13) |
| `site/_includes/post-archive.njk` | Body shared by `/culture/` and `/whats-new/`, which were byte-identical templates apart from six values |
| `site/index.njk` | Homepage — hero, intro, values, achievements, Culture/What's New (hand-picked, pre-optimized images under `assets/img/posts/`), CTA |
| `site/pages/page.njk` | Generic + services + portal pages, paginated over `collections.genericPages` |
| `site/pages/personnel.njk`, `location.njk`, `post.njk` | One page per personnel/location/post record, paginated over `collections.personnel`/`locations`/`posts` |
| `site/pages/culture.njk`, `whats-new.njk`, `meet-the-team.njk` | Archive/directory listing pages, over `collections.culturePosts`/`whatsNewPosts`/`personnel` |
| `site/pages/search.njk` | Search results page — static shell; results render client-side from the Pagefind index (§15) |
| `site/pages/sitemap.njk` | The human-facing `/sitemap/`, generated from the collections: pages nested by path depth, posts under their category, then locations. The old site built this with a CMS plugin, so the import captured no content for the record and the page shipped as a bare banner while being linked from every footer |
| `eleventy.config.js` | Passthrough copy, `longDate`/`isoDate` filters, `injectContactForm` (swaps the imported form marker for the real component), the derived collections listed in §6a, and the `eleventy.after` hook that builds the Pagefind index (§15) |
| `assets/css/style.css` | Two regions: hand-written palette/homepage/chrome styles, then the previous site's own stylesheets ported verbatim and appended so they win. Every colour resolves through a `:root` token; no selector is declared in both regions. See §9.2 |
| `assets/js/main.js` | Drawer nav, submenu accordions, search toggle, scroll-reveal, video autoplay fallback, contact-form "Other" field toggle, team directory 3-facet + name filter (§15), office jump menu on location pages |
| `assets/js/search.js` | Queries the Pagefind index and renders `/search/` results (§15) |
| `assets/icons/` | Favicons/manifest/browserconfig — source tidied into one folder, passthrough-copied back to the served root so no URL changed |

Media processing applied to the homepage's hand-picked images (the same recipe
applies to anything added later):
- Post thumbnails resized to 800px, WebP + JPEG fallback via `<picture>`
- Value icons 512px → 288px PNG
- Logos copied as-is (SVG, 8 KB)

### Stubs left in place

- Contact form posts to `/api/contact`, which has no Pages Function behind it
  yet (§9 Phase G) — submissions 404 until the Worker ships
- Turnstile: `turnstile_site_key` in `data/global.json` still holds the
  placeholder `TURNSTILE_SITE_KEY`, and `base.njk` deliberately withholds the
  widget script while it does (a placeholder key renders a visible error widget
  rather than a challenge). Setting a real key switches both on
- Page permalinks are `/<slug>/` at root, matching the live site's URLs. Post permalinks are `/culture/<slug>/` / `/whats-new/<slug>/` — moved off the flat root to sit under their existing category pages; still needs the 104 redirect rules from the old flat URLs (§9 Phase H, open decision §11.9)
- accessiBe accessibility overlay omitted pending a decision (§11.4)

---

## 9. Remaining work

Estimates are Claude token budgets, based on the homepage actually costing ~130k
including the plan review.

| # | Phase | Status | Tokens | Unlocks |
|---|---|---|---|---|
| A | Content + media import: all types → data files, media re-encoded | ✅ done | 60–90k | all 360 URLs' content |
| B | Eleventy scaffold; site chrome into Nunjucks layouts/includes | ✅ done | 50–70k | shared header/footer |
| C | Generic content-block renderer (9 column layouts) | ✅ done, and verified against live (§9.2) | 80–120k | **38 pages at once** |
| D | 4 bespoke templates: services, sage, team (+3-facet filter), portal | services/portal render via the generic renderer and match live; the 3-facet team filter is done (keyboard-operable, §13) and location pages have their office jump menu back; **sage is the only one left**, and it is blocked on §11.3 | 120–160k | 8 pages + team directory |
| E | 4 content-type templates + archives, pagination, RSS, 404, search page | personnel/location/post templates, Culture/What's New archives and the search page done, each with canonical + derived description, and all four compared against live (§9.2); RSS and 404 outstanding | 120–160k | 333 URLs |
| F | Visual QA pass + spot fixes (~60 URLs actually worth eyeballing) | **done for layout and chrome** — see §9.2. What is left is editorial: reading the copy, and the §11 decisions | 100–200k | |
| G | Forms: 1 component + 1 Worker (see §10) | component done (2 variants, standard + contact); Worker outstanding | 50–70k | all 9 forms |
| H | Pagefind + redirects + sitemap | Pagefind done (§15); the 104 post redirects, `_headers` and `robots.txt` are in place, and the human-facing `/sitemap/` is generated from the collections (§8); `sitemap.xml` and the page-level redirects in §11.6/§11.7 outstanding | 40–60k | SEO continuity |
| I | Decap CMS + OAuth Worker + Cloudflare Pages setup | content model ready for personnel/posts/locations (§6a); pages need a custom block-editing widget first; Decap config/OAuth Worker itself outstanding | 80–120k | editors + deploy |
| | **Total** | | **700k – 1.05M** | ≈ 6–10 sessions |

Dependencies: A → B → C → {D, E} → F. G, H, I are independent and can run anytime
after B.

**Calendar time is not set by the token budget.** Realistically 2–4 weeks, gated by:
human content sign-off across 360 URLs; Resend domain verification (DNS
propagation); the video host in §9.3; and the open decisions in §11.

### 9.1 Media — complete

A link-check over a full `_site/` build resolves **all 2,226 asset references**,
and the same check over `site/content/` — which also covers the draft and
private pages that never build — finds nothing missing.

Two groups were closed by fetching them from the live origin: the carousel arrow
in `style.css`, and the 17 icons belonging to `/valuation-services/` (draft) and
`/accounting-technology[old]/` (private), which had been outside the import's
reference scan.

The same pass picked up something the import had dropped silently. **Seven of the
200 personnel records have no photo** (Vikesh Bansal, Mazin El Harith, Richard
Lemanski, Brock Lock, Steve Mizrach, Blake Rath, Jonathan Yuen) and their cards
were rendering as empty figures. The live site falls back to a house graphic at
the same 550x500 as a real headshot; that graphic is now
`/assets/img/ui/team-placeholder.svg` and `meet-the-team.njk`, `location.njk` and
`personnel.njk` fall back to it. Adding a real photo to a record replaces it with
no other change. See `data/missing-media.md`.

Video is a separate gap; see §9.3.

### 9.2 Visual parity with the live site — done for layout, open for copy

Every published page and every template archetype has now been compared against
the live site, and the differences that were defects are fixed (§13).

**How it was checked.** A static diff first, over all 43 published pages, of the
live HTML against the built HTML: text, headings, links, images, banner images
and the class list of every `<section>`. That is what made the screenshots worth
taking — it surfaced a 25-character, one-heading delta on nearly every page which
turned out to be the rebuilt CTA form, and masking that exposed everything else.
Then a browser pass at a fixed 1280x900: computed styles and box geometry for one
page of each template, plus screenshots side by side.

**Where it stands now.**

- All 43 published pages emit the same `<section>` class sequence as live, apart
  from the five pages that deliberately no longer render an empty block (§13).
- `/assurance/`, checked property by property, is identical to live on banner
  gradient, banner title size/weight/colour, section padding, container grid and
  gap, and `.content` type scale — including box sizes to the pixel (1265x597
  section, 1265x501 container). The generic path is faithful.
- Banners: 22 of 37 are byte-identical to live; the other 15 are the same image
  re-encoded to 1600x666 from 1920x800, at the same aspect, as §12 requires.
  Every stock photo the live site shares across pages maps to exactly one local
  file — the import's per-page renaming is consistent.
- Content parity holds: no page differs from live in body text, headings or
  links except by design.

**What is deliberately different from live**, and should not be "fixed":

| | Why |
|---|---|
| One contact form component, placeholders not labels | §10 — nine forms collapse to one |
| Archive cards use the rebuild's `.card`, not the theme's `.post-*` | the new site's own design, shared with the homepage |
| Archive pagination is Newer/Older, not numbered | functional and accessible; no plugin |
| Homepage shows the newest three posts per category | live's curation was hardcoded and had drifted into two broken links (§13) |
| Testimonials and post images are static, not carousels | no client-side carousel library by design |
| Five pages no longer open with an empty 96px band | live still renders those; §13 |

**What is genuinely left** is not layout: reading the copy on 360 URLs for sense
and currency, and the editorial decisions in §11. Two content recoveries are also
outstanding — the two dropped post records in `data/missing-media.md`, and the
Sage pages behind §11.3.

#### The stylesheet's two regions

`site/assets/css/style.css` has a hand-written region and, appended after it, the
previous site's own stylesheets ported verbatim under a banner comment saying
they come last so they win. Both copies used to coexist: **180 declarations
across 65 selectors** in the earlier region were fully shadowed and have been
deleted, verified by resolving every selector/property pair at 21 viewport widths
before and after (zero computed-value differences). No selector is declared in
both regions now, and every colour resolves through a `:root` token.

### 9.3 Video — needs a CDN base URL

**Three videos are currently not on the site at all.** Each `<video>` has been
replaced by a `TODO: VIDEO CDN URL NEEDED` comment at the exact spot it belongs:

| File | Where the placeholder is | What the page shows now |
|---|---|---|
| `home.mp4` | `site/index.njk` — hero | the poster frame (the video's own first frame), so the hero still looks right, it just doesn't move |
| `year-end-recap.mp4` | `site/content/posts/mid-year-recap.md` | nothing where the player was |
| `uploading-files-to-your-client-portal.mp4` | `site/content/pages/client-portal-uploading-files-to-your-client-portal.md` | nothing where the player was |

They are boxed in by two earlier decisions that collided. Video is never
committed here — `.gitignore` excludes `*.mp4`/`*.webm`, and the three files
(26 MB) were removed in "Serve video from the origin site; never version video".
That commit pointed them back at the old origin instead, at its legacy media
paths — which are exactly what has since been retired. So there is neither a
local file nor a URL left to point at.

**To restore them:** host the three files somewhere (R2, Cloudflare Stream,
Bunny, any static bucket) and paste the base URL into the three placeholders.
The originals are still served from the live site, so nothing is lost — grep
`VIDEO CDN URL NEEDED` to find every spot.

---

## 10. Forms — audited, simpler than expected

The old site ran 9 separate forms. Their 3,782 stored entries are historical and
do not migrate; archive them as CSV if they are wanted.

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
Cloudflare Pages Function. Not nine integrations. Form 2 was inactive — drop it.

Captcha fields become Cloudflare Turnstile. The Worker verifies the Turnstile token,
then relays over **SMTP** (not a vendor REST API) so the provider is swappable by
changing credentials.

---

## 11. Open decisions — needs client input

1. **8 draft pages.** Their images are now in the repo, so this is purely an
   editorial call. Seven form a coherent unpublished Valuation Services line:
   `/valuation-services/`, `/financial-reporting/`,
   `/income-estate-and-gift-valuations/`, `/intellectual-property-valuation/`,
   `/marital-dispute-valuations/`, `/mergers-and-acquisitions-valuations/`,
   `/shareholder-dispute-valuations/`. Ship, or drop?
   ⚠️ **`/valuation-services/` is linked from the Mobile Menu but the page is a
   draft — it's a broken link on the live site today.**
2. ~~**"Payment (old page backup)"** has slug `/`.~~ **Resolved:** the record is
   gone; `home.md` is the only page record with path `/`.
3. **2 private pages.** `/accounting-technology/` ("Accounting Software - Sage
   Intacct", 6 blocks, 3.1 KB) is substantial but private. Publish or drop?
   `/accounting-technologyold/` is presumably dead. Their icons are now in the
   repo, so either can ship as-is.
4. **accessiBe** — third-party accessibility overlay the old footer loaded. Keep
   the vendor, or drop it?
5. **Greenhouse careers embed** (`boards.greenhouse.io/embed/job_board/js?for=ndhcpa`)
   on the Careers page — note it still uses the old `ndhcpa` board slug.
6. **Redirect conflicts.** `/client-portal/` is both a published page and a
   redirect source. There are also multi-hop chains
   (`/client-portal-login/` → `/client-portal/` → `/client-portal-login/client-portal/`
   → `/client-portal-login/uploading-files-to-your-client-portal/`). Cloudflare
   `_redirects` resolves one hop — these must be **flattened to their final
   destination**, and the page-vs-redirect conflict resolved.
7. **Front page slug.** The old homepage also answered at `/homepage-main/`, and
   the Footer menu's "Home" link still points there. It should 301 → `/`.
8. **Stale footer data.** The old footer referenced a **Philadelphia** office that
   no longer appears in the locations list. Confirm it's closed.
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

**Comparing against the live site has three traps.** Its stylesheet is
lazy-injected, so `getComputedStyle` can report unstyled defaults on a page that
looks fine — trust a screenshot over a computed value there. Its scroll-reveal
animation will not fire under programmatic scrolling, so anything below the fold
photographs blank; scroll with real input. And its markup has `<section  class=`
with two spaces, so a regex expecting one silently matches nothing.

**A selector list cannot be split on every comma.** `:is(:link, :visited)` has
one inside the parentheses, so a naive split produces fragments like `:visited)`
that appear to match across unrelated rules. This is not hypothetical: it made a
CSS dedup delete `.page-banner a` colours as "shadowed", and the equivalence
check missed it because the same broken parser produced both sides of the
comparison. Split on top-level commas only, and when a check and the thing it
checks share code, the check proves less than it appears to.

**A block's `<section>` modifiers live in `section_class`, not in `layout`.**
See §6 — `layout` picks the container, `section_class` paints the band. A
missing one is invisible in the layout and obvious in the colour.

**`eleventyComputed` strings are rendered as Nunjucks, then rendered again by
the layout.** Any value interpolated there needs `| safe`, or it is escaped
twice and `&` reaches the page as `&amp;`. This is not a data problem — the
content carries real ampersands.

**`.content` is not available in `eleventyComputed`** — it resolves during the
data phase, before content is rendered, and throws
`TemplateContentPrematureUseError`. Use `rawInput`, which for these records is
the body as authored (`templateEngineOverride: false`).

**`data/` is outside the input dir, so Eleventy neither watches it nor reloads
it.** Both halves are needed: `addWatchTarget("./data/")` in the config, and
`readFileSync` rather than `require` in the readers — `require` caches by path,
so a watch-triggered rebuild would re-run against the old contents and the edit
would appear to do nothing.

**Nunjucks' `slice` is Jinja's** — it splits a list into N chunks. "The first
three" is the `limit` filter in `eleventy.config.js`, not `slice(3) | first`.

**The content import is not re-runnable.** `site/content/` is now the source of
truth — there is no upstream to re-pull from and no script to re-run (§4). Edit
the files.

**Keep npm scripts shell-agnostic.** No `rm -rf`, no `VAR=value cmd` prefixes, no
`&`/`;`/subshells in `package.json` — `npm run` uses `cmd.exe` on Windows and the
whole script fails before Eleventy starts. Put platform-specific logic in a
`node` script under `tools/` instead. See §2.

**`sips`, `cwebp` and `ffmpeg` are available; ImageMagick and PIL are not.**

**Always re-encode images before committing them.** Never drop a camera original
into `site/assets/` — the source library was full of 15–20 MB JPEGs.

**Imported page HTML is verbose and occasionally carries dead markup.** It came
out of the old editor. Two classes of artefact have already been removed
site-wide — lazy-load placeholders that left images blank, and editor-only
classes — so if you meet something similar, check whether it does anything
before preserving it.

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
| 327 of 373 pages shipped `<link rel="canonical" href="">` | `base.njk` emitted the tag unconditionally from a `canonicalUrl` only four templates set; it now falls back to the page's own URL, so a new template cannot reintroduce it |
| 362 of 373 pages shipped an empty `<meta name="description">` | The record templates never set one. Derived from the record body (`plainText` + `truncate` filters) with a title fallback; 33 published pages still have no authored `meta_description`, which is now an editorial gap rather than a blank tag |
| Every `&` in a title rendered as `&amp;` on screen | `eleventyComputed` re-renders its strings as Nunjucks, so an un-`safe`d value was escaped once on the way in and again in `base.njk`. The homepage had a literal `&amp;` in its frontmatter as well |
| `/partnerships/` testimonials section rendered blank | The imported block was Slick's *runtime output* — a 4466px track translated -638px inside `overflow:hidden`, 14 slides of which 8 were `slick-cloned` — with no Slick on the site. Measured 0 of 14 visible. Rebuilt as a static grid of the 6 unique testimonials |
| Two broken links on the homepage | Six hardcoded post cards, two pointing at records the import dropped (their images came across; see `data/missing-media.md`). Both grids now read the newest three from their collection |
| `TypeError: hero.play is not a function` on every homepage load | `.hero__video` is an `<img>` while the hero video waits on a CDN URL (§9.3); the handler assumed a `<video>` and the throw aborted everything below it in `main.js` |
| Team directory filter unusable by keyboard | 26 facet options were `<li>`s with click handlers and no `tabindex`, the trigger a `div[role=button]`, Reset a `span[role=button]` — a keyboard user could open a dropdown and select nothing. All three are `<button>`s now, with a visible focus ring and Escape to close |
| Duplicate element ids on `/client-accounting-services/back-office-accounting/` | The only page with both an embedded form and the CTA form; both used `cf-*` ids, so the second form's `<label for>` pointed at the first form's fields |
| `.cf-turnstile` never rendered a widget | The Turnstile script was loaded nowhere. Now loaded from `base.njk`, gated on a configured site key |
| `required` inert on all contact forms | The form carried `novalidate` with no JS validation to replace it |

### Found by the visual pass against live (§9.2)

| Bug | Cause |
|---|---|
| `/partnerships/` and 5 other pages rendered whole bands white that should be blue, carded or bordered | The previous site put modifier classes on each block's `<section>`; the import kept only `layout` and `html`, and the renderer hardcoded `class="content-block"`. Every rule for them was already in the ported CSS — only the class was missing. Recovered into `section_class` on 24 blocks across 6 pages (§6) |
| Consecutive book entries on `/special-projects/books-publications/` had no gap | Those classes were on a wrapper `<div>`, and the 3em rule is `.twoimage-20 + .twoimage-20` — an adjacent-sibling selector, which wrapper divs inside separate sections never satisfy. They sit on the `<section>` now, as on live |
| Six blocks rendered a section inside a section | Their `html` was already a complete `<section>` while still carrying a column `layout`, so the renderer wrapped them twice — doubling the padding and, for `sidebar`, squeezing the inner grid into the outer grid's first column |
| Banner links were invisible | A CSS dedup deleted `.page-banner a` colours as "shadowed" — see the `:is()` note in §12. Banner copy sits in a `.content` wrapper, so the links fell through to the ported `.content` rule and rendered `--blue` on the blue banner |
| ~200 personnel pages showed a bare 24px icon where the LinkedIn badge belongs | The 216x35 "Find me on LinkedIn" asset was imported to `assets/img/ui/`, but the template pointed at the footer's `linkedin.png` |
| Certifications read "Jeremy Dubow, CPA, MST" where live has no comma | An earlier a11y fix put the separator in the visible text; it is in a visually-hidden span now, so the rendering matches live and the accessible name still reads correctly |
| Location pages had no office jump menu | Live carries a "Locations" select beside the member search. The port never rendered it, so its CSS looked dead and was briefly deleted. Shown only where the Location facet is hidden — the same distinction live makes |
| A `<select>` rendered 120x33 where live has 144x40 | `select` was missing from the `font: inherit` reset, so it kept the browser's ~13px UI font and the em-based sizing shrank with it |
| **384 of 488 post images never appeared anywhere** | The post template rendered `images[0]` only; live runs them as a slideshow. 50 of the 104 posts carry more than one, up to 33. They stack in the same column now |
| Both archives shipped a bare banner title | The category description lived on the CMS category term rather than on a page, so the import never saw it. Recovered into each archive's frontmatter; the cards also gained the excerpt live shows |
| `/sitemap/` was empty while linked from every footer | Built by a CMS plugin on the old site, so the record has no blocks. Generated from the collections instead — 162 links |
| Client portal fields were near-invisible and its submit filled the column | `--grey-light` (#f1f1f1) where live uses #ccc, and `width: 100%` where live sizes to the label |
| Every imported solid button carried an arrow live does not have | `.button--solid` (hand-written) and `.button.solid` (imported) were aliased "so the two can never drift apart" — but they are not the same style. Un-aliased; the homepage button keeps its arrow, which could not be confirmed either way because of the traps in §12 |
| Three pages opened with a 96px band of nothing | Five empty block wrappers left by the old editor. Removed site-wide; live still renders them, so this one is an improvement rather than parity |

---

## 14. Tooling — `tools/`

Nothing in `tools/` runs at build time; Eleventy needs none of it. Both files
exist only because `npm run` executes scripts through `cmd.exe` on Windows, so
the shell-specific parts had to move out of `package.json` (§2):

| File | Used by |
|---|---|
| `open-chrome-tab.js` + `.applescript` | `npm start` — opens/focuses a browser tab ~1.5s after the dev server starts |
| `debug-eleventy.js` | `npm run debug` — sets `DEBUG=Eleventy*` in the child environment |

The one-shot content-import scripts that used to live here were deleted with the
source system they read (§4).

---

## 15. Search — Pagefind

Pagefind indexes the *built* HTML rather than the source content, so it needs no server and no API: it ships a static index plus a WASM
query engine, and search runs entirely in the browser.

**The index is built by an `eleventy.after` hook in `eleventy.config.js`**, not
by a separate `npm run` step. That matters: it means `/search/` works under
`npm start` too. Wiring it as a postbuild script instead would leave search
silently dead in dev and only testable via a full production build. Writing into
`_site/pagefind/` doesn't cause a rebuild loop — the dev server watches the input
directory (`site/`), not the output.

### What gets indexed

`base.njk` puts `data-pagefind-body` on `<main>`. Once *any* page carries that
attribute Pagefind indexes **only** pages that do, which makes exclusion the
easy case: `noIndex: true` in a template's frontmatter drops the attribute and
the page falls out of the index. Used by `/search/` itself and the Culture /
What's New archives, whose card lists would otherwise match nearly every query
and outrank the actual record.

Chrome inside `<main>` is excluded with `data-pagefind-ignore` at each source —
the CTA, the team-filter bar, banner nav links, and the card grids on
`/meet-the-team/` and the location pages (each person is already indexed from
their own `/personnel/<slug>/` page; indexing the cards too would rank a
directory listing alongside the real bio).

Result: **360 pages, ~77k words** — 200 personnel + 104 posts + 45 pages + 11
locations. That is the full public URL count from §5, and the number to re-check
after touching any of this.

Each page also carries `data-pagefind-meta="image[src]"` on its lead image, so
result cards get a thumbnail; the `FALLBACK_IMAGE` in `search.js` covers the 13
pages with no image. And `data-pagefind-filter="type:<page|post|personnel|location>"`
(from a `searchType` frontmatter value) enables scoped queries.

### The team directory's "Search members" box does not use Pagefind

It filters the cards already on the page, by name, via `main.js` — it does not
submit to `/search/`. Two false starts worth recording:

1. It originally submitted an unscoped query, so "tax" returned whole-site
   results. The old site scoped this box with a hidden `post_type=personnel`
   input that the port had dropped.
2. Adding the equivalent Pagefind `type=personnel` filter scoped it to people
   but still matched **bio prose**, so "tax" matched 140 of 200 members. A box
   labelled "Search members", sitting beside the Title / Service Line / Location
   dropdowns, means *names* — so it now matches on `data-name` and combines with
   those facets (a card must satisfy both). `Reset` clears both.

It is still a real `<form>` with a GET action, so a no-JS submit degrades to the
site-wide search rather than doing nothing.

### Gotcha: the platform binary may not install

`pagefind` is a Rust binary delivered through per-platform optional deps
(`@pagefind/darwin-arm64` etc.). Two ways this breaks:

**Wrong platform installed.** On this machine `npm install` pulled
`@pagefind/windows-x64` on an arm64 Mac, and `resolveBinary.js` throws because it
looks for `@pagefind/darwin-arm64/bin/pagefind`. The Artifactory registry
returned 401 for the correct package and public npm is unreachable, so the fix
was to fetch the release tarball by hand and extract the binary to that path:

```bash
# from https://github.com/pagefind/pagefind/releases (verify the sha256)
mkdir -p node_modules/@pagefind/darwin-arm64/bin
tar -xzf pagefind-v1.5.2-aarch64-apple-darwin.tar.gz \
    -C node_modules/@pagefind/darwin-arm64/bin
chmod +x node_modules/@pagefind/darwin-arm64/bin/pagefind
```

`PAGEFIND_BINARY_PATH` also overrides the lookup if you'd rather keep the binary
outside `node_modules`. Either way this is **per-machine and does not survive
`npm install`** — `node_modules/` isn't committed. Don't commit the tarball.

**Killed by Gatekeeper.** A hand-downloaded binary carries
`com.apple.quarantine` and dies with `Killed: 9` (SIGKILL) rather than a useful
error. Clear it:

```bash
xattr -d com.apple.quarantine node_modules/@pagefind/darwin-arm64/bin/pagefind
```

Same symptom hit `node_modules/.bin/*`, which had lost their exec bit
(`Permission denied` running `eleventy`); `chmod +x node_modules/.bin/*` fixed it.

**None of this affects deploy.** Cloudflare Pages builds on linux-x64 against
public npm, where `@pagefind/linux-x64` installs normally. This is a local-dev
problem only.

