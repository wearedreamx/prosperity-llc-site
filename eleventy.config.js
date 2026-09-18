const fs = require("fs");
const path = require("path");

module.exports = function (eleventyConfig) {
	eleventyConfig.addPassthroughCopy("site/assets");

	// Icon/manifest source files live in site/icons/ to keep the site/ root tidy,
	// but browsers and Windows tiles expect them served at the site root
	// (e.g. /favicon.ico, /manifest.json) — remap on copy so the source layout
	// doesn't change any served URL.
	eleventyConfig.addPassthroughCopy({ "site/icons/favicon.ico": "favicon.ico" });
	eleventyConfig.addPassthroughCopy({ "site/icons/favicon-16x16.png": "favicon-16x16.png" });
	eleventyConfig.addPassthroughCopy({ "site/icons/favicon-32x32.png": "favicon-32x32.png" });
	eleventyConfig.addPassthroughCopy({ "site/icons/apple-icon-180x180.png": "apple-icon-180x180.png" });
	eleventyConfig.addPassthroughCopy({ "site/icons/android-icon-36x36.png": "android-icon-36x36.png" });
	eleventyConfig.addPassthroughCopy({ "site/icons/android-icon-48x48.png": "android-icon-48x48.png" });
	eleventyConfig.addPassthroughCopy({ "site/icons/android-icon-72x72.png": "android-icon-72x72.png" });
	eleventyConfig.addPassthroughCopy({ "site/icons/android-icon-96x96.png": "android-icon-96x96.png" });
	eleventyConfig.addPassthroughCopy({ "site/icons/android-icon-144x144.png": "android-icon-144x144.png" });
	eleventyConfig.addPassthroughCopy({ "site/icons/android-icon-192x192.png": "android-icon-192x192.png" });
	eleventyConfig.addPassthroughCopy({ "site/icons/ms-icon-70x70.png": "ms-icon-70x70.png" });
	eleventyConfig.addPassthroughCopy({ "site/icons/ms-icon-150x150.png": "ms-icon-150x150.png" });
	eleventyConfig.addPassthroughCopy({ "site/icons/ms-icon-310x310.png": "ms-icon-310x310.png" });
	eleventyConfig.addPassthroughCopy({ "site/icons/manifest.json": "manifest.json" });
	eleventyConfig.addPassthroughCopy({ "site/icons/browserconfig.xml": "browserconfig.xml" });

	// Cloudflare Pages reads both of these from the deploy root, so they are
	// copied out of site/ rather than served from a subpath.
	eleventyConfig.addPassthroughCopy({ "site/_redirects": "_redirects" });
	eleventyConfig.addPassthroughCopy({ "site/_headers": "_headers" });
	eleventyConfig.addPassthroughCopy({ "site/robots.txt": "robots.txt" });

	// data/ sits outside the input dir (site/), so Eleventy does not watch it and
	// edits to the footer/filter/pinning data did not trigger a rebuild in dev.
	// The _data wrappers read it with readFileSync rather than require so the
	// rebuild actually picks up the new contents — see site/_data/global.js.
	eleventyConfig.addWatchTarget("./data/");

	eleventyConfig.addGlobalData("currentYear", () => new Date().getFullYear());

	const MONTHS = [
		"January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December",
	];
	eleventyConfig.addFilter("longDate", (isoString) => {
		if (!isoString) return "";
		const d = new Date(isoString);
		return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
	});
	eleventyConfig.addFilter("isoDate", (isoString) => {
		if (!isoString) return "";
		return new Date(isoString).toISOString().slice(0, 10);
	});

	// Flattens a record's rendered HTML body to plain prose and truncates it on a
	// word boundary. Used for two things that were previously hand-written or
	// simply absent: the excerpt on a post card, and the <meta name="description">
	// on the 315 personnel/post/location pages whose templates never set one.
	// Entities are decoded because the body is post-Markdown HTML, so an
	// un-decoded &amp; would end up double-escaped again on output.
	const ENTITIES = {
		"&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"',
		"&#39;": "'", "&apos;": "'", "&nbsp;": " ", "&hellip;": "…",
		"&rsquo;": "\u2019", "&lsquo;": "\u2018",
		"&rdquo;": "\u201d", "&ldquo;": "\u201c", "&mdash;": "—", "&ndash;": "–",
	};
	eleventyConfig.addFilter("plainText", (html) =>
		String(html || "")
			// Drop script/style wholesale rather than keeping their text content.
			.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
			.replace(/<[^>]+>/g, " ")
			.replace(/&[a-z]+;|&#\d+;/gi, (e) => ENTITIES[e.toLowerCase()] ?? " ")
			.replace(/\s+/g, " ")
			.trim()
	);
	// Post and personnel bodies are Markdown (§6a), and their <meta description>
	// is derived from the raw body rather than the rendered HTML — so the syntax
	// has to come off first or "**EXPERTISE:**" lands in the search snippet.
	eleventyConfig.addFilter("mdText", (markdown) =>
		String(markdown || "")
			.replace(/^\s{0,3}#{1,6}\s+/gm, "")
			.replace(/^\s{0,3}(?:[-*+]|\d+[.)])\s+/gm, "")
			.replace(/^\s{0,3}>\s?/gm, "")
			.replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
			.replace(/(\*\*|__)(.*?)\1/g, "$2")
			.replace(/(?<![\w\\])[*_](\S(?:.*?\S)?)[*_](?!\w)/g, "$1")
			.replace(/`([^`]*)`/g, "$1")
			.replace(/\\([\\`*_{}\[\]()#+\-.!>])/g, "$1")
	);

	// A location's address is stored as plain lines (§6b) rather than the markup
	// the import carried, so an editor types an address instead of typing <br>.
	// The line break is the only formatting an address has, so it is put back
	// here rather than left to CSS.
	const ESCAPE = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
	eleventyConfig.addFilter("addressLines", (address) =>
		String(address || "")
			.split("\n")
			.map((line) => line.trim().replace(/[&<>"']/g, (c) => ESCAPE[c]))
			.filter(Boolean)
			.join("<br>\n")
	);

	// A page's prose lives in blocks[].html, and the first block is sometimes an
	// empty wrapper, so a description derived from blocks[0] alone comes out
	// blank. Concatenating them lets the fallback chain find real copy.
	eleventyConfig.addFilter("blocksProse", (blocks) =>
		(blocks || []).map((b) => b.html || "").join(" ")
	);

	// Locations in display-name order, which is how the live site lists them in
	// the office jump menu; the collection itself is in filename order, and that
	// puts "Washington DC – Transaction Advisory" ahead of "Washington DC – Tax".
	eleventyConfig.addFilter("sortByName", (records) =>
		[...(records || [])].sort((a, b) => (a.data.name || "").localeCompare(b.data.name || ""))
	);

	// Nunjucks' own `slice` is Jinja's — it splits a list into N chunks — so
	// "the newest three" needs its own filter rather than slice(3)|first.
	eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));
	eleventyConfig.addFilter("truncate", (text, length = 160) => {
		const s = String(text || "").trim();
		if (s.length <= length) return s;
		// Cut at the last space before the limit so a word is never split; fall
		// back to a hard cut for text with no spaces in range.
		const cut = s.slice(0, length);
		const at = cut.lastIndexOf(" ");
		return (at > length * 0.5 ? cut.slice(0, at) : cut).replace(/[\s,.;:—–-]+$/, "") + "…";
	});

	// Some pages had a server-rendered form widget embedded mid-content rather
	// than in its own raw:cta block. The import left a marker div in its place,
	// tagged data-form-variant — "contact" for the one form with an extra
	// referral-source field (see README §10), "standard" for the rest. Render
	// the real contact-form.njk
	// component through Nunjucks (not a plain string swap) so its
	// {% if formVariant %} branch picks the right shape.
	const nunjucks = require("nunjucks");

	// Reads a file from data/ fresh on every call. require() would cache it, so
	// under `eleventy --serve` a watch-triggered rebuild would re-run the
	// collections against the *old* contents — the edit would appear to do
	// nothing. See site/_data/global.js for the same reasoning.
	const readData = (name) =>
		JSON.parse(fs.readFileSync(path.join(__dirname, "data", name), "utf8"));

	// A post record carries only `category` — the slug. Its archive path and
	// display name come from data/post-categories.json, so the three cannot
	// drift apart the way the old category_name/category_url pair could, and the
	// CMS has one field to edit instead of two that must agree.
	// Cached for the length of one build and dropped before the next: the two
	// filters below run once per post link — ~2,100 times — and re-reading the
	// file each time cost 14% of the build, while caching outright would make a
	// watch-triggered rebuild use the pre-edit contents.
	let categories = null;
	eleventyConfig.on("eleventy.before", () => { categories = null; });
	const category = (slug) => {
		categories = categories || readData("post-categories.json").categories;
		return categories.find((c) => c.slug === slug);
	};
	eleventyConfig.addFilter("categoryPath", (slug) => category(slug)?.path || "/");
	eleventyConfig.addFilter("categoryName", (slug) => category(slug)?.name || "");

	// Markdown is rendered for posts/ and personnel/ only (their .11tydata.js
	// sets templateEngineOverride: "md"); pages/ and locations/ still carry HTML.
	eleventyConfig.amendLibrary("md", (md) => {
		// The imported bodies use <br> for a line break inside a paragraph, which
		// Markdown spells as a bare newline — but only with breaks:true. Without
		// it every one of those breaks silently becomes a space.
		md.set({ breaks: true });
		// Markdown link syntax cannot carry target/rel, and the old records set
		// them inconsistently (4 external links had neither, 7 mailto links had
		// both). Deriving them from the href makes it uniform and means an editor
		// writes a plain link and still gets the right behaviour.
		const renderLink = md.renderer.rules.link_open
			|| ((tokens, i, options, env, self) => self.renderToken(tokens, i, options));
		md.renderer.rules.link_open = (tokens, i, options, env, self) => {
			if (/^https?:\/\//i.test(tokens[i].attrGet("href") || "")) {
				tokens[i].attrSet("target", "_blank");
				tokens[i].attrSet("rel", "noopener");
			}
			return renderLink(tokens, i, options, env, self);
		};
	});

	const formEnv = new nunjucks.Environment(
		new nunjucks.FileSystemLoader(path.join(__dirname, "site", "_includes"))
	);
	// NOTE: formEnv is a plain Nunjucks environment, outside Eleventy — none of
	// the filters registered above exist in it. contact-form.njk uses none today,
	// which is the only reason this works; the first filter added to that file
	// will render correctly inside cta.njk (Eleventy's environment) and throw
	// "filter not found" here. Register it on formEnv too, or keep the form
	// filter-free.
	//
	// idPrefix keeps element ids unique when a page renders both an embedded form
	// and the site-wide CTA form: without it both used cf-first/cf-last/... and
	// the second form's <label for> pointed at the first form's fields.
	//
	// data-pagefind-ignore mirrors cta.njk: the form is chrome, and without it
	// "First name", "Message" and "Send Message" were indexed as page content on
	// every page carrying an embedded form.
	//
	// global is read once per build and dropped on eleventy.before, the same
	// arrangement as the category cache above. It used to be a fresh readFileSync
	// + JSON.parse inside this replace callback — i.e. once per placeholder.
	let formGlobal = null;
	eleventyConfig.on("eleventy.before", () => { formGlobal = null; });
	eleventyConfig.addFilter("injectContactForm", (html) => {
		let n = 0;
		return html.replace(
			/<div class="cta-form-placeholder"(?: data-form-variant="(\w+)")?><\/div>/g,
			(_match, formVariant) => {
				formGlobal = formGlobal || readData("global.json");
				const form = formEnv.render("contact-form.njk", {
					formVariant,
					idPrefix: `cf-embed-${++n}`,
					global: formGlobal,
				});
				return `<div data-pagefind-ignore>${form}</div>`;
			}
		);
	});

	// Content lives one file per record under site/content/<type>/*.md —
	// personnel/posts/locations/pages are auto-tagged via
	// each folder's <type>.11tydata.js, so `collections.personnel` etc. already
	// exist. These derived collections do the filtering and sorting that the
	// templates would otherwise repeat inline. site/_data/global.js and
	// site/_data/teamFilters.js are still live alongside them and do a different
	// job: they are the bridge that puts data/*.json into template scope, which
	// Eleventy will not do on its own because data/ sits outside dir.input.
	// /meet-the-team/ order must match the live site: a pinned leadership block
	// first, then everyone else by last name. The pinned ids live in
	// data/team-pinned.json. Sorting on the record's own last_name field rather
	// than splitting the display name, which breaks on compound and multi-word
	// surnames.
	eleventyConfig.addCollection("teamOrder", (api) => {
		const pinnedSlugs = readData("team-pinned.json").slugs;
		const people = api.getFilteredByTag("personnel");
		const bySlug = new Map(people.map((p) => [p.data.slug, p]));
		const pinned = pinnedSlugs.map((s) => bySlug.get(s)).filter(Boolean);
		// Compare the two fields separately rather than joining them with a
		// separator: localeCompare ignores control characters, so a "\u0000" join
		// runs the fields together and sorts Bassett, Sarah before Bass, Moshe.
		const cmp = (a, b) =>
			(a.data.last_name || "").localeCompare(b.data.last_name || "") ||
			(a.data.name || "").localeCompare(b.data.name || "");
		const rest = people
			.filter((p) => !pinnedSlugs.includes(p.data.slug))
			.sort(cmp);
		return [...pinned, ...rest];
	});

	// Personnel grouped by location slug: that location's pinned members first,
	// then everyone else at that office by last name.
	eleventyConfig.addCollection("personnelByLocation", (api) => {
		const pinnedByLocation = readData("team-pinned.json").byLocation || {};
		const slugOf = (p) => p.data.location || "";
		const cmp = (a, b) =>
			(a.data.last_name || "").localeCompare(b.data.last_name || "") ||
			(a.data.name || "").localeCompare(b.data.name || "");
		const grouped = {};
		api.getFilteredByTag("personnel").forEach((person) => {
			const slug = slugOf(person);
			if (!slug) return;
			(grouped[slug] = grouped[slug] || []).push(person);
		});
		Object.keys(grouped).forEach((slug) => {
			const pins = pinnedByLocation[slug] || [];
			const bySlug = new Map(grouped[slug].map((p) => [p.data.slug, p]));
			const pinned = pins.map((s) => bySlug.get(s)).filter(Boolean);
			const rest = grouped[slug].filter((p) => !pins.includes(p.data.slug)).sort(cmp);
			grouped[slug] = [...pinned, ...rest];
		});
		return grouped;
	});

	// Page records keyed by slug, for the hand-built templates whose records sit
	// outside `genericPages` (Nunjucks has no selectattr to look one up inline).
	// meet-the-team.njk and sitemap.njk read their banner copy and metadata
	// through it rather than restating them.
	//
	// index.njk does NOT: it hardcodes the homepage, and home.md's seven blocks
	// are rendered by nothing. That is README §11's open decision, not an
	// oversight here — but it is why /assets/img/pages/home.jpg is an orphan.
	//
	// Keyed by slug, so a duplicate slug silently drops the earlier record.
	// There were two such collisions (valuation-services,
	// transaction-advisory-services); a nested page now qualifies its slug with
	// its parent when the bare leaf name belongs to a top-level page.
	eleventyConfig.addCollection("pagesBySlug", (api) =>
		Object.fromEntries(api.getFilteredByTag("pages").map((p) => [p.data.slug, p]))
	);

	// Location records keyed by slug, so a personnel record's `location` slug can
	// be resolved to that office's display name and page without the record
	// restating either (team-card.njk, personnel.njk).
	eleventyConfig.addCollection("locationsBySlug", (api) =>
		Object.fromEntries(api.getFilteredByTag("locations").map((l) => [l.data.slug, l]))
	);

	// The offices listed in the site footer, in display-name order — which is the
	// order the old hand-maintained data/global.json footer_locations[] was in,
	// and not filename order (that puts "Washington DC – Transaction Advisory"
	// ahead of "Washington DC – Tax"). `in_footer` is what keeps Mumbai out, as
	// it was before: it is a working office with a locations record and a roster,
	// but no postal address to print.
	eleventyConfig.addCollection("footerLocations", (api) =>
		api.getFilteredByTag("locations")
			.filter((l) => l.data.in_footer)
			.sort((a, b) => (a.data.name || "").localeCompare(b.data.name || ""))
	);

	eleventyConfig.addCollection("culturePosts", (api) =>
		api.getFilteredByTag("posts")
			.filter((p) => p.data.category === "culture")
			.sort((a, b) => (a.data.published < b.data.published ? 1 : -1))
	);
	eleventyConfig.addCollection("whatsNewPosts", (api) =>
		api.getFilteredByTag("posts")
			.filter((p) => p.data.category === "whats-new")
			.sort((a, b) => (a.data.published < b.data.published ? 1 : -1))
	);
	eleventyConfig.addCollection("recentPosts", (api) =>
		api.getFilteredByTag("posts")
			.sort((a, b) => (a.data.published < b.data.published ? 1 : -1))
			.slice(0, 4)
	);
	// page-sage renders through the generic path too: it is page-banner + a
	// "sage-menu" nav + content blocks, and §5 records that menu as having 0
	// items, so it is the generic template with an empty nav. Its two pages are
	// private and stay unpublished until §11.3 is decided.
	const GENERIC_PAGE_TYPES = new Set(["page", "page-services", "page-portal", "page-sage"]);
	// Pages whose own template renders them, because their content is generated
	// rather than authored: the homepage, the team directory, and the sitemap.
	// The first two are already outside GENERIC_PAGE_TYPES by page_type; listing
	// all three here is what actually states the rule.
	const BESPOKE_PAGES = new Set(["home", "meet-the-team", "sitemap"]);
	// Draft and private pages are kept in the repo so nothing is lost, but they
	// must not ship until §11's open decisions are made.
	eleventyConfig.addCollection("genericPages", (api) =>
		api
			.getFilteredByTag("pages")
			.filter((p) => GENERIC_PAGE_TYPES.has(p.data.page_type))
			.filter((p) => !BESPOKE_PAGES.has(p.data.slug))
			.filter((p) => (p.data.status || "publish") === "publish")
	);

	// /sitemap/ is linked from the footer on every page and was rendering as a
	// bare banner with no links: the old site built that list with a CMS plugin,
	// so the import captured no content for it. Derived from the collections
	// instead, nested by path depth the way the live page nests it.
	eleventyConfig.addCollection("sitemapPages", (api) => {
		const pages = api
			.getFilteredByTag("pages")
			.filter((p) => (p.data.status || "publish") === "publish")
			.filter((p) => GENERIC_PAGE_TYPES.has(p.data.page_type) || BESPOKE_PAGES.has(p.data.slug))
			// Home is the "Home" link the template hardcodes above the loop, and
			// a sitemap listing itself is noise on the one page nobody reaches by
			// browsing. Both are still in /sitemap.xml, which crawlers do read.
			.filter((p) => p.data.path && p.data.path !== "/" && p.data.slug !== "sitemap")
			.map((p) => ({
				url: p.data.path,
				title: p.data.banner_title || p.data.title,
				depth: p.data.path.replace(/^\/|\/$/g, "").split("/").length,
			}))
			.sort((a, b) => a.url.localeCompare(b.url));
		// Attach each child to its parent by path prefix; anything whose parent
		// is not itself a published page stays top level rather than vanishing.
		const byUrl = new Map(pages.map((p) => [p.url, { ...p, children: [] }]));
		const top = [];
		for (const p of pages) {
			const parentUrl = p.url.replace(/[^/]+\/$/, "");
			const parent = p.depth > 1 && byUrl.get(parentUrl);
			if (parent) parent.children.push(byUrl.get(p.url));
			else top.push(byUrl.get(p.url));
		}
		return top;
	});

	// The flat list behind /sitemap.xml. robots.txt has advertised that file
	// since the redirects landed, but nothing ever generated it, so the line
	// pointed at a 404 (README §9 Phase H listed it as outstanding).
	//
	// Deliberately a second collection rather than a reshape of sitemapPages:
	// that one is nested by path depth because the human page renders it as a
	// tree, and it drops date_modified on the way. This one is flat and carries
	// a lastmod, which is the only thing in the build that reads date_modified —
	// every one of the 370 records has carried that field since the import and
	// until now nothing consumed it.
	//
	// What is excluded, and why: /search/ (a distinct URL per query, already
	// Disallow'd in robots.txt), 404, and the paginated archive pages
	// (/culture/page/2/ …), which are navigation over the posts rather than
	// content of their own — the posts themselves are all listed individually.
	eleventyConfig.addCollection("sitemapUrls", (api) => {
		const entry = (url, lastmod) => ({ url, lastmod: lastmod || "" });
		const urls = [entry("/")];
		for (const p of api.getFilteredByTag("pages")) {
			if ((p.data.status || "publish") !== "publish") continue;
			if (!GENERIC_PAGE_TYPES.has(p.data.page_type) && !BESPOKE_PAGES.has(p.data.slug)) continue;
			if (!p.data.path || p.data.path === "/") continue;
			urls.push(entry(p.data.path, p.data.date_modified));
		}
		urls.push(entry("/culture/"), entry("/whats-new/"));
		for (const post of api.getFilteredByTag("posts")) {
			const cat = category(post.data.category);
			if (cat) urls.push(entry(`${cat.path}${post.data.slug}/`, post.data.date_modified));
		}
		for (const loc of api.getFilteredByTag("locations")) {
			urls.push(entry(`/location/${loc.data.slug}/`, loc.data.date_modified));
		}
		for (const person of api.getFilteredByTag("personnel")) {
			urls.push(entry(`/personnel/${person.data.slug}/`, person.data.date_modified));
		}
		return urls.sort((a, b) => a.url.localeCompare(b.url));
	});

	// Pagefind builds its index by reading the *output* HTML, so it has to run
	// after Eleventy writes _site. Doing it here rather than only as a postbuild
	// script means /search/ also works under `npm start` — otherwise search is
	// silently dead in dev and only testable via a full production build.
	// Writing into _site/pagefind/ doesn't retrigger a rebuild: the dev server
	// watches the input dir (site/), not the output.
	eleventyConfig.on("eleventy.after", async ({ dir, runMode }) => {
		if (runMode !== "build" && runMode !== "serve") return;
		const { createIndex } = await import("pagefind");
		const { index } = await createIndex();
		await index.addDirectory({ path: dir.output });
		await index.writeFiles({ outputPath: path.join(dir.output, "pagefind") });
	});

	return {
		dir: {
			input: "site",
			output: "_site",
			includes: "_includes",
			data: "_data",
		},
		htmlTemplateEngine: "njk",
		markdownTemplateEngine: "njk",
	};
};
