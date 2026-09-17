# Prosperity Partners — Static Site Code Review

> Review date: 2026-09-17
> Scope: this repository (`prosperity-llc-site`) at `40f4530` — Eleventy source, templates, CSS, client JS, content model, build config
> Method: full read of `site/`, `data/`, `tools/`, `eleventy.config.js`; a clean `npx @11ty/eleventy` build (373 files); a whole-site internal link check over `_site/`; computed-style and console checks in a real browser at desktop and 375px
> Not in scope: the page-by-page visual comparison against the live site (README Phase F), and copy/editorial review

## Executive Summary

The foundations here are genuinely good, and worth saying before the findings: the content model is clean and self-consistent (200 personnel records, zero missing `last_name`/`location_url`/`facet_title`, and **every facet value validates against `data/team-filters.json`** — the schema validation §3 says was traded away for Eleventy is, in practice, already satisfied). Pagefind indexes exactly the 360 pages §15 claims. The whole-site link check found **zero broken asset references**, confirming §9.1. Nothing secret is in the tree or in git history, `.gitignore` is one of the better-reasoned ones I've read, and every `target="_blank"` in 360 pages of imported HTML carries `rel="noopener"`.

The problems cluster in three places, and they are all the same shape — **content and presentation that were hand-copied instead of derived.**

1. **Two pages are rendered twice, from two sources.** `home.md` and `meet-the-team.md` are `status: publish`, carry full block content and metadata, and are rendered by nothing; `index.njk` and `meet-the-team.njk` duplicate them by hand. That drift has already produced two broken links on the homepage — the only two broken internal links on the entire site.
2. **The stylesheet contains two competing copies of the same rules.** Lines 1029–1078 are the previous site's own stylesheets, ported verbatim and appended so they win over the hand-authored reconstruction above them for ~60 selectors. That override is deliberate and the banner comment above it says so — but README §9.2 does not mention it, and describes everything above as unverified reconstruction, so the file carries two sources of truth for those selectors and the superseded copy is dead weight.
3. **One page ships a JavaScript widget's frozen output.** `/partnerships/` carries Slick carousel runtime markup with no Slick to drive it. Measured in the browser: **0 of 14 slides visible.** All six client testimonials render as a blank void.

Severity aside, the template layer has real duplication that is cheap to collapse — `culture.njk` and `whats-new.njk` are the same file with six values changed, the post card exists in four places, and eight of the nine branches in `content-blocks.njk` are byte-identical to their own fallback.

---

## Critical

🔴 **327 of 373 pages ship an empty canonical tag.** `base.njk:8` always emits `<link rel="canonical" href="{{ canonicalUrl }}">`, but only `page.njk`, `index.njk`, `meet-the-team.njk` and `search.njk` ever set `canonicalUrl`. `personnel.njk`, `post.njk`, `location.njk`, `culture.njk` and `whats-new.njk` do not, so all 200 personnel pages, 104 posts, 11 locations and the archives render `href=""`. An empty canonical is worse than no canonical — it is invalid, and crawlers resolve it inconsistently. This is also a **regression against the old site**, which `reports/prosperity-partners-seo-audit.md` records as having a canonical tag on every one of 365 pages. Fix in the templates, not per-record: each already knows its permalink.

🔴 **`/partnerships/` renders its testimonial section completely blank.** `site/content/pages/partnerships.md` contains Slick's *rendered runtime output* rather than source markup — `slick-initialized`, `slick-track`, `slick-cloned`, `aria-hidden`, `tabindex="-1"`, and baked-in inline geometry (`width: 4466px; transform: translate3d(-638px, 0px, 0px)`). There is no Slick JS anywhere on the new site, so that geometry is frozen inside an `overflow: hidden` container. Measured in the browser:

| Container width | Track width | Track transform | Slides | Visible |
|---|---|---|---|---|
| 116px | 4466px | `translate3d(-638px,0,0)` | 14 | **0** |

All seven real client testimonials are invisible, the `Previous`/`Next` buttons render as unstyled stray text, and the 8 `slick-cloned` slides are duplicate copy sitting in the Pagefind index. This is exactly the artefact class §12 warns about. The content needs to be reduced to the seven unique testimonials; then either add a carousel (the `.slick-*` arrow CSS is already present) or render them as a plain stack.

🔴 **Two broken links on the homepage.** `index.njk` hardcodes six post cards; two point at records that do not exist:

- `/culture/santa-barbara-summer-outing-at-dodger-stadium/`
- `/whats-new/proud-to-be-named-a-2026-best-place-to-work-in-chicago/`

