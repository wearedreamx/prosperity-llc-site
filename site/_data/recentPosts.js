const path = require("path");
const posts = require(path.join(__dirname, "..", "..", "data", "posts.json"));

module.exports = () =>
	[...posts].sort((a, b) => (a.published < b.published ? 1 : -1)).slice(0, 4);
