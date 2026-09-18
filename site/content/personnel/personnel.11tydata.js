module.exports = {
	tags: ["personnel"],
	permalink: false,
	// "md" rather than false: the body is Markdown and has to be rendered, but
	// Nunjucks must stay out of it — editor copy is not a template, and a stray
	// {{ or {% in a bio would otherwise break the build.
	templateEngineOverride: "md",
};
