"""
Fallback content extraction: turn reconstructed-site/site-crawl-prosperity.json
(a live-site crawl: path, title, metaDesc, headings, images, bodyText, rendered
html, visual, keyboardA11y, links per page) into structured per-content-type
data files.

This is a fallback for machines without the WordPress export (see "Restoring
www/" in README.md §1) — tools/wpdump.py + the SQL dump remains the primary,
authoritative extraction path wherever www/ is available. The crawl's rendered
HTML still carries the theme's block-layout classes
(content-block-container-<layout>), so the ACF flexible-content layout model
from the original plan is recoverable from class names even without postmeta,
but this path cannot see draft/private pages or raw ACF field data — only what
the live site actually renders publicly.

Output: data/personnel.json, data/locations.json, data/posts.json, data/pages.json,
data/global.json, data/media-manifest.json
"""
import json
import re
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CRAWL_PATH = ROOT / "reconstructed-site" / "site-crawl-prosperity.json"
DATA_DIR = ROOT / "data"

SITE_ORIGIN = "https://www.prosperityllc.com"


def load_pages():
    with open(CRAWL_PATH) as f:
        crawl = json.load(f)
    return crawl["pages"]


def body_class(html):
    m = re.search(r'<body class="([^"]*)"', html)
    return m.group(1) if m else ""


def main_html(html):
    start = html.find("<main")
    end = html.find("</main>")
    if start == -1 or end == -1:
        return ""
    start = html.find(">", start) + 1
    return html[start:end]


def strip_style_blocks(html):
    return re.sub(r"<style\b[^>]*>.*?</style>", "", html, flags=re.S)


def rel_url(url):
    """Normalize an absolute prosperityllc.com URL to a site-relative path."""
    if not url:
        return url
    if url.startswith(SITE_ORIGIN):
        return url[len(SITE_ORIGIN):] or "/"
    return url


def rewrite_upload_urls(html):
    return html.replace(SITE_ORIGIN, "")


GFORM_WRAPPER_RE = re.compile(
    r'<div class="gf_browser_\w+ gform_wrapper[^"]*"[^>]*>'
    r'(?:<div id="gf_\d+" class="gform_anchor"[^>]*></div>)?'
    r'<form[^>]*data-formid="(\d+)"[^>]*>.*?</form>\s*</div>',
    re.S,
)

# formid 1 = the site-wide Contact Form, with an extra "How did you hear about
# us?" radio group not present on forms 3-9 (README §10). Every other formid
# gets the standard 5-field shape.
CONTACT_FORM_ID = "1"


def strip_gravity_forms(html):
    """Replace an embedded (dead, WordPress-only) Gravity Forms widget with a
    marker the page template swaps for the site's real contact-form component.
    Gravity Forms' backend doesn't exist in the new site — see README §10."""
    def replace(m):
        variant = "contact" if m.group(1) == CONTACT_FORM_ID else "standard"
        return f'<div class="cta-form-placeholder" data-form-variant="{variant}"></div>'
    return GFORM_WRAPPER_RE.sub(replace, html)


def classify(path, html):
    cls = body_class(html)
    if "single-personnel" in cls or path.startswith("/personnel/"):
        return "personnel"
    if "single-location" in cls or path.startswith("/location/"):
        return "location"
    if "single-post" in cls and "single-personnel" not in cls:
        return "post"
    if "page-template-pageshome-php" in cls:
        return "home"
    if "page-template-pagesservices-php" in cls:
        return "page-services"
    if "page-template-pagesteam-php" in cls:
        return "page-team"
    if "page-template-pagesportal-php" in cls:
        return "page-portal"
    if "error404" in cls:
        return "404"
    if re.search(r"/page/\d+/?$", path) or path in ("/culture", "/whats-new"):
        return "archive"
    if "page" in cls.split():
        return "page"
    return "other"


# ---------------------------------------------------------------------------
# Personnel
# ---------------------------------------------------------------------------

