# Prosperity Partners — Static Site Quality Review

> Review date: 2026-09-18
> Scope: this repository (`prosperity-llc-site`) at `ca48c97` plus the uncommitted
> schema migration in the working tree — Eleventy source, templates, CSS, client
> JS, content records, build config, deploy config and README
> Method: full read of `site/`, `data/`, `tools/`, `eleventy.config.js`; a clean
> `npm run build`; a whole-site link + asset graph over `_site/` (HTML attributes
> **and** CSS `url()` / JS string references); an HTML structure pass over all
> built pages; a live HEAD/GET sweep of all 205 distinct external URLs; the CSP
> parsed against the set of origins the build actually loads; browser checks at
> `localhost:8080`; and, for every open content gap, a comparison against the
> live pre-migration site at https://www.prosperityllc.com
> Not in scope: the page-by-page visual comparison against the live site (README
> §9.2 Phase F), and copy/editorial review

## Executive summary

The 2026-09-17 review (`static-site-code-review.md`) is **largely closed**. Empty
canonicals, empty meta descriptions, the `hero.play` crash, duplicate form IDs,
the missing `_headers` and `robots.txt`, the frozen Slick carousel on
`/partnerships/`, `content-blocks.njk`'s nine identical branches, the four
copies of the post card and the keyboard-inoperable team filter are all fixed.
The front-matter schema is now genuinely uniform: one key fingerprint per
collection across 370 records, zero typo'd keys, and every `location`,
`facet_title`, `facet_specializations` and `team-pinned` value resolves.

So this pass went looking for what the migration and those fixes left behind.
The findings cluster in three places:

1. **Three production-only failures that no local check could see.** The CSP had
   no `'wasm-unsafe-eval'`, which would have broken site search on every
   deployed page while passing every local test — `_headers` is not applied by
   the dev server. The same directive blocked the only two video embeds on the
   site. And `robots.txt` had been advertising a `/sitemap.xml` that nothing
   generated.
2. **Two personnel records whose LinkedIn URL is a redaction token.** Not a link
   that broke — a value that was never a URL. It was committed that way and has
   been live ever since.
3. **Copy-pasted markup that had drifted rather than merely repeated.** The page
   banner existed nine times with two different wrapper class names; the firm's
   own name was written out in 50 places; two published pages shared a slug and
   silently collided in `pagesBySlug`.

Everything below was verified against the build, not inferred.

Every remaining content gap was then checked against the live pre-migration site
rather than being handed over as an unknown. That closed one item outright — the
"missing" pinned leadership at four offices turned out to match live exactly —
and reclassified four others from *the migration lost this* to *this never
existed*, including `zombie.md`'s wrong body, which the live site ships too.

---

## Measured before → after

| | Before | After |
|---|---|---|
| Broken internal links | 0 | **0** |
| Referenced assets missing from build | 0 | **0** |
| Redirect rules whose target resolves | 104 / 104 | **105 / 105** |
| Pages with an empty canonical | 0 | **0** |
| Duplicate `<title>` groups | 3 | **0** |
| Duplicate `<meta description>` groups | 3 | **0** |
| Meta descriptions over 160 characters | 39 | **0** |
| Pages with a heading-level skip | 346 | **0** |
| …of which fixed with no visual change | — | **all but 6 pages** |
| `<img>` with no `alt` attribute | 0 | **0** |
| Pages with duplicate element IDs | 0 | **0** |
| Truly orphaned assets | 22 | **20**, every one owned by a draft/private record |
| Dead external links | 1 | **0** |
| External URLs that are not URLs | 2 | **0** |
| Places the string "Prosperity Partners" is written out | 50 | **1** |
| Copies of the page-banner block | 9 | **1** |
| Duplicate page slugs | 2 | **0** |
| Pages advertising an XML sitemap that exists | no | **yes (361 URLs)** |

---

## Critical — fixed

🔴 **The CSP would have broken site search on every deployed page.**
`site/_headers` set `script-src 'self' 'unsafe-inline' …` with neither
`'wasm-unsafe-eval'` nor `'unsafe-eval'`. Pagefind's index is a WebAssembly
module (`_site/pagefind/wasm.en.pagefind`, `wasm.unknown.pagefind`) and Chromium
refuses `WebAssembly.instantiate` without one of those. Every search on
Cloudflare Pages would have failed with `search.js`'s "Search is unavailable on
this build."

