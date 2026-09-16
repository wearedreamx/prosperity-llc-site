# Original WordPress theme — design reference

The PHP templates and CSS of `ndhcpawp`, the theme the live site runs on, copied
out of the WordPress export before that export was deleted (README §4).

**This is reference material, not build input.** Nothing here is deployed or
read at build time. It is kept because two open pieces of work need to check
against the original:

- **§9.2** — the CSS for the scaffolded page types was reconstructed from
  per-page inline `<style>` fragments in a crawl. The authoritative rules have
  since been ported from `assets/css/` here into `site/assets/css/style.css`,
  but the remaining visual QA pass (Phase F) still needs something to compare to.
- **Phase D / E** — `404.php`, `search.php` and the remaining bespoke page
  templates have not been ported yet.

Vendor JavaScript (jQuery, Slick) was left out: the new site has no client
framework, and the only theme behaviour that mattered — the team directory's
3-facet filter in `assets/js/g.min.js` — is reimplemented in
`site/assets/js/main.js`.

No credentials are present. `pages/portal.php` contains a password *input field*,
not a password.