def extract_personnel(path, p):
    html = p["html"]
    slug = path.strip("/").split("/")[-1]

    # Scope everything to the single-post-container section — the rest of the
    # page (footer social menu, unrelated lazy-loaded embeds elsewhere) contains
    # look-alike markup (other LinkedIn links, other data-lazy-src images) that
    # a page-wide regex would grab instead of this person's own data.
    section_m = re.search(
        r'<section class="single-post-container">.*?</section>', html, re.S
    )
    section = section_m.group(0) if section_m else html

    name_m = re.search(
        r'<h1 class="single-personnel-name">(.*?)<span class="single-personnel-certs">(.*?)</span></h1>',
        section, re.S,
    )
    if not name_m:
        name_m2 = re.search(r'<h1 class="single-personnel-name">(.*?)</h1>', section, re.S)
        name = unescape(name_m2.group(1)).strip() if name_m2 else p["title"]
        certs = ""
    else:
        name = unescape(name_m.group(1)).strip()
        certs = unescape(name_m.group(2)).strip()

    title_m = re.search(r'<h3 class="single-personnel-title">(.*?)</h3>', section)
    title = unescape(title_m.group(1)).strip() if title_m else ""

    loc_m = re.search(
        r'<h4 class="single-personnel-location">.*?<a href="([^"]+)"[^>]*>(.*?)</a></h4>',
        section, re.S,
    )
    location_url = rel_url(loc_m.group(1)) if loc_m else ""
    location_name = unescape(loc_m.group(2)).strip() if loc_m else ""

    figure_m = re.search(r'<figure class="single-post-figure">.*?</figure>', section, re.S)
    figure_html = figure_m.group(0) if figure_m else ""
    photo_m = re.search(r'src="([^"]+\.(?:jpe?g|png))"', figure_html)
    photo_url = rel_url(photo_m.group(1)) if photo_m else ""

    linkedin_m = re.search(
        r'<p><a href="(https://www\.linkedin\.com/[^"]+)"[^>]*><img[^>]*linkedin', section, re.I
    )
    linkedin_url = linkedin_m.group(1) if linkedin_m else ""

    content_m = re.search(
        r'<div class="single-personnel-content content">(.*?)</div>\s*</div>\s*</div>\s*(?:<style>|</section>)',
        section, re.S,
    )
    body_html = content_m.group(1).strip() if content_m else ""
    # Drop the leading LinkedIn-badge <p> if present; kept separately as linkedin_url.
    body_html = re.sub(
        r'^\s*<p><a href="https://www\.linkedin\.com/[^"]+"[^>]*>.*?</a></p>\s*', "",
        body_html, count=1, flags=re.S,
    )

    facets_m = re.search(
        r'data-member-title="([^"]*)" data-member-location="([^"]*)" data-member-specs="([^"]*)"',
        html,
    )
    facet_title = facets_m.group(1).strip() if facets_m else ""
    facet_specs = facets_m.group(3).split() if facets_m else []

    return {
        "slug": slug,
        "name": name,
        "certifications": certs,
        "job_title": title,
        "location_name": location_name,
        "location_url": location_url,
        "photo_url": photo_url,
        "linkedin_url": linkedin_url,
        "facet_title": facet_title,
        "facet_specializations": facet_specs,
        "body_html": rewrite_upload_urls(body_html),
    }


# ---------------------------------------------------------------------------
# Locations
# ---------------------------------------------------------------------------

def extract_location(path, p):
    html = p["html"]
    slug = path.strip("/").split("/")[-1]

    block_m = re.search(
        r'<div class="single-location-top">(.*?)<div class="team-filters-container">',
        html, re.S,
    )
    block = block_m.group(1) if block_m else ""

    title_m = re.search(r'<h1 class="single-location-title">(.*?)</h1>', block)
    name = unescape(title_m.group(1)).strip() if title_m else p["title"]

    addr_m = re.search(r"<address>(.*?)</address>", block, re.S)
    address_html = addr_m.group(1).strip() if addr_m else ""

    desc_m = re.search(
        r'<div class="single-location-content content">(.*?)</div>\s*</div>', block, re.S
    )
    description_html = desc_m.group(1).strip() if desc_m else ""

    return {
        "slug": slug,
        "name": name,
        "address_html": address_html,
        "description_html": description_html,
    }


# ---------------------------------------------------------------------------
# Posts (Culture / What's New)
# ---------------------------------------------------------------------------