The reason this is worth calling out beyond the one-line fix: **`_headers` is
not applied by the dev server**, so this could never fail locally. It would have
passed every `npm start` check and shipped. A banner now says so at the top of
the file, and `search.js`'s catch block — which previously blamed the wrong
cause ("the index is only present in a production build") — names this one.

🔴 **The same directive blocked both video embeds.** `frame-src` listed only
`*.greenhouse.io` and Turnstile, so the Vimeo player on
`/whats-new/ppp-loan-forgiveness/` and the YouTube embed on
`/culture/team-j-or-a/` rendered blank in production. Both hosts added; verified
rendering in the browser.

`media-src` is also now spelled out rather than inherited from
`default-src 'self'`, because the three CDN videos in README §9.3 will be
blocked by `'self'` the day that base URL lands.

🔴 **`robots.txt` advertised a sitemap that did not exist.** The line
`Sitemap: https://www.prosperityllc.com/sitemap.xml` has been there since the
redirects landed; README §9 Phase H listed `sitemap.xml` as outstanding. The
robots line went in ahead of the file, so it pointed at a 404.

Now generated: `site/pages/sitemap-xml.njk` (24 lines) over a new `sitemapUrls`
collection — 361 URLs, `application/xml`, excluding `/search/`, `404` and the
paginated archive pages. It is also the **only consumer of `date_modified`**,
which all 370 records have carried since the import and nothing read.

🔴 **Two personnel records carry a redaction token where a URL should be.**
`alexander-brunek.md` and `kasie-dlubala.md` had
`linkedin_url: https://www.linkedin.com/in/<name>-[REDACTED_HSHD]` — a tool
output with the profile slug replaced by a redaction marker, written straight
into the record.

It was introduced in `31de9c0` ("linkedin part1 + missing portraits"), which is
also the commit that *created* the field, so there is **no clean version in
history to restore**. Both are blanked with the provenance recorded in the
frontmatter; the templates already omit the badge for the 65 people who have no
LinkedIn, so nothing renders broken. **These two URLs need to be re-supplied.**

This is the one finding that only the external sweep could have caught — every
internal link check passes it, because the value is an external URL.

**The live site cannot supply them.** Neither `/personnel/alexander-brunek/` nor
`/personnel/kasie-dlubala/` has a personal LinkedIn badge there — only the
firm's company link in the footer. This repo in fact has *more* LinkedIn
coverage than live (Cathy Attig has a URL here and none there), so the 133 URLs
came from separate research — the same pass that produced these two broken
values.

---

## Important — fixed

🟡 **`/sitemap/` was in the search index and outranked real pages.** It lists the
title of every page, post and location, so it matched nearly any query — exactly
the failure `noIndex` on the two archives exists to prevent, as `base.njk`'s own
comment explains. It also listed itself. Both fixed; verified that a search for
"tax" (195 results) no longer returns it.

🟡 **`| safe` in body and attribute position emitted invalid HTML.** The same
field was rendered five different ways. `| safe` is correct in the
`eleventyComputed` blocks (those strings are rendered twice — `base.njk`
documents it), but in an ordinary template body it disables the escaping that
should happen:

```
_site/sitemap/index.html   …with Bowling & Team Bonding</a>   ← bare &, invalid
_site/culture/…/index.html <h1>Vermont … Bowling &amp; Team…  ← correct
```

Removed at the six body/attribute call sites. Two of them
(`post-card.njk`, `post.njk`) were putting unescaped content **inside an
attribute value**, where a title containing a quote would have broken out of it.
Verified across the whole build: 0 bare `&` in any attribute, 0 double-escapes.

🟡 **488 post images carried invented alt text.** `post.njk` generated
`alt="Prosperity Partners team members at {title}"` for every image on every
post — false on each award, podcast and press-release post, and unverifiable on
the rest, since nothing in the record says what any photo shows. WCAG treats
invented filler as worse than nothing, so these are `alt=""` until an editor can
describe them. **The real fix is an `alt` field beside each entry in `images`
when `pages/` gets its CMS collection** (README §6b).

🟡 **Card figures announced their own title twice.** `post-card.njk` and
`search.js` set `alt="{title}"` on an image sitting inside the same `<a>` as the
`<h3>` carrying that title. *This corrects my own initial read:* `alt=""` on the
team portraits is right — the name is in the same link — and the post card was
the outlier. One rule now, stated once in `team-card.njk` and referenced from
the other two.

🟡 **An `<h2>` sat above the `<h1>` on 304 pages.** `post.njk` and
`personnel.njk` emitted the parent-archive link as a heading. The comment two
blocks down records demoting the *date* for exactly this reason; the link above
it was missed. Both are `<p>` now — `.page-banner-title` is styled by class, so
nothing moved.

