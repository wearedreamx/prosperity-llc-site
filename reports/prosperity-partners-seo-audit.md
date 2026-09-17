# Prosperity Partners — SEO Audit

> Audit date: 2026-08-20
> Audited by: DreamX
> Site URL: https://www.prosperityllc.com
> Platform: the site's previous CMS (pre-migration)
> Pages reviewed: 365 of 365 known site pages (100%)

## Scope and Methodology

This is a technical on-page SEO scan — page titles, meta descriptions, canonical tags, Open Graph tags, and heading structure. **Explicitly out of scope, and not covered anywhere in this report:** keyword targeting/research, backlink analysis, page speed/Core Web Vitals, structured data/schema.org markup, and robots.txt/sitemap.xml correctness beyond page-count discovery. This is not a full SEO strategy audit.

## Executive Summary

The technical foundation is largely solid — every page has a canonical tag, no page is missing a `<title>`, and Open Graph coverage is reasonably strong (77% of pages have all three key tags). The two issues worth prioritizing are the homepage's missing `<h1>` (a real signal-quality gap on the page most likely to be evaluated for the site's core search terms) and a genuine duplicate-content situation where Transaction Advisory Services content exists at two different URLs with different copy. Beyond that, most findings are volume-driven housekeeping (missing meta descriptions, long titles) concentrated in the Culture/blog archive rather than the core service pages.

## Critical Issues

🔴 **The homepage has no `<h1>`.** The homepage jumps straight from no heading to `<h2>Elevate Your Potential</h2>` — search engines use the `<h1>` as a strong signal for a page's primary topic, and the homepage is the page most likely to be evaluated for the site's core brand and service terms ("Prosperity Partners," "accounting," "tax advisory," etc.). Every other page on the site correctly has one `<h1>`.

🔴 **Transaction Advisory Services content exists at two different URLs with different copy.** `/transaction-advisory-services/` and `/tax-services/transaction-advisory-services/` share the identical page title ("Transaction Advisory Services - Prosperity Partners") but have different body content, and both are actively linked from the site's main navigation — the second is labeled "Transaction Advisory Tax Services" in the nav dropdown. This is a real duplicate/competing-content situation for the same core service topic, not a stray orphaned page. Worth consolidating into one canonical page (with the other redirecting or serving clearly distinct content), since right now both pages are competing against each other for the same search intent.

## Important Issues

🟡 **335 of 365 pages have no meta description** — the large majority of these are individual Culture/blog posts. A missing meta description isn't fatal (search engines generate a fallback snippet from page content), but it's a cheap, high-leverage fix, and for a blog-heavy site like this one, a template default (e.g. auto-populating from each post's excerpt) would close most of this gap in one pass rather than needing 335 individual edits.

🟡 **Several meta descriptions are shared verbatim across unrelated posts, suggesting a copy-paste or bulk-set error rather than intentional reuse:**
- "A Virtual Game of Winning Opinions" → `/2020-holiday-party/` and `/winning-opinions/`
- "2022 Holiday Party" → `/2022-holiday-party/`, `/business-wire/`, `/depaulcareerfair/`, `/game-night/`, `/ndh-receives-private-equity-investment/` (5 pages, none of which are actually about a 2022 holiday party except the first)
- "Prosperity Partners Partner Jeremy Dubow on Chicago's Economic..." → `/crains-article/` and `/ndh-ceo-jeremy-dubow-on-lumiq-podcast-part-one-of-two/`
- "Cycle the Chicago River!" → `/cycleboat/`, `/holiday-party-at-ftw/`, `/skeeball-tournament/`
- "Fall Caeer Fairs" (also a real typo — see below) → `/fall-career-fairs/` and `/pinstripes/`
- "Paint & Sip" → `/ndh-green-team/` and `/paint-and-sip/`

Each group shows unrelated posts sharing one description verbatim — likely from a bulk-import or template default that was never customized per post. Worth writing each one individually, both for search-result accuracy and because a mismatched preview ("Fall Career Fairs" showing up for a post about pinstripes bowling) looks careless when a searcher clicks through.

🟡 **"Career" is misspelled "Caeer" in that shared meta description** ("Fall Caeer Fairs") — visible in search-engine result snippets and social share previews for both `/fall-career-fairs/` and `/pinstripes/`.

🟡 **53 page titles exceed 60 characters and will truncate in search results.** Nearly all are Culture/blog/press posts with long, descriptive titles (e.g. "Jeremy Dubow, CEO of Prosperity Partners, Talks Private Equity and Growth on the Accounting ARC Podcast - Prosperity Partners" at 125 characters). None of the core service pages are affected. Consider trimming the longest ones, particularly press/media mentions where the truncated version might cut off the most important part (the media outlet name or key achievement).

🟡 **88 pages are missing at least one Open Graph tag** (`og:title`, `og:description`, or `og:image`) — these pages will show a blank or generic preview when shared on social media or in messaging apps rather than a proper title/image card.

## Nice to Have

🟢 **12 URL pairs exist with and without a trailing slash** (e.g. `/culture` and `/culture/`, all under `/culture` and `/whats-new` pagination) and both were independently reachable and crawled. Checked directly: both versions of `/culture` and `/culture/` correctly declare the same canonical URL (`https://www.prosperityllc.com/culture/`), so this isn't actually causing duplicate indexing — it's the old platform's normal behavior of serving both forms and canonicalizing to one. No action needed, included here only for completeness.

🟢 **No pages were found with multiple `<h1>` tags** — heading structure is otherwise clean sitewide aside from the homepage gap noted above.

## Priority Action Plan

| Priority | Action | Page(s) |
|---|---|---|
| 1 | Add or promote an `<h1>` on the homepage | Homepage |
| 2 | Consolidate duplicate Transaction Advisory Services content into one canonical page | `/transaction-advisory-services/`, `/tax-services/transaction-advisory-services/` |
| 3 | Write individual, accurate meta descriptions for the mismatched/shared groups | `/2020-holiday-party/`, `/winning-opinions/`, `/2022-holiday-party/`, `/business-wire/`, `/depaulcareerfair/`, `/game-night/`, `/ndh-receives-private-equity-investment/`, `/crains-article/`, `/ndh-ceo-jeremy-dubow-on-lumiq-podcast-part-one-of-two/`, `/cycleboat/`, `/holiday-party-at-ftw/`, `/skeeball-tournament/`, `/fall-career-fairs/`, `/pinstripes/`, `/ndh-green-team/`, `/paint-and-sip/` |
| 4 | Fix "Caeer" → "Career" typo in shared meta description | `/fall-career-fairs/`, `/pinstripes/` |
| 5 | Add meta descriptions sitewide, prioritizing highest-traffic pages first | Sitewide (335 pages) |
| 6 | Add missing Open Graph tags | Sitewide (88 pages) |
| 7 | Shorten the longest page titles, prioritizing press/media mentions | 53 pages, mostly Culture/blog |
