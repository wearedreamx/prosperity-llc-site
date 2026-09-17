# Prosperity Partners — Website Audit

> Audit date: 2026-08-20
> Audited by: DreamX
> Site URL: https://www.prosperityllc.com
> Platform: the site's previous CMS (pre-migration)
> Pages reviewed: 365 of 365 known pages (100%). The site itself contains 368 distinct URLs; 3 are pagination/archive pages (e.g. `/culture/page/7`) and a sitemap listing page that sit outside the 365-page sitemap count — these are covered in this audit but not counted toward the baseline, since they're not standalone content pages.

## Executive Summary

Prosperity Partners' site is content-rich and well-organized at the page level — every one of the 198 personnel bios is complete with a name, role, location, photo, and a genuine written bio, and there's no lorem ipsum, no zeroed-out stats, and no broken internal links anywhere on the site. The biggest risks are concentrated in a handful of high-visibility spots rather than spread evenly: the homepage hero text renders invisible (white text on a white background) whenever the background video hasn't loaded, the homepage has no `<h1>` at all, and three service sub-pages have a "Meet our Group Leader" section with the heading but no leader filled in. Accessibility is the area needing the most attention — 832 content images have empty alt text, every personnel page's LinkedIn badge is an unlabeled icon link, and two header/footer navigation menus disagree on service names. None of this requires a rebuild; it's a focused list of fixes concentrated on the homepage, a few templates, and image alt text.

## Critical Issues

🔴 **Homepage hero text is invisible against its own background.** The H2 "Elevate Your Potential" and the tagline "Partner for Growth." render in white (`rgb(255,255,255)`) on a white background. The hero has a `<video>` element behind this text (`Home.mp4`) that's meant to provide contrast, but the text has no fallback color or scrim for browsers/situations where the video doesn't load (slow connections, autoplay blocked, video failing to fetch) — in those cases, the site's own primary headline is unreadable. Add a solid or semi-transparent dark background/scrim behind the hero text as a fallback, independent of whether the video loads.

🔴 **The homepage has no `<h1>`.** Every other page on the site has exactly one `<h1>`, but the homepage jumps straight to `<h2>Elevate Your Potential</h2>`. This is both an SEO issue (search engines use the `<h1>` to identify a page's primary topic, and the homepage is the page most likely to be evaluated for the site's core keywords) and an accessibility issue (screen reader users rely on `<h1>` to confirm they've landed on the right page). Promote the hero heading to an `<h1>`, or add a visually-hidden `<h1>` (e.g. "Prosperity Partners — Accounting, Tax & Advisory Services") if the visual hero text needs to stay as-is.

🔴 **Three "Meet our Group Leader" sections are blank.** `/client-accounting-services/fractional-cfo`, `/tax-services/estate-gift-trust-taxes`, and `/tax-services/state-and-local-taxes` all have the "Meet our [Service] Group Leader" heading, but no name, title, location, or photo follows it — the section jumps straight from the heading into the generic closing tagline and contact form. Every sibling page in the same service family (e.g. `/client-accounting-services/accounting-discovery`, `/tax-services/individual-taxes`) has this section correctly filled in with a real team member. This is a template field left empty on three specific pages, not a missing feature — it reads as broken/unfinished to a visitor who compares it against any neighboring service page.

🟡 **Personnel cards on location pages use the browser's unstyled default link color.** On `/location/burlington/` (and likely other location pages using the same team-member card component), names like "Cathy Attig" and "Matt Johnson" render in the browser's default link blue (`rgb(0,0,238)`) against a black background — a 2.23:1 contrast ratio, well below the 4.5:1 WCAG AA minimum. This pattern reads as a missing CSS rule (an unstyled link falling back to browser defaults) rather than an intentional design choice, since every other link on the site uses the brand's styled link colors.

## Content & Copy Issues

⚠️ **Two personnel bios switch to UK spelling mid-answer.** The site's bio template prompt is "Favorite thing about my job" / "Favorite vacation you've taken" (US spelling), but the written answers on `/personnel/priya-desai` ("one of my favourite aspects...") and `/personnel/sandeep-guha` ("my favourite vacation was...") use "favourite." Minor, but noticeable since it's inconsistent within the same sentence pattern used on every other bio. Change to "favorite" to match the rest of the site's US English.

⚠️ **"Career" is misspelled "Caeer" in a meta description**, appearing on both `/fall-career-fairs/` and `/pinstripes/` ("Fall Caeer Fairs"). Since it's not visible on-page (it only shows in a search-engine result snippet or social share preview), it's easy to miss, but it is public-facing.

💡 **Older Culture posts still refer to the firm as "NDH."** 23 archived Culture/blog posts (mostly 2020–2023 holiday parties, team outings, and firm milestones — e.g. `/2021holidayparty`, `/camp-aramoni`, `/culture/page/6`) refer to the company casually as "NDH" or "NDHers," reflecting the firm's name before its 2024 rebrand to Prosperity Partners (confirmed on `/ndh-advisors-rebrands-as-prosperity-partners`). This is understandable as historical archive content and not necessarily wrong, but worth a deliberate decision: either leave it as-is (it's dated content, visitors will infer the history) or add a brief note/rename pass if brand consistency across the full archive matters more than preserving the original posts verbatim.