🟡 **Heading-level skips: 346 pages → 0.** Beyond the inversion above, the
causes were all structural: the footer's three column headings were `<h3>` with
no `<h2>` anywhere, the office grid had no heading at all, the archive and
directory card titles sat directly under the page `<h1>` at `h3`, and
`contact-form.njk` carried a visually-hidden `<h3>` that could not be the right
level in both places the form renders.

- footer column headings → `<h2>`; the office grid gets a visually-hidden
  `<h2>Our offices</h2>` above its per-office `<h3>`s
- `postCard` and `teamCard` take a `level`: `h2` where the cards are the page's
  own content (archives, `/meet-the-team/`), `h3` where they sit under a section
  heading (homepage, location pages — the latter gains a visually-hidden
  `<h2>{Office} team</h2>`)
- the form is labelled with `aria-label` instead of a hidden heading, which
  takes it out of the outline entirely

The remaining 11 were authored in the content, and splitting them by **what
actually sizes the heading** is what made them cheap:

| | Sized by | Relevel cost |
|---|---|---|
| `services-grid-item-title` (26), `content-block-tiles-item-title` (8) | their own class, `1.25em` | **none** — `h3` → `h2`, nothing moved |
| `content-block-sidebar-member-title` (45), `-member-location` (45), `post-date` (9), `team-member-title` (198) | their own class, 16–18px at weight 400 | **none** — and these are a job title, an office and a date, not headings at all → `<p>` |
| bare `<h3>` inside `.content` (6 pages) | the element selector, `1.375em` → `1.625em` | **visible, +18%** — accepted |

The last row is the only one that changed anything on screen: section headings
on `/sms-privacy-policy/`, `/payment/`, `/transaction-advisory-services/` and
two bios went 22px → 26px, and `/payment/`'s "Simple. Secure." banner tagline
became a `<p>` at 16px instead of an `<h5>` at 18px. Verified in the browser,
element by element, that nothing in the first two rows moved.

*An earlier draft of this report said all 11 sat inside `.content` and therefore
all traded against visual parity. That was wrong for 5 of them, and wrong in the
expensive direction — it would have deferred free fixes to Phase F.*

🟡 **Personnel meta descriptions were unbounded in both directions.** Three
templates wrapped the whole expression in `| truncate(160)`; `personnel.njk`
truncated only the bio fragment to 110 and then *prepended* name + title +
office. 16 people ran 166–181 characters, and `/personnel/ivan-martinez/` shipped
`"Ivan Martinez, Associate — Chicago. "` — 36 characters and a trailing space,
because his bio is empty. Now truncated as a whole with a floor for the empty
case. **0 descriptions site-wide now exceed 160 characters.**

🟡 **12 paginated pages shipped one identical title and description.** All 8
`/culture/` pages and all 4 `/whats-new/` pages, with no `rel="prev"`/`"next"`
telling a crawler they were a series. Each now carries "Page N of M" and the
relations. The 309-character blurb that was doing duty as both page copy and
meta description is now two fields: the blurb stays in the banner, and each
archive has a purpose-written summary.

🟡 **`/location/mumbai/` shipped an empty `<address></address>`.** The macro was
called unguarded while `banner_image` two lines up was guarded; Mumbai has no
address, phone or tel. The macro guards itself now.

🟡 **Embedded forms were indexed as page content.** `injectContactForm` rendered
forms without the `data-pagefind-ignore` that `cta.njk` applies, so "First
name" / "Send Message" were search-indexed text on every page carrying one.

---

## Content — fixed

🟡 **`zombie.md` shipped the wrong post body.** "Trapped in a Room with a Zombie"
(2015) carried a body **byte-identical** to `firm-retreat.md` — the 2018 15-year
anniversary copy — which also made the two pages share a meta description. The
**live site ships the same wrong body** — `https://www.prosperityllc.com/zombie/`
carries the identical firm-retreat text. So this is not import damage; it is a
pre-existing error in the source CMS that the migration copied faithfully, which
means there is nothing to recover, here or from the old site. The body was
removed rather than left wrong on a live page, with the provenance in the
frontmatter, and the post now renders as title + date + photo like the other
image-led entries. **The real copy has to be written.**

🟡 **A mockup page was published.** `online-payment.md` was `status: publish`
with `"title": "Online Payment (mockup for payment page)"` — that string was the
live `<title>` of `/online-payment/` — duplicating the real `/payment/`. Now a
draft, with a 301 to `/payment/`. Nothing linked to it but the sitemap.

