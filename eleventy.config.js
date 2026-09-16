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

	// Some pages have a Gravity Forms widget (WordPress-only, no backend in the
	// new site) embedded mid-content rather than in its own raw:cta block —
	// tools/extract.py replaces it with a marker div tagged data-form-variant
	// ("contact" for the one form with an extra referral-source field, see
	// README §10; "standard" for the rest). Render the real contact-form.njk
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

	// Content lives one file per record under site/content/<type>/*.md (see
	// tools/extract.py) — personnel/posts/locations/pages are auto-tagged via
	// each folder's <type>.11tydata.js, so `collections.personnel` etc. already
	// exist. These derived collections replicate what the old flat
	// data/*.json + site/_data/*.js wrappers used to filter/sort in memory.
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
	const GENERIC_PAGE_TYPES = new Set(["page", "page-services", "page-portal"]);
	eleventyConfig.addCollection("genericPages", (api) =>
		api.getFilteredByTag("pages").filter((p) => GENERIC_PAGE_TYPES.has(p.data.page_type))
	);

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
