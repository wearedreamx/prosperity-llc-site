module.exports = {
	tags: ["locations"],
	permalink: false,
	// "md" rather than false: the body is Markdown and has to be rendered, but
	// Nunjucks must stay out of it — editor copy is not a template, and a stray
	// {{ or {% in a description would otherwise break the build.
	templateEngineOverride: "md",
};