A link check across every built page found these as the **only** two broken internal targets. They are a direct symptom of the hardcoding described under Architecture below — neither slug appears in `site/content/posts/` or in `_redirects`.

🔴 **Uncaught `TypeError` on every homepage load.** `site/assets/js/main.js:115` selects `.hero__video` and calls `hero.play()`, but `index.njk:27` now renders an `<img class="hero__video">` — the stand-in for the missing hero video (§9.3). Confirmed in console on every homepage load:

```
Uncaught TypeError: hero.play is not a function   main.js:285
```

The throw aborts the rest of the IIFE. Nothing user-visible breaks *today* (the code after it — the contact-form "Other" toggle and the team filter — has no markup to bind to on the homepage), which is precisely what makes it dangerous: the next behaviour added below that line will silently not run on the homepage. Guard on `hero.tagName === "VIDEO"` (or `typeof hero.play === "function"`) so the block no-ops until the CDN URL lands.

---

## Important

🟡 **The team directory's facet filter cannot be operated by keyboard.** On `/meet-the-team/`, measured in the browser: **26 filter options, 0 focusable.** The options are `<li class="team-filter-link">` with click handlers and no `tabindex`; the dropdown headers are `div[role="button"][tabindex="0"]` and Reset is a `span[role="button"]`. So a keyboard user can open a dropdown and then cannot select anything in it. `main.js` already handles Enter/Space on the header and the Reset — the options were missed. Making all three real `<button>` elements removes the `role`/`tabindex` scaffolding and fixes this in one pass. (`reports/prosperity-partners-accessibility-audit.md` flagged keyboard operability on the old site too; this is the same gap carried forward.)

🟡 **`style.css` contains ~60 duplicated selectors, and the later copy wins.** Lines 1029–1078 are the old theme's per-page stylesheets ported verbatim (the comments name them: `elements/content_blocks.css`, `pages/services.css`, `pages/team.css`, `pages/single-personnel.css`, `pages/single-location.css`, `pages/search.css`), appended under a banner that states they come last *so that they win* over the reconstruction above. So this is a deliberate override, not an accident. Proof it is in force, measured at a 1024px viewport:

| Rule | Declares at 1024px | Wins? |
|---|---|---|
| `style.css:919` (reconstruction) | `repeat(2, 1fr)` | no |
| `style.css:1043` (verbatim port) | `repeat(3, 1fr)` | **yes — computed: 3 columns** |

The consequence is that the reconstruction (roughly lines 684–1028) is largely dead for those selectors, and **README §9.2 does not mention the port at all** — it describes everything above as reconstructed-and-unverified, which reads as though the uneven coverage is still unresolved. Deleting the superseded copy and correcting §9.2 is the highest-leverage cleanup in the repo, and it should happen before Phase F so the visual pass is not spent on rules that are already overridden.

🟡 **362 of 373 pages have an empty meta description.** Two separate causes: 33 of the 45 published page records carry no `meta_description`, and the personnel/post/location/archive templates never set `description` at all — even though usable source data exists on every record (`job_title` + `location_name` for people, the post body for posts). Template defaults would close ~320 of these in one change; the remaining 33 are editorial. The old site had the same volume problem (335 of 365), so this is carried over, not introduced.

🟡 **Duplicate element IDs on `/client-accounting-services/back-office-accounting/`.** That is the one page that receives both an injected mid-content form and the site-wide CTA form, so `cf-first`, `cf-last`, `cf-email`, `cf-phone` and `cf-message` each appear twice. Every `<label for>` in the second form resolves to the first form's field. `contact-form.njk`'s IDs need to be unique per instance (a counter or a passed-in prefix). Worth fixing generically rather than for this page — `raw:cta` appears in 29 blocks, so any page that gains a second form inherits the bug.

🟡 **`novalidate` makes all five `required` attributes inert.** `contact-form.njk:1` sets `novalidate`, which disables native constraint validation, and there is no JS validation anywhere in `main.js` to replace it. As written, an empty form submits. Either drop `novalidate` or add the custom validation it implies.

🟡 **Turnstile will never render as wired.** The `.cf-turnstile` div is in place, but `https://challenges.cloudflare.com/turnstile/v0/api.js` is loaded nowhere in the repo — so in addition to the known `TURNSTILE_SITE_KEY` placeholder, there is no script to turn that div into a widget. Both halves need to land with the Phase G Worker; otherwise the endpoint ships expecting a token that the page never produces.

🟡 **No `_headers` file.** Cloudflare Pages reads security headers from `_headers` at the deploy root, the same mechanism `_redirects` already uses, and there isn't one — so no CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` or framing protection. This is nearly free here (no inline styles in content, and only two script origins) and is best set *before* the Greenhouse loader, Turnstile and the form Worker are live. Also absent: `robots.txt` (not tracked in §9; `sitemap.xml` and `404.html` already are).

