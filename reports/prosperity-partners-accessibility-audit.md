# Prosperity Partners — Accessibility Audit

> Audit date: 2026-08-20
> Audited by: DreamX
> Site URL: https://www.prosperityllc.com
> Platform: the site's previous CMS (pre-migration)
> Pages reviewed: 365 of 365 known site pages (100%)

## Scope and Methodology

This is a static-HTML analysis of every page's markup, plus limited keyboard-accessibility checks captured during rendering (focusability, tab-order anti-patterns, and focus-indicator visibility). **It is not a substitute for a full WCAG audit.** Specifically, it cannot and does not test:

- Real Tab-key navigation or tab order as experienced by an actual keyboard user (a script running inside a page cannot trigger native browser tab-focus advancement — that's an OS-level input boundary browsers enforce for security. What's checked instead: whether an element that should be focusable actually receives focus when `.focus()` is called, whether a positive `tabindex` creates a manual tab order, and whether a focused element's visual style actually changes)
- Screen reader announcement behavior — ARIA live regions, roles applied incorrectly, or how assistive technology actually narrates the page
- Video/audio captions or transcripts
- Whether interactive elements are operable via keyboard beyond the focusability check above

Treat this as a thorough first-pass technical scan that surfaces real, fixable gaps — not a certification of WCAG conformance. A full audit would add a manual assistive-technology pass (VoiceOver/NVDA) and/or real browser automation (Playwright/CDP) for genuine keyboard-walkthrough verification.

## Executive Summary

The site's structural accessibility fundamentals are solid: every page has an `html lang` attribute, a proper viewport tag with no pinch-zoom blocking, a canonical link, and (with one exception) exactly one `<h1>`. The real gaps are concentrated in three specific, fixable patterns that repeat across many pages: empty alt text on content photos (832 instances, concentrated on Culture/event photo galleries), a LinkedIn icon-link with no accessible name repeated identically across nearly 200 personnel pages, and an unlabeled login form. Fixing these three patterns — which are each a single template or component, not hundreds of unique edits — would resolve the large majority of what this audit found.

## Critical Issues

🔴 **The homepage has no `<h1>`.** Every other page on the site has exactly one `<h1>`, but the homepage jumps straight to `<h2>Elevate Your Potential</h2>`. Screen reader users rely on the `<h1>` to confirm what page they've landed on — its absence on the site's most-visited page is a real structural gap. Promote the hero heading to `<h1>`, or add a visually-hidden `<h1>` if the visual hero text needs to stay as-is.

🔴 **Personnel cards on location pages use an unstyled default link color that fails contrast.** On `/location/burlington/` (and likely other location pages sharing the same team-member card component), names like "Cathy Attig" and "Matt Johnson" render in the browser's default unvisited-link blue (`rgb(0,0,238)`) against a black background — a 2.23:1 contrast ratio against the WCAG AA minimum of 4.5:1. This reads as a missing CSS rule rather than a deliberate choice, since no other link on the site uses this color.

## Important Issues

🟡 **832 content images have empty alt text (`alt=""`) — heavily concentrated on Culture/event photo galleries.** This is a different, more serious gap than an icon or logo having `alt=""` (which is usually fine, since decorative images should have empty alt text per WCAG). These are real photos — team outings, holiday parties, volunteer events — that convey actual visual content but announce nothing to a screen reader user. Heaviest concentrations:
- `/pinstripes/` — 33 content images with empty alt
- `/holiday-party-at-ftw/` — 30
- `/2021holidayparty/` — 25
- `/anti-cruelty/` — 25
- `/camp-aramoni/` — 22
- `/2023-holiday-party/` — 18
- `/bbq-at-jeremys-house/` — 17
- `/kayaking/` — 17
- `/yacht-cruise/` — 14
- `/game-night/` — 13

370 pages total have at least one likely-content image with empty alt text. For event/culture photos specifically, even a brief, consistent alt pattern (e.g. "Prosperity Partners team members at [event name]") would close most of this gap without needing a fully custom description per photo.

🟡 **Every personnel page's LinkedIn badge is an icon-only link with no accessible name, and it repeats identically across the site.** The pattern (confirmed directly in the HTML, e.g. `/personnel/jeff-thomas/`):

```html
<a href="https://www.linkedin.com/in/jeffreythomascpa/" target="_blank" rel="noopener">
  <img ... alt="" src=".../find-me-LinkedIn-01.svg">
</a>
```

The image has `alt=""` and the enclosing link has no other text or `aria-label` — so the link has no accessible name at all. A screen reader user tabbing through the page hits an announced "link" with nothing further. This is 17 total occurrences captured directly in the "links with no accessible text" count, but the same broken pattern is present on essentially every personnel page with a LinkedIn link (nearly 200 pages), since it's one shared template component. Fixing it once (adding `aria-label="[Name] on LinkedIn"` to the link, or a visible sr-only text node) fixes it everywhere it's used.

🟡 **The Client Portal login form has no labeled fields.** The username and password inputs on `/client-portal/` rely on placeholder text only (`placeholder="Enter your user ID"`, `placeholder="Enter your password"`) with no `<label>` or `aria-label`. Placeholder text disappears once a user starts typing and isn't reliably announced by screen readers — this is the one form on the site where a user is entering sensitive information, making the gap more consequential than a typical contact form field.

🟡 **352 pages have at least one skipped heading level** (most commonly H2 jumping straight to H4, a pattern common in CMS card/grid widgets). This breaks the logical heading hierarchy that screen reader users rely on to navigate a page by section, even though it's invisible to sighted users.

🟡 **4 embedded video iframes have no `title` attribute** — `/mid-year-recap/` and `/ppp-loan-forgiveness/` each embed a video (one direct MP4, one Vimeo player) with no `title`, meaning a screen reader user has no way to know what the iframe contains before deciding whether to enter it. (Tracking/analytics iframes elsewhere on the site, e.g. Google Tag Manager, are correctly excluded from this count since they're hidden and non-interactive.)

## Nice to Have

🟢 **No page has a "skip to content" link.** This is common and usually low-priority on its own, but worth a look given the site's navigation includes a fairly deep multi-level "Services" submenu that a keyboard user has to tab through on every single page before reaching the main content.

🟢 **Keyboard focusability and focus-indicator checks did not surface unreachable elements, but did find some manual tab-order issues.** Across all 380 page-loads checked, every element that should be focusable successfully received focus (`0` unreachable). However, several pages have a small number of elements with a positive `tabindex` value (e.g. the homepage has 7, several service pages have similar counts) — a manual tab order disconnected from visual layout, a well-known anti-pattern. These are worth a review to confirm the resulting tab order still makes sense, though the low, consistent counts per page suggest a single recurring form/widget rather than a systemic problem.

🟢 **Two links use generic text** ("click here" / "read more" style, with no surrounding context) that would leave a screen reader user tabbing through links guessing what they do out of context.

## Priority Action Plan

| Priority | Action | Page(s) |
|---|---|---|
| 1 | Add or promote an `<h1>` on the homepage | Homepage |
| 2 | Fix unstyled default-blue link color on personnel cards | `/location/burlington/` and similar location pages |
| 3 | Add `aria-label` to the LinkedIn icon-link component | Sitewide (shared component, ~198 personnel pages) |
| 4 | Add alt text to content photos, starting with the highest-volume Culture/event galleries | `/pinstripes/`, `/holiday-party-at-ftw/`, `/2021holidayparty/`, and similar (370 pages) |
| 5 | Add `<label>` elements to the Client Portal login form | `/client-portal/` |
| 6 | Add `title` attributes to embedded video iframes | `/mid-year-recap/`, `/ppp-loan-forgiveness/` |
| 7 | Fix skipped heading levels in card/grid components | Sitewide (352 pages) |
| 8 | Review positive-tabindex elements for correct tab order | Homepage and similar service pages |
| 9 | Add a skip-to-content link | Sitewide |
| 10 | Replace generic link text with descriptive text | 2 instances (see Nice to Have) |
