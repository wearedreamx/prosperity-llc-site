const path = require("path");
const pages = require(path.join(__dirname, "..", "..", "data", "pages.json"));

const GENERIC_TYPES = new Set(["page", "page-services", "page-portal"]);

module.exports = () => pages.filter((p) => GENERIC_TYPES.has(p.page_type));
