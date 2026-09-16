const path = require("path");
const posts = require(path.join(__dirname, "..", "..", "data", "posts.json"));

module.exports = () =>
	[...posts]
		.filter((p) => p.category_name === "Culture")
		.sort((a, b) => (a.published < b.published ? 1 : -1));