🟡 **Two published pages shared a slug and silently collided.** `pagesBySlug` is
built with `Object.fromEntries`, so a repeated slug drops the earlier record.
`transaction-advisory-services` was held by two **published** pages with
identical titles and different bodies (3.2 KB vs 9.7 KB);
`valuation-services` by a published page and a draft.

Both resolved by qualifying the nested page's slug with its parent, which
changes no URL (`path` drives the permalink, `slug` only the lookup). The Tax
child is now titled "Tax Transaction Advisory Services" — which is what the
parent page's own link text has always called it.

🟡 **`contact-us-thank-you.md`** shipped an un-substituted Yoast variable:
`"Thank You for Contacting Us %%page%%"`.

🟡 **Invisible and lookalike characters.** 2× U+2028 LINE SEPARATOR in
`special-projects-books-publications.md` — legal in JSON, **illegal in a raw JS
string literal**, so it would break any JSON→JS inlining; 4× U+2010 HYPHEN and
1 more in `evan-landmann.md`, visually identical to `-` and breaking every
string match; 1× U+200B. A sweep of the whole content tree now finds none.

🟡 **Lorem ipsum** removed from `valuation-services.md`. It is a draft so it did
not ship, but it was one `status` change away from doing so.

---

## Boilerplate — fixed

**The firm's name was written out in 50 places.** `base.njk` emitted
`<title>{{ title }}</title>` raw, so `" - Prosperity Partners"` was hardcoded in
nine templates (`index.njk` used `" | "`) and baked into 41 of 55 page records —
and the 14 records without it shipped bare titles (`/accounting-technology/`,
`/meet-the-team/`, `/online-payment/`). The brand is appended once in `base.njk`
now, tested by containment so a title that already names the firm (the
homepage's, `home.md`'s) is left exactly as written. Verified across all 373
pages: every one names the brand exactly once. `search.js` derives it from the
rendered title rather than holding a 51st copy.

**The page banner existed nine times, with two names for the same wrapper.**
Five templates used `page-banner-content-container`, four `page-banner-container`
— and **neither has a CSS rule**; `.container` does the layout, so the split was
pure drift. The figure was guarded in four copies and unguarded in two (so a
record with no image rendered `<img src="">`), and `location.njk` carried an
entirely empty content block. All nine now call one `page-banner.njk` macro.

**The two archives were one template written twice.** They must stay two files
— Eleventy paginates one collection per file — but each also repeated its own
309-character description twice within its own frontmatter. They are now two
7-line shells over `site/pages/archives/archives.11tydata.js`, which holds the
layout, `noIndex`, the permalink logic, the title, the description and the OG
image. This is the arrangement `site/content/<type>/` already uses.

**Smaller ones:** the non-attest footnote was hardcoded in `footer.njk` while
`data/global.json` held the identical string as `non_attest_note`, read by
nothing — the data wins now. `sitemap.njk` hardcoded `/culture/` and
`/whats-new/`, the exact two values `data/post-categories.json` exists to own.

---

## Dead code and misleading comments — fixed

**Dead code removed:** `content-blocks.njk`'s macro carried a `raw:` arm that
could not run (the loop dispatches every `raw:*` before calling it).
`canonicalUrl` was set by two templates to byte-for-byte what the fallback
produces, each hardcoding a domain `global.site_url` already owns — both gone,
and the fallback is now the only path. `ogTitle` was read by `base.njk` and set
by nothing, anywhere. `card--search` was emitted by `search.js` and had no CSS
rule.

**Comments that contradicted the code.** These are worse than no comment,
because a reader trusts them:

| Where | Said | Actually |
|---|---|---|
| `search.js` | index absent under `npm start` | built by the `eleventy.after` hook, so present in both — and the branch really catches the CSP/WASM failure |
| `search.njk` | "see package.json build" | `package.json`'s build script has no Pagefind step |
| `team-card.njk` | 7 records have no headshot | 2 |
| `posts.11tydata.js` | "a stray `{{` in a **bio**" | copy-pasted from the personnel file; these are posts |
| `eleventy.config.js` | the `_data/*.js` wrappers "used to" exist | both are still live, doing a different job |
| `eleventy.config.js` | `pagesBySlug` exists so `index.njk` need not restate its record | `index.njk` never references it and restates every word |
| `data/missing-media.md` | Decap | Sveltia (README §6b has it right) |

