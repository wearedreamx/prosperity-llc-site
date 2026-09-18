/*
 * Search results for /search/ — queries the Pagefind index built into
 * /pagefind/ by the eleventy.after hook in eleventy.config.js.
 *
 * Loaded as a module so the Pagefind bundle can be imported dynamically; a
 * static import would make the dev server try to resolve /pagefind/pagefind.js
 * at load time, and it only exists after the index is written.
 */
const RESULTS_PER_PAGE = 9;
const FALLBACK_IMAGE = "/assets/img/services/meet-the-team.jpg";

/*
 * ?type= narrows results to one content type via Pagefind's `type` filter
 * (emitted as data-pagefind-filter in base.njk). The team directory's "Search
 * members" box submits type=personnel so it searches people rather than the
 * whole site, matching the theme's hidden post_type input. Only known values
 * are honoured — an unrecognized one would filter to zero results.
 */
const SEARCH_TYPES = {
	personnel: "team members",
	post: "news & culture posts",
	location: "offices",
	page: "pages",
};

const queryEl = document.getElementById("search-query");
const statusEl = document.getElementById("search-status");
const resultsEl = document.getElementById("search-results");
const moreEl = document.getElementById("search-more");
const moreContainerEl = document.getElementById("search-more-container");
const inputEl = document.getElementById("search-page-input");
const typeInputEl = document.getElementById("search-page-type");

const params = new URLSearchParams(window.location.search);
const query = params.get("q") || "";
const rawType = params.get("type") || "";
const type = Object.hasOwn(SEARCH_TYPES, rawType) ? rawType : "";

if (queryEl) queryEl.textContent = query;
if (inputEl) inputEl.value = query;
// Carry the scope on this page's own form so refining a scoped search stays
// scoped. Disabled when unscoped so the form doesn't submit an empty ?type=.
if (typeInputEl) {
	typeInputEl.value = type;
	typeInputEl.disabled = !type;
}
// The brand comes off the server-rendered title (base.njk appends it) rather
// than being written out again here.
const BRAND = document.title.split(" - ").slice(1).join(" - ");
if (query) document.title = `Search Results for: ${query}${BRAND ? ` - ${BRAND}` : ""}`;

/** Escape text taken from the index before it goes into innerHTML. */
function escapeHtml(value) {
	return String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

/*
 * One result card. Matches the markup of parts/content-search.php: a linked
 * figure + title + excerpt. Pagefind returns `excerpt` with the matched terms
 * already wrapped in <mark>, so that one field is inserted as HTML while
 * everything else is escaped.
 */
function resultCard(result) {
	const url = escapeHtml(result.url);
	const title = escapeHtml(result.meta?.title || result.url);
	const image = escapeHtml(result.meta?.image || FALLBACK_IMAGE);
	return `
	<article class="card">
		<a class="card__link" href="${url}">
			<figure class="card__figure">
				<!-- alt="" for the same reason as post-card.njk / team-card.njk: the
				     <h3> below is inside this same <a>, so the title is already the
				     link's accessible name. -->
				<img src="${image}" alt="" loading="lazy">
			</figure>
			<div class="card__body">
				<h3 class="card__title">${title}</h3>
				<p class="card__excerpt">${result.excerpt}</p>
				<p class="card__excerpt"><span class="card__more">Read More</span></p>
			</div>
		</a>
	</article>`;
}

function setStatus(message) {
	if (statusEl) statusEl.textContent = message;
}

async function run() {
	if (!resultsEl) return;

	if (!query.trim()) {
		setStatus("Enter a search term above.");
		return;
	}

	setStatus("Searching…");

	let pagefind;
	try {
		pagefind = await import(/* @vite-ignore */ "/pagefind/pagefind.js");
		await pagefind.init();
	} catch (err) {
		// The index is written by eleventy.config.js's `eleventy.after` hook, so
		// it exists under `npm start` as well as `npm run build`. What this
		// branch really catches in production is a CSP without
		// 'wasm-unsafe-eval' — Pagefind is WebAssembly, and _headers is not
		// applied by the dev server, so that failure is invisible locally.
		setStatus("Search is unavailable on this build.");
		console.error("Pagefind failed to load:", err);
		return;
	}

	const search = await pagefind.search(query, type ? { filters: { type } } : undefined);

	const scope = type ? ` in ${SEARCH_TYPES[type]}` : "";

	if (!search.results.length) {
		setStatus(`No results found for “${query}”${scope}.`);
		resultsEl.innerHTML = `<div class="content"><p>There is nothing to show here.</p></div>`;
		return;
	}

	const total = search.results.length;
	setStatus(`${total} result${total === 1 ? "" : "s"} for “${query}”${scope}.`);

	let shown = 0;
	const showNextPage = async () => {
		const batch = search.results.slice(shown, shown + RESULTS_PER_PAGE);
		const data = await Promise.all(batch.map((r) => r.data()));
		resultsEl.insertAdjacentHTML("beforeend", data.map(resultCard).join(""));
		shown += batch.length;
		if (moreContainerEl) moreContainerEl.hidden = shown >= total;
	};

	await showNextPage();
	if (moreEl) moreEl.addEventListener("click", showNextPage);
}

run();