---

## Architecture & reuse

**Two sources of truth for the homepage and the team page.** `site/content/pages/home.md` (`page_type: home`, `status: publish`, 15.4 KB across 7 blocks, with its own `meta_description`) and `meet-the-team.md` (`page_type: page-team`, with `banner_title`, `banner_description_html`, `banner_image`, `meta_description`) are both excluded from `genericPages` because their `page_type` is not in `GENERIC_PAGE_TYPES` — so they render nowhere, while `index.njk` and `meet-the-team.njk` restate their content inline. `meet-the-team.njk:7` admits it: *"the two have to be kept in step by hand."* The two broken homepage links are that hand-syncing having already failed. Either render these two pages through their records (hero, intro, values and post cards are all derivable) or delete the orphaned records — but not both as-is.

**`content-blocks.njk`: eight of nine branches are identical to the fallback.** The `one`, `two`, `three`, `four`, `five`, `sidebar`, `tiles` and `carousel` branches each emit exactly what the `{% else %}` on line 23 emits — `content-block-container container content-block-container-{{ b.layout }}`. Only `twoimage-20` genuinely differs. The 35-line macro collapses to about six. `raw:` is also dispatched twice: the loop tests it on line 30, then the macro tests it again on line 20.

**`culture.njk` and `whats-new.njk` are the same template.** 32 of 44 lines are identical; they differ in six values (collection, permalink prefix, title, banner heading, banner image, pagination `aria-label`). One template with those six values in frontmatter — or a shared include — removes 44 lines and the risk of fixing a card bug in one and not the other. Relatedly, the post card markup now exists in **four** places: hardcoded ×6 in `index.njk`, in `culture.njk`, in `whats-new.njk`, and again as a template string in `search.js:resultCard`.

**The team-member card exists twice.** `meet-the-team.njk:32-46` and `location.njk:40-53` differ only by the location-slug class and one `<p class="team-member-location">`, and carry the same copy-pasted comment with its indentation mangled. A macro taking `showLocation` would cover both.

**Dead CSS with identifiable causes.** `.team-locations` / `.team-locations-select` style a location `<select>` that no template renders. `.content-block+style+.services-grid` targets a `<style>` element in the content flow — content has zero `<style>` tags, so it never matches. `.slick-prev` / `.slick-next` style arrows for a carousel with no JS (see the `/partnerships/` finding).

**Design tokens are declared and then bypassed.** `:root` defines `--blue`, `--sky`, `--white`, `--black` and friends, yet the file still uses `#02518a` 16×, `#22a8de` 9×, `#fff` 20× and `#000` 17× as raw hex — plus off-palette greys (`#ccc` 11×, `#999` 6×, `#333`, `#eee`) and one stray `#f6474e` that is in no documented palette. Most of this is inside the pasted theme block, so it resolves with the duplication cleanup above.

**Two formatting conventions mark the seam.** `@media (max-width:768px)` (no space, minified block) appears 8× and `@media (max-width: 768px)` (spaced, hand-written) appears another 8× — the same breakpoint declared in both halves. Across 26 media-query declarations there are 15 distinct breakpoints, against the 11 §7 documents.

**Navigation is hardcoded in two templates, and §8 overstates the data layer.** README §8 says the footer is *"all pulled from `global` data, not hardcoded"* — in fact `footer.njk` hardcodes the 8-item Site Menu, the fax number (while phone and email come from `global`), the LinkedIn URL, and the non-attest footnote. `header.njk` hardcodes the full 21-item main nav. That is a defensible choice for a nav that rarely changes, but it should not be described as data-driven, and the fax number sitting beside two `global` fields is an inconsistency worth closing either way.

**`data/` is outside the input directory and loaded via `require`.** `site/_data/global.js` is `module.exports = () => require("../../data/global.json")`. Eleventy watches `site/`, so edits to `data/*.json` do not trigger a dev-server rebuild; and Node's require cache would hand back the stale object even if they did. Moving these into `site/_data/` (or reading them with `fs.readFileSync` inside the function) restores live reload for the footer, filter and pinning data.

**Heading hierarchy skips levels.** `/meet-the-team/` goes `h1` → `h3` → `h5` (measured); personnel pages go `h1` → `h3` → `h4`; post pages place an `h5` date *before* the `h1`. The card headings also concatenate into the accessible name without a separator — "Jeremy Dubow" + the certs span reads as **"Jeremy Dubowcpa, mst"**.