## UX & Structure Issues

🟡 **No FAQ section anywhere on the site.** Across all 365 pages, the word "FAQ" or "Frequently Asked Questions" appears exactly once (on `/payment`, referring to payment FAQs elsewhere, which don't actually exist on that page either). For a professional-services site where prospective clients have real, recurring questions before engaging (pricing structure, onboarding process, what documents to prepare, how billing works), the complete absence of any FAQ is a missed opportunity to pre-empt objections on the service pages or a dedicated FAQ page.

🟡 **No accordion or collapsible UI anywhere on the site**, despite several pages being dense enough to benefit from one. `/payment` has a multi-step "How to get started" list followed by a "Why use the portal" list with several sub-points; `/careers` and the service pages stack multiple sub-services in a row. None of these use `<details>` or any accordion/toggle pattern — everything is presented as one continuous scroll. This isn't wrong, but for the two or three densest pages (Payment, the service overview pages), a collapsible FAQ or step-by-step component would reduce how much a visitor has to scroll past to find the part relevant to them.

💡 **Header and footer/mobile navigation disagree on service names and structure.** The header's "Services" submenu lists: Client Accounting Services, Tax Services, Family Office Services, Special Projects, Assurance, Transaction Advisory Services. The footer/mobile menu's "Services" submenu instead lists: Accounting Services, Tax Services, Family Office Services, **Valuation Services**, Assurance, Transaction Advisory Services — dropping "Special Projects" as a category and promoting one of its sub-items ("Valuation Services") to that slot instead, while also shortening "Client Accounting Services" to "Accounting Services." A visitor using the footer nav sees a different service list than one using the header nav for the same site. Worth reconciling to one canonical set of service names and structure.

⚠️ **The footer/mobile nav's "Valuation Services" link uses a raw query-string URL** (`/?page_id=5121`) instead of a clean permalink like every other link in that same menu (e.g. `/tax-services/`, `/assurance/`). Cosmetically this is invisible to a visitor, but it suggests that menu item was added without ever being assigned a proper slug — worth fixing for URL consistency and because query-string URLs are more fragile if the site's permalink structure or ID numbering changes.

## Conversion Issues

🟢 **No dedicated final CTA before the footer on interior service pages.** Pages like `/tax-services`, `/assurance`, `/client-accounting-services`, and `/special-projects` end their content and go straight into the footer navigation — there's no closing "Ready to talk to our team?" moment separate from the contact form embedded partway up some (but not all) of these pages. Not urgent, since a contact form is present on many pages, but a consistent, visible closing CTA across every service page would give visitors who scroll to the bottom without converting one more clear next step.

## Content Improvements by Page

**Homepage (`/`)**
- Promote the hero H2 to an `<h1>`, or add a visually-hidden `<h1>` (see Critical Issues).
- Add a fallback background color/scrim behind the hero text so it's never white-on-white (see Critical Issues).

**`/client-accounting-services/fractional-cfo`**
- Fill in the "Meet our Fractional CFO Group Leader" section with a name, title, location, and photo — currently blank.

**`/tax-services/estate-gift-trust-taxes`**
- Fill in the "Meet our Estate, Gift & Trust Tax Group Leader" section — currently blank.

**`/tax-services/state-and-local-taxes`**
- Fill in the "Meet our State and Local Tax Group Leader" section — currently blank.

**`/personnel/priya-desai`, `/personnel/sandeep-guha`**
- Change "favourite" to "favorite" to match US spelling used everywhere else on the site.

## Technical Issues

✅ **No broken internal links found.** Every internal link on the site resolves to a real, existing page — no dead links, no 404s detected from internal navigation.

🟡 **Duplicate content: Transaction Advisory Services exists at two different URLs.** `/transaction-advisory-services/` and `/tax-services/transaction-advisory-services/` render different body copy under the identical page title ("Transaction Advisory Services - Prosperity Partners") but describe the same service — both are actively linked from the site's main navigation (the second is labeled "Transaction Advisory Tax Services" in the nav). This is a genuine duplicate-content situation, not just a stray unused page, and is covered in more depth in the standalone SEO report.

🟡 **Twelve URL pairs differ only by a trailing slash**, all under `/culture` and `/whats-new` pagination (e.g. `/culture/page/3` and `/culture/page/3/` both resolve and were both captured as separate pages with identical content). This is typically harmless on that platform (both usually redirect to the same canonical page), but worth a quick check that a redirect/canonical rule is actually in place rather than serving both as independently indexable duplicates. See the standalone SEO report for the full list.

## Accessibility Issues

This audit found meaningful accessibility gaps concentrated in image alt text, unlabeled interactive elements, and heading structure. **This is a static-HTML scan with limited keyboard checks (focusability, tab-order anti-patterns, focus-indicator visibility) — it is not a substitute for a full WCAG audit using a real screen reader or manual assistive-tech pass**, and it cannot verify actual screen-reader announcement behavior. See `prosperity-partners-accessibility-audit.md` for the complete findings, methodology, and priority list — this section summarizes only the top issues.

- **832 content images have empty alt text** (`alt=""` on photos, not icons) — most concentrated on Culture/event photo galleries (`/pinstripes/`, `/holiday-party-at-ftw/`, `/2021holidayparty/`, and similar posts each have 15–33 unlabeled photos).
- **Every personnel page's LinkedIn badge is an icon-only link with no accessible name** — the image has `alt=""` and the link has no other text or `aria-label`, so it's invisible to a screen reader as an actionable link. This repeats identically across all ~190 personnel bios with a LinkedIn link.
- **The homepage has no `<h1>`** (see Critical Issues — this is both an accessibility and SEO finding).
- **352 pages have a skipped heading level** (commonly H2 straight to H4 in card/grid components), which breaks the logical heading hierarchy a screen reader user relies on to navigate by section.
- **The Client Portal login form's username and password fields have no associated `<label>`** — only placeholder text, which isn't reliably announced and disappears once the user starts typing.
- **Personnel cards on location pages use an unstyled default link color that fails contrast** (see Critical Issues) — a 2.23:1 ratio, well below the 4.5:1 WCAG AA minimum.
- **The automated contrast checker also flagged thousands of instances of dark text inside the site's dropdown/mobile navigation menus and a personnel filter dropdown as "low contrast."** These are not real issues — that markup is only visible when a visitor opens the menu or filter (it's hidden by default via CSS), and the checker doesn't currently account for that. They're excluded from the counts above.

