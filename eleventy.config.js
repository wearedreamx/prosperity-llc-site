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

	// Cloudflare Pages redirect rules — must land at the deploy root (_site/_redirects).
	eleventyConfig.addPassthroughCopy({ "site/_redirects": "_redirects" });

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

	// Some pages had a server-rendered form widget embedded mid-content rather
	// than in its own raw:cta block. The import left a marker div in its place,
	// tagged data-form-variant — "contact" for the one form with an extra
	// referral-source field (see README §10), "standard" for the rest. Render
	// the real contact-form.njk
	// component through Nunjucks (not a plain string swap) so its
	// {% if formVariant %} branch picks the right shape.
	const path = require("path");
	const nunjucks = require("nunjucks");
	const formEnv = new nunjucks.Environment(
		new nunjucks.FileSystemLoader(path.join(__dirname, "site", "_includes"))
	);
	eleventyConfig.addFilter("injectContactForm", (html) =>
		html.replace(
			/<div class="cta-form-placeholder"(?: data-form-variant="(\w+)")?><\/div>/g,
			(_match, formVariant) => formEnv.render("contact-form.njk", { formVariant })
		)
	);

	// Content lives one file per record under site/content/<type>/*.md —
	// personnel/posts/locations/pages are auto-tagged via
	// each folder's <type>.11tydata.js, so `collections.personnel` etc. already
	// exist. These derived collections replicate what the old flat
	// data/*.json + site/_data/*.js wrappers used to filter/sort in memory.
	// /meet-the-team/ order must match the live site: a pinned leadership block
	// first, then everyone else by last name. The pinned ids live in
	// data/team-pinned.json. Sorting on the record's own last_name field rather
	// than splitting the display name, which breaks on compound and multi-word
	// surnames.
	eleventyConfig.addCollection("teamOrder", (api) => {
		const pinnedSlugs = require("./data/team-pinned.json").slugs;
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
		const pinnedByLocation = require("./data/team-pinned.json").byLocation || {};
		const slugOf = (p) => (p.data.location_url || "").replace("/location/", "").replace(/\//g, "");
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

	eleventyConfig.addCollection("culturePosts", (api) =>
		api.getFilteredByTag("posts")
			.filter((p) => p.data.category_name === "Culture")
			.sort((a, b) => (a.data.published < b.data.published ? 1 : -1))
	);
	eleventyConfig.addCollection("whatsNewPosts", (api) =>
		api.getFilteredByTag("posts")
			.filter((p) => p.data.category_name === "What's New")
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
	// Draft and private pages are kept in the repo so nothing is lost, but they
	// must not ship until §11's open decisions are made.
	eleventyConfig.addCollection("genericPages", (api) =>
		api
			.getFilteredByTag("pages")
			.filter((p) => GENERIC_PAGE_TYPES.has(p.data.page_type))
			.filter((p) => (p.data.status || "publish") === "publish")
	);

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