**Latent traps now documented in place:** `formEnv` is a separate Nunjucks
environment with **no Eleventy filters registered** — `contact-form.njk` uses
none today, which is the only reason it works; the first filter added there will
render fine inside `cta.njk` and throw inside `injectContactForm`. That same
path was doing an uncached `readFileSync` + `JSON.parse` of `global.json` **once
per placeholder**, while the category cache twelve lines above it exists with a
documented 14%-of-build-time rationale; it is cached the same way now.

**`site/admin/`** existed as an empty directory — untracked (git does not track
empty dirs), absent from the build, producing nothing. Removed; `/admin` is
Phase I.

---

## Two build inputs were untracked

`data/post-categories.json` (read at `eleventy.config.js:158`) and
`site/_includes/office-address.njk` (imported by `footer.njk` and
`location.njk`) were the only two untracked files in the tree, and both are
required — **a fresh clone or CI checkout would not have built.** Both staged.

---

## Links and assets

**Internal: clean, and stayed clean.** 0 broken links and 0 missing asset
references across 1,223 distinct internal references, before and after. All 105
redirect rules resolve, and no redirect source shadows a real page.

**External: one dead link in 205.**
`journalofaccountancy.com/Issues/2009/Apr/PrivateEquity.htm` (cited on
`/special-projects/books-publications/`) 404s; the article moved to
`/issues/2009/apr/privateequity/`, verified 200, and the link is repointed.

