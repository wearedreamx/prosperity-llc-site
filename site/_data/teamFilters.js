/* Options for the /meet-the-team/ 3-facet filter. readFileSync, not require —
 * see the note in global.js about the require cache and `eleventy --serve`. */
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "..", "data", "team-filters.json");

module.exports = () => JSON.parse(fs.readFileSync(FILE, "utf8")).facets;
