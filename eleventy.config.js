module.exports = function (eleventyConfig) {
	eleventyConfig.addPassthroughCopy("site/assets");
	eleventyConfig.addPassthroughCopy("site/favicon.ico");
	eleventyConfig.addPassthroughCopy("site/favicon-16x16.png");
	eleventyConfig.addPassthroughCopy("site/favicon-32x32.png");
	eleventyConfig.addPassthroughCopy("site/apple-icon-180x180.png");
	eleventyConfig.addPassthroughCopy("site/android-icon-*.png");
	eleventyConfig.addPassthroughCopy("site/ms-icon-*.png");
	eleventyConfig.addPassthroughCopy("site/manifest.json");
	eleventyConfig.addPassthroughCopy("site/browserconfig.xml");

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