Everything else that returned non-2xx is a bot block, not a dead link: 115
LinkedIn `999`s, 17 `403`s (BusinessWire, Aiwyn, WorldCat, Vimeo's player
endpoint, BestCompaniesGroup, Crain's), 2 LinkedIn `429`s. These serve normally
to a browser. **The `403`/`999` classes cannot be distinguished from genuine
rot by any automated sweep** — if these links matter, they need eyes.

**Normalized:** 25 `linkedin_url` values had a trailing slash and 110 did not;
one used the regional host `in.linkedin.com`. All 133 are now
`https://www.linkedin.com/...` with no trailing slash.

**Checked and left alone:** `boards.greenhouse.io` and
`job-boards.greenhouse.io` look like an inconsistency and are not — the first
serves the embed loader script, the second the hosted job board. Both correct.

**Orphaned assets: 22 → 20.** Two were genuinely unreferenced and are deleted
(`img/linkedin.png`, superseded by the footer's inline SVG; `img/ui/arrow-grey.png`).

*A correction worth recording:* the first pass reported four dead assets. It was
wrong — `bg-banner-swoop.svg` and `ui/next.png` are referenced from CSS `url()`,
which an HTML-attribute scan does not see. **Any orphan check on this repo has
to read `style.css` too.** The remaining 20 all belong to draft or private page
records; deleting them would make those pages unrecoverable, so they stay.

---

## Left open — deliberately

**`/accounting-technologyold/`.** README §11.3 already lists this `private`
record as an open client decision ("presumably dead"). Deleting it would
pre-empt that, so it and its two images stay.

**`home.md` is still rendered by nothing.** It is `status: publish` with seven
blocks; `index.njk` hardcodes all of it. That is README §11's open decision, not
an oversight — but it is *why* `/assets/img/pages/home.jpg` is an orphan, and
the `pagesBySlug` comment now says so instead of claiming `index.njk` uses it.

**47 titles over 60 characters**, all long post titles. Editorial.

**The `| safe` trust boundary, now that Sveltia is the target.** Every block body
renders through `| safe`, which is correct while `blocks[]` is developer-edited.
README §6b says `pages/` needs a custom block-editing widget before it can go
into the CMS — the moment a non-developer can put HTML into `blocks[]`, that
`| safe` is a stored-XSS path. The 2026-09-17 review raised it; it is still
open. **Decide it before `pages/` is added to `config.yml`, not after.** This is
the one open item with a deadline rather than a preference.

---

## Checked against the live site

Every remaining content gap was compared against the pre-migration site at
https://www.prosperityllc.com, to separate *the migration lost this* from *this
was never there*. The answer was the second one every time — **the migration is
faithful** — and one supposed gap turned out not to be a gap at all.

| Gap | Live site | Verdict |
|---|---|---|
| 4 offices with no pinned leadership | `kansas-city`, `mumbai`, `washington-dc` and `washington-dc-transaction-advisory` are in **pure last-name order** on live too | **Not a gap.** Our output already matches live exactly. Closed. |
| `zombie.md`'s body | ships the identical wrong firm-retreat text | pre-existing CMS error, not import damage |
| 2 broken `linkedin_url`s | neither person has a personal badge on live | unrecoverable; this repo has *more* LinkedIn coverage than live |
| 32 pages with no `meta_description` | **0 of 31** checked have one on live | never existed; matches the 335/365 in the 2026-08-20 SEO audit |
| 14 people with no Service Line | all 14 carry **no** service-line class on live | pre-existing; they are unfilterable on live too |
| Washington DC label mismatch | live uses `Washington DC - TAX` in the filter and an en dash in location names | **the same split**, carried over verbatim |

That last one is worth being explicit about: the en-dash/hyphen and
Title-Case/ALL-CAPS mismatch between `data/team-filters.json` and the location
records looks like a bug, and it is an inconsistency — but it is *live's*
inconsistency, reproduced exactly. Changing it is a copy decision that deviates
from parity, so it is left for the client rather than quietly normalized.

---

## Still needs a person

Reduced, after the live-site check, to things that genuinely do not exist
anywhere:

- **`zombie.md`'s body.** Has to be written. Nothing to recover.
- **Two LinkedIn URLs** — `alexander-brunek`, `kasie-dlubala`.
- **Service Line for 14 people**: `alexi-smith`, `blake-rath`,
  `brandon-kagerbauer`, `brock-lock`, `carlos-salgado`, `doug-dellinger`,
  `harry-cendrowski`, `ivan-martinez`, `jennings-fussell`, `joseph-belcher`,
  `keyshawn-andress`, `loise-kyalo`, `sarah-bassett`, `walter-m-mcgrail`. Two of
  them are pinned Detroit leadership — pinned but unfilterable.
- **32 meta descriptions** on published pages. Nothing ships empty — `page.njk`
  has a four-step fallback — but they are generic. This is new copy, not
  recovered copy.
- **Washington DC: one label or two?** (above)
- **Four empty record bodies**: `anthony-fontana`, `ivan-martinez`,
  `congratulations-daniel-moore-promoted-to-senior-tax-associate`, `mumbai`
  (which also has no address or phone).
- **Personnel bio drift** — `EXPERTISE` in three spellings (`**EXPERTISE:**` 116,
  `**EXPERTISE**` 43, `**Expertise:**` 15), the dozen intended Q&A prompts in
  ~40 variants, and a real typo (`**Favorite Move Quote**`, 2 files). Mechanical
  but 200 files of copy — its own pass.

---

## Verified clean

Stated so a later reader does not re-derive it: 0 broken internal links; 0
referenced-but-missing assets; 373/373 pages with `lang`, exactly one `<h1>`, a
non-empty canonical and a non-empty meta description; 0 duplicate element IDs; 0
`<img>` without an `alt` attribute; 0 double-escaped entities; 0 bare `&` in any
attribute; no CRLF, no trailing whitespace, no tracked `.DS_Store`, no
`console.log`, no `debugger`. `eleventy.config.js` has no unused filters or
collections — all 12 and all 11 are used. The CSP now covers every external
origin the build loads, with 0 blocked. Front-matter schema is uniform across
all 370 records. The three `TODO: VIDEO CDN URL NEEDED` markers are the
documented §9.3 placeholders, matching `data/missing-media.md` exactly. README
§6's layout table, §7's colour tokens and §5's counts were spot-checked and are
accurate — §7's raw-hex claim in particular holds: all ten raw hex values
outside `:root` are the vendor-prefixed gradient fallbacks it describes.

## Note on method

Two checks in this review would each have passed a superficial version of
themselves and been wrong:

- The CSP cannot be verified by loading the site locally, because `_headers` is
  not applied by the dev server. It was verified by parsing the directives
  against the set of origins the build actually loads.
- The orphan-asset check was wrong on its first run because it read only HTML
  attributes. Two live assets were on the delete list.

Both are worth repeating the same way next time.

A third is the reason this pass ended at zero heading skips instead of eleven.
The first read of those eleven assumed the `.content h2`/`h3` element rules
sized them, and concluded they all traded against Phase F. Reading the computed
style instead showed that most of those headings carry their own sizing class,
so the element could be corrected for free — and that two of the patterns were
not headings at all. **The assumption was not merely wrong; it was expensive in
the wrong direction**, deferring free work indefinitely. Where a fix looks like
it costs something, check what is actually doing the work before deciding.

The live-site comparison earned its place the same way: four findings were
written up as migration damage and turned out to be inherited, and a fifth —
four offices supposedly missing pinned leadership — was not a defect at all.