## SEO Issues

This covers on-page technical SEO only — not keyword strategy, backlinks, or page speed. See `prosperity-partners-seo-audit.md` for the complete findings and priority list — this section summarizes only the top issues.

- **335 of 365 pages have no meta description.** Search engines will generate a fallback snippet, but this is a low-effort, high-leverage fix, especially since most of the missing ones are blog/culture posts that could use their existing excerpt text as the description.
- **The homepage has no `<h1>`** (see Critical Issues).
- **Duplicate content at two URLs for Transaction Advisory Services** (see Technical Issues above) — a real ranking/indexing risk since both pages currently target the same topic.
- **53 page titles exceed 60 characters** and will truncate in search results, mostly on Culture/blog posts with long descriptive titles.
- **88 pages are missing at least one Open Graph tag** (`og:title`, `og:description`, or `og:image`), meaning some pages will show a blank or generic preview when shared on social media or in messaging apps.
- **"Career" is misspelled "Caeer" in the meta description shared by `/fall-career-fairs/` and `/pinstripes/`** (see Content & Copy Issues) — visible in search results and social previews.

## Priority Action Plan

| Priority | Action | Type | Page |
|---|---|---|---|
| 1 | Add a fallback background/scrim behind hero text so it's never invisible | 🔴 Critical | Homepage |
| 2 | Add or promote an `<h1>` on the homepage | 🔴 Critical | Homepage |
| 3 | Fill in the blank "Meet our Group Leader" section | 🔴 Critical | `/client-accounting-services/fractional-cfo` |
| 4 | Fill in the blank "Meet our Group Leader" section | 🔴 Critical | `/tax-services/estate-gift-trust-taxes` |
| 5 | Fill in the blank "Meet our Group Leader" section | 🔴 Critical | `/tax-services/state-and-local-taxes` |
| 6 | Fix unstyled default-blue link color on personnel cards | 🔴 Critical | `/location/burlington/` and similar location pages |
| 7 | Add accessible names to LinkedIn icon links (aria-label or visible text) | 🟡 Important | All personnel pages |
| 8 | Add alt text to content photos, starting with Culture/event galleries | 🟡 Important | Culture/event pages |
| 9 | Reconcile header vs. footer/mobile "Services" menu naming and structure | 🟡 Important | Sitewide navigation |
| 10 | Resolve duplicate Transaction Advisory Services content at two URLs | 🟡 Important | `/transaction-advisory-services/`, `/tax-services/transaction-advisory-services/` |
| 11 | Add meta descriptions, prioritizing highest-traffic pages first | 🟡 Important | Sitewide (335 pages) |
| 12 | Add `<label>` elements to the Client Portal login form | 🟡 Important | `/client-portal/` |
| 13 | Fix skipped heading levels in card/grid components | 🟢 Nice to have | Sitewide (352 pages) |
| 14 | Add a FAQ section, at minimum on the highest-consideration service pages | 🟢 Nice to have | Service pages |
| 15 | Consider an accordion/collapsible component for the Payment and service pages | 🟢 Nice to have | `/payment/`, service pages |
| 16 | Fix "favourite" → "favorite" spelling | 🟢 Nice to have | `/personnel/priya-desai`, `/personnel/sandeep-guha` |
| 17 | Fix "Caeer" → "Career" typo in meta description | 🟢 Nice to have | `/fall-career-fairs/`, `/pinstripes/` |