def extract_post(path, p):
    html = p["html"]
    slug = path.strip("/").split("/")[-1]

    # Scope everything to the single-post-container section — the rest of the
    # page (header logo, footer widgets) contains other /wp-content/uploads/
    # images that a page-wide regex would wrongly pick up as this post's photos.
    section_m = re.search(
        r'<section class="single-post-container">.*?</section>', html, re.S
    )
    section = section_m.group(0) if section_m else html

    category_m = re.search(
        r'<h2 class="page-banner-title"><a class="page-banner-title-link" href="([^"]+)">(.*?)</a></h2>',
        html,
    )
    category_url = rel_url(category_m.group(1)) if category_m else ""
    category_name = unescape(category_m.group(2)).strip() if category_m else ""

    date_m = re.search(r'property="article:published_time" content="([^"]+)"', html)
    published = date_m.group(1) if date_m else ""

    title_m = re.search(r'<h1 class="single-post-title">(.*?)</h1>', section)
    title = unescape(title_m.group(1)).strip() if title_m else p["title"]

    content_m = re.search(
        r'<div class="single-post-content">.*?<div class="content">(.*?)</div>\s*</div>\s*</div>\s*(?:<style>|</section>)',
        section, re.S,
    )
    body_html = content_m.group(1).strip() if content_m else ""

    # A post's photo(s) are either a single <figure class="single-post-figure">
    # image or a slideshow of single-post-slideshow-slide-image slides — in
    # both cases tagged with one of these two classes. Order is preserved
    # (first slide is the lead image), not sorted.
    images = []
    seen = set()
    for m in re.finditer(
        r'<img[^>]*class="(?:single-post-image|single-post-slideshow-slide-image)"[^>]*>',
        section,
    ):
        src_m = re.search(r'src="([^"]+)"', m.group(0))
        if not src_m:
            continue
        url = rel_url(src_m.group(1))
        if url not in seen:
            seen.add(url)
            images.append(url)

    return {
        "slug": slug,
        "title": title,
        "published": published,
        "category_name": category_name,
        "category_url": category_url,
        "body_html": rewrite_upload_urls(body_html),
        "images": [rewrite_upload_urls(i) for i in images],
    }


# ---------------------------------------------------------------------------
# Pages (generic content-block templates, and the services/team/portal variants)
# ---------------------------------------------------------------------------

def top_level_sections(body_html):
    sections = []
    depth = 0
    start = None
    for m in re.finditer(r"<section\b[^>]*>|</section>", body_html):
        tag = m.group(0)
        if tag.startswith("<section"):
            if depth == 0:
                start = m.start()
            depth += 1
        else:
            depth -= 1
            if depth == 0 and start is not None:
                sections.append(body_html[start:m.end()])
                start = None
    return sections


def extract_page(path, p, page_type):
    html = p["html"]
    slug = path.strip("/").split("/")[-1] or "home"
    body = strip_style_blocks(main_html(html))
    sections = top_level_sections(body)

    banner_title = ""
    banner_desc_html = ""
    banner_image = ""
    blocks = []

    for sec in sections:
        # The section's own class can appear anywhere in the opening tag —
        # WordPress sometimes emits other attributes (e.g. data-wpr-lazyrender)
        # before class= — so search the whole opening tag, not just its start.
        open_tag_m = re.match(r"^<section\b[^>]*>", sec)
        open_tag = open_tag_m.group(0) if open_tag_m else ""
        cls_m = re.search(r'class="([^"]*)"', open_tag)
        cls = cls_m.group(1) if cls_m else ""

        if "page-banner" in cls:
            t_m = re.search(r'<h1 class="page-banner-title">(.*?)</h1>', sec)
            if t_m:
                banner_title = unescape(t_m.group(1)).strip()
            d_m = re.search(
                r'<h1 class="page-banner-title">.*?</h1>\s*<div class="content">(.*?)</div>',
                sec, re.S,
            )
            if d_m:
                banner_desc_html = d_m.group(1).strip()
            img_m = re.search(r'<figure class="page-banner-figure">.*?src="([^"]+)"', sec, re.S)
            if img_m:
                banner_image = rewrite_upload_urls(rel_url(img_m.group(1)))
            continue

        if "content-block" in cls and "content-block-testimonials" not in cls:
            layout_m = re.search(r"content-block-container-(\S+?)\"", sec)
            layout = layout_m.group(1) if layout_m else "one"
            inner_m = re.search(
                r'<div class="content-block-container[^"]*">(.*)</div>\s*</section>$', sec, re.S
            )
            inner_html = inner_m.group(1) if inner_m else sec
            inner_html = strip_gravity_forms(inner_html)
            blocks.append({
                "layout": layout,
                "html": rewrite_upload_urls(inner_html.strip()),
            })
            continue

        # Anything else (services-grid, testimonials carousel, tiles, team grid,
        # portal login form, etc.) is kept as an opaque block tagged by its class,
        # since decomposing every bespoke template is Phase C/D work, not extraction.
        blocks.append({
            "layout": "raw:" + (cls.split()[0] if cls else "section"),
            "html": rewrite_upload_urls(sec.strip()),
        })

    return {
        "slug": slug,
        "path": path,
        "page_type": page_type,
        "title": p["title"],
        "meta_description": p["metaDesc"],
        "banner_title": banner_title,
        "banner_description_html": rewrite_upload_urls(banner_desc_html),
        "banner_image": banner_image,
        "blocks": blocks,
    }


# ---------------------------------------------------------------------------
# Global (footer/nav/site identity) — pulled once from the homepage
# ---------------------------------------------------------------------------

