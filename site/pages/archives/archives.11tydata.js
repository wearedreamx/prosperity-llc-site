/*
 * Shared frontmatter for the two post archives, /culture/ and /whats-new/.
 *
 * They have to stay two template files — Eleventy paginates one collection per
 * file — but they were two copies of the same thirteen lines, differing in six
 * values, and each repeated its own category description twice (once as
 * `description`, once as `archiveDescription`, byte-identical). Everything that
 * was the same in both now lives here; each template declares only what makes
 * it that archive. The body was already shared via _includes/post-archive.njk.
 *
 * This is the same arrangement the content collections already use
 * (site/content/<type>/<type>.11tydata.js), applied to a directory of templates.
 */
const fs = require("fs");
const path = require("path");

// Same file, same reason as eleventy.config.js's readData: an archive's path
// belongs to data/post-categories.json, so /culture/ cannot drift from the
// category path the post permalinks are built with. readFileSync rather than
// require so `eleventy --serve` sees an edit.
const CATEGORIES = path.join(__dirname, "..", "..", "..", "data", "post-categories.json");
const categoryPath = (slug) => {
	const found = JSON.parse(fs.readFileSync(CATEGORIES, "utf8")).categories.find((c) => c.slug === slug);
	if (!found) throw new Error(`archives: no category "${slug}" in data/post-categories.json`);
	return found.path;
};

// " - Page 2 of 8" on every page but the first. Without it all 8 /culture/
// pages and all 4 /whats-new/ pages shipped one identical <title> and one
// identical <meta description> — 12 pages that looked like duplicates of each
// other to a crawler.
const pageSuffix = (pagination) => {
	const n = pagination.pageNumber + 1;
	return n > 1 ? ` - Page ${n} of ${pagination.pages.length}` : "";
};

module.exports = {
	layout: "base.njk",
	// Kept out of the Pagefind index: a card list matches every query and would
	// outrank the post it is a card for. See base.njk.
	noIndex: true,
	eleventyComputed: {
		permalink: (data) => {
			const base = categoryPath(data.archiveSlug);
			return data.pagination.pageNumber === 0
				? base
				: `${base}page/${data.pagination.pageNumber + 1}/`;
		},
		title: (data) => `${data.archiveTitle}${pageSuffix(data.pagination)}`,
		// `archiveSummary` is the meta description and `archiveDescription` is the
		// blurb printed in the banner. They used to be one 309-character string
		// used for both, which is twice as long as a description wants to be and
		// reads as page copy rather than as a search result.
		description: (data) => `${data.archiveSummary}${pageSuffix(data.pagination)}`,
		ogImage: (data) => `${data.global.site_url}${data.archiveImage}`,
	},
};