---

## Security

**Clean, with one exception.** No secrets in any tracked file and none in git history (checked `--diff-filter=A` across all refs for `.sql`/`.env`/`.pem`/`.key`/`wp-config`). The `.gitignore` rationale for the import leftovers and the video exclusions is exemplary. Across 360 pages of imported HTML: zero `http://` references, zero `wp-content`/`wp-includes` leftovers, zero inline `<script>` or `<style>`.

🟡 **One `target="_blank"` without `rel="noopener"`** — the password-reset link on `/client-portal/` (`clientaxcess.com/#/forgot`), which is the highest-value reverse-tabnabbing target on the site. Modern browsers imply `noopener` for `target="_blank"`, so the practical exposure is small, but it should not be the one link that relies on that. *(A first pass reported zero of these; the scan matched a literal `target="_blank"` and this page's HTML sits inside JSON frontmatter, where the quotes are backslash-escaped. Any content scan here has to account for that.)* `search.js` escapes every field it interpolates and passes through only Pagefind's own `<mark>`-wrapped excerpt, with a comment explaining exactly why that one field is exempt. Third-party origins in the built output are only Google Fonts and links out — plus the Greenhouse loader, which is injected deliberately and documented well in `page.njk`.

**Open items, in priority order.**

1. `_headers` is missing (above) — the one substantive gap.
2. `/api/contact` has no `functions/` implementation, so all forms currently POST to a 404. Known (Phase G); noting it so it is not mistaken for working.
3. Turnstile is half-wired (above).
4. **Trust boundary to decide before Decap.** Every block body renders through `| safe`, which is correct while `blocks[]` is developer-edited. §6a plans a custom Decap widget for block editing; the moment non-developers can put HTML into `blocks[]`, that `| safe` becomes a stored-XSS path. Worth deciding now whether that widget emits constrained structure or whether the pipeline sanitizes.

---

## README accuracy

Mostly excellent — the reasoning captured in §3, §12 and §15 is the kind that usually gets lost. Four things have drifted:

1. **§6's layout table does not match the content.** Actual counts across `site/content/pages/`: `one` 46, `raw:cta` 29, `sidebar` 26, `two` 10, `twoimage-20` 5, `four` 4, `three` 3, `tiles` 2, `five` 2, plus 12 other `raw:*` layouts. The table claims `one` 104, `two` 34, `carousel` 10, `three` 7, `tiles` 6, `five` 6, `twoimage` 5. `carousel` is used **zero** times (yet `content-blocks.njk` has a branch for it), and the layout is named `twoimage-20` in content but `twoimage` in the table.
2. **§9.2's diagnosis is inverted** — see the CSS duplication finding.
3. **§11.2 is already resolved.** No page record has slug or path `/` except `home.md`; the "Payment (old page backup)" file is gone.
4. **Counts are slightly off.** §11.1 says 9 draft pages; there are 8 (7 Valuation + `client-accounting-services-start-up-accounting-services-menu`). §5 implies 56 page records (45+9+2); there are 55.

Verified accurate: the 360-page Pagefind index (§15), all asset references resolving (§9.1), the 7 photo-less personnel records falling back to the placeholder, the Windows/`cmd.exe` npm-script rationale (§2), and every fix listed in §13 still holding — including the mobile drawer and submenu behaviour, re-checked at 375px.

---

## One more thing, outside code

The site's own tagline is *"Accounting, Tax, & Sage Intacct Solutions"*, but the phrase "Sage Intacct" appears **exactly once in the entire built site** — in the homepage `<title>`, which is in `<head>` and therefore not indexed. Both Sage pages are `page_type: page-sage, status: private`, so the service the tagline leads with has no page and is unsearchable. That is downstream of open decision §11.3 rather than a defect, but it is a bigger consequence than "publish or drop?" suggests.

---

## Suggested order of work

1. `hero.play` guard, the two broken homepage links, `_headers` — small, isolated, no design decisions.
2. Resolve the `style.css` duplication (pick a canonical copy, delete the other). Do this *before* Phase F, or the visual pass will be spent chasing rules that are already overridden.
3. Canonical + description in the five templates that omit them, and unique form IDs.
4. Fix `/partnerships/` content; decide whether `carousel` needs JS or becomes a stack.
5. Collapse the duplication: `content-blocks.njk` branches, `culture`/`whats-new` into one template, the team card into a macro, the post card into a shared include.
6. Resolve the `home.md` / `meet-the-team.md` double source of truth — this one is a design decision, and it is the root cause of #1's broken links.
7. Make the team filter keyboard-operable (three elements become `<button>`).