def extract_global(home_page):
    html = home_page["html"]

    site_name_m = re.search(r'property="og:site_name" content="([^"]+)"', html)
    site_name = site_name_m.group(1) if site_name_m else ""

    tagline_m = re.search(r'"description":"([^"]+)","potentialAction"', html)
    tagline = unescape(tagline_m.group(1)) if tagline_m else ""

    locations = []
    for loc_m in re.finditer(
        r'<div class="footer-location"><h3 class="footer-location-title"><a href="([^"]+)"[^>]*>(.*?)</a></h3>'
        r'<address class="footer-location-address">(.*?)</address></div>',
        html, re.S,
    ):
        locations.append({
            "url": rel_url(loc_m.group(1)),
            "name": unescape(loc_m.group(2)).strip(),
            "address_html": loc_m.group(3).strip(),
        })

    disclaimer_m = re.search(
        r'<div class="footer-disclaimer-content"><p>(.*?)</div>', html, re.S
    )
    disclaimer_html = disclaimer_m.group(1).strip() if disclaimer_m else ""

    copyright_m = re.search(
        r'<div class="footer-copyright-content">(.*?)</div>', html, re.S
    )
    copyright_html = copyright_m.group(1).strip() if copyright_m else ""

    phone_m = re.search(r'Phone : <a href="tel:([^"]+)">([^<]+)</a>', html)
    phone = phone_m.group(2) if phone_m else ""

    email_m = re.search(r'Email: <a href="mailto:([^"]+)">', html)
    email = email_m.group(1) if email_m else ""

    return {
        "site_name": site_name,
        "tagline": tagline,
        "phone": phone,
        "email": email,
        "footer_locations": locations,
        "footer_disclaimer_html": disclaimer_html,
        "footer_copyright_html": copyright_html,
    }


# ---------------------------------------------------------------------------
# Media manifest — every /wp-content/uploads/ path referenced anywhere in the crawl
# ---------------------------------------------------------------------------

UPLOAD_RE = re.compile(r"https://www\.prosperityllc\.com(/wp-content/uploads/[^\"'\s)]+)")


def collect_media(pages):
    refs = {}
    for p in pages:
        html = p.get("html", "")
        for m in UPLOAD_RE.finditer(html):
            refs.setdefault(m.group(1), set()).add(p["path"])
        for im in p.get("images", []) or []:
            src = im.get("src") or ""
            m2 = UPLOAD_RE.match(src)
            if m2:
                refs.setdefault(m2.group(1), set()).add(p["path"])
    return {path: sorted(pset) for path, pset in sorted(refs.items())}


def main():
    pages = load_pages()
    by_type = {}
    for p in pages:
        t = classify(p["path"], p["html"])
        by_type.setdefault(t, []).append(p)

    print("Page type counts:")
    for t, items in sorted(by_type.items(), key=lambda kv: -len(kv[1])):
        print(f"  {t:16s} {len(items)}")

    personnel = [extract_personnel(p["path"], p) for p in by_type.get("personnel", [])]
    locations = [extract_location(p["path"], p) for p in by_type.get("location", [])]
    posts = [extract_post(p["path"], p) for p in by_type.get("post", [])]

    pages_out = []
    for t in ("page", "page-services", "page-team", "page-portal"):
        for p in by_type.get(t, []):
            pages_out.append(extract_page(p["path"], p, t))
    home_pages = by_type.get("home", [])
    for p in home_pages:
        pages_out.append(extract_page(p["path"], p, "home"))

    global_data = extract_global(home_pages[0]) if home_pages else {}
    media_manifest = collect_media(pages)

    DATA_DIR.mkdir(exist_ok=True)
    (DATA_DIR / "personnel.json").write_text(json.dumps(personnel, indent=2, ensure_ascii=False))
    (DATA_DIR / "locations.json").write_text(json.dumps(locations, indent=2, ensure_ascii=False))
    (DATA_DIR / "posts.json").write_text(json.dumps(posts, indent=2, ensure_ascii=False))
    (DATA_DIR / "pages.json").write_text(json.dumps(pages_out, indent=2, ensure_ascii=False))
    (DATA_DIR / "global.json").write_text(json.dumps(global_data, indent=2, ensure_ascii=False))
    (DATA_DIR / "media-manifest.json").write_text(json.dumps(media_manifest, indent=2, ensure_ascii=False))

    print()
    print(f"personnel.json: {len(personnel)} records")
    print(f"locations.json: {len(locations)} records")
    print(f"posts.json: {len(posts)} records")
    print(f"pages.json: {len(pages_out)} records")
    print(f"media-manifest.json: {len(media_manifest)} distinct upload paths")


if __name__ == "__main__":
    main()
