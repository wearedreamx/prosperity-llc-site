/*
 * Site-wide data — footer contact details, locations, disclaimer, copyright.
 *
 * Read with readFileSync rather than require() on purpose. `require` caches by
 * path, so under `eleventy --serve` the first load would be handed back for the
 * rest of the session and an edit to data/global.json would never reach the
 * page. Eleventy also only watches its input dir (site/), so data/ is added to
 * the watch list here — without both halves, editing this data in dev appeared
 * to do nothing.
 */
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "..", "data", "global.json");

module.exports = () => JSON.parse(fs.readFileSync(FILE, "utf8"));
