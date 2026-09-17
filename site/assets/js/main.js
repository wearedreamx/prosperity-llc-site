/* Prosperity Partners — site behaviour (no dependencies) */
(function () {
	"use strict";

	var body = document.body;
	var nav = document.getElementById("site-nav");
	var hamburger = document.querySelector(".hamburger");
	var mobileBreakpoint = window.matchMedia("(max-width: 1080px)");

	/* ---- Mobile navigation ---------------------------------------------- */
	function openNav() {
		nav.classList.add("is-open");
		body.classList.add("nav-open");
		hamburger.setAttribute("aria-expanded", "true");
		hamburger.setAttribute("aria-label", "Close menu");
	}
	function closeNav() {
		nav.classList.remove("is-open");
		body.classList.remove("nav-open");
		hamburger.setAttribute("aria-expanded", "false");
		hamburger.setAttribute("aria-label", "Open menu");
	}

	if (hamburger && nav) {
		hamburger.addEventListener("click", function () {
			nav.classList.contains("is-open") ? closeNav() : openNav();
		});
		nav.querySelectorAll("[data-nav-close]").forEach(function (el) {
			el.addEventListener("click", closeNav);
		});

		// Submenu accordions (only meaningful in the mobile layout; on desktop
		// submenus open on hover/focus via CSS).
		nav.querySelectorAll(".menu__toggle").forEach(function (toggle) {
			toggle.addEventListener("click", function () {
				var submenu = toggle.nextElementSibling;
				var open = toggle.getAttribute("aria-expanded") === "true";
				toggle.setAttribute("aria-expanded", String(!open));
				if (submenu) submenu.classList.toggle("is-open", !open);
			});
		});

		// Leaving the mobile layout with the drawer open would leave the body
		// scroll-locked, so reset when the viewport crosses the breakpoint.
		mobileBreakpoint.addEventListener("change", function (e) {
			if (!e.matches) closeNav();
		});
	}

	/* ---- Header search ---------------------------------------------------- */
	var searchButton = document.querySelector(".site-search__button");
	var searchForm = document.getElementById("site-search-form");
	if (searchButton && searchForm) {
		searchButton.addEventListener("click", function (e) {
			e.stopPropagation();
			var open = searchForm.classList.toggle("is-open");
			searchButton.setAttribute("aria-expanded", String(open));
			if (open) searchForm.querySelector("input").focus();
		});
		document.addEventListener("click", function (e) {
			if (!searchForm.contains(e.target) && searchForm.classList.contains("is-open")) {
				searchForm.classList.remove("is-open");
				searchButton.setAttribute("aria-expanded", "false");
			}
		});
	}

	document.addEventListener("keydown", function (e) {
		if (e.key !== "Escape") return;
		if (nav && nav.classList.contains("is-open")) closeNav();
		if (searchForm && searchForm.classList.contains("is-open")) {
			searchForm.classList.remove("is-open");
			searchButton.setAttribute("aria-expanded", "false");
		}
	});

	/* ---- Scroll-reveal ---------------------------------------------------- */
	var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

	function inViewport(el) {
		var r = el.getBoundingClientRect();
		return r.top < window.innerHeight * 0.9 && r.bottom > 0;
	}
	function show(el) { el.classList.add("is-visible"); }

	// Anything already on screen (the hero, typically) is revealed synchronously
	// so it never waits on an observer callback; the observer handles the rest.
	var pending = revealEls.filter(function (el) {
		if (inViewport(el)) { show(el); return false; }
		return true;
	});

	if ("IntersectionObserver" in window && pending.length) {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					show(entry.target);
					io.unobserve(entry.target);
				}
			});
		}, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
		pending.forEach(function (el) { io.observe(el); });
	} else {
		pending.forEach(show);
	}

	// Back/forward-cache restores skip the load path; re-run the viewport pass.
	window.addEventListener("pageshow", function (e) {
		if (e.persisted) revealEls.forEach(function (el) { if (inViewport(el)) show(el); });
	});

	/* ---- Hero video ------------------------------------------------------- */
	// Autoplay is a hint, not a guarantee (data-saver, low-power mode). If the
	// browser declined, leave the poster showing rather than a frozen frame.
	//
	// .hero__video is an <img> of the poster frame whenever the hero video has
	// no CDN URL to point at (README §9.3), and an <img> has no play/pause — so
	// this has to check the element type, not just that something matched.
	// Without the check it threw "hero.play is not a function" on every
	// homepage load and aborted everything below it in this file.
	var hero = document.querySelector(".hero__video");
	if (hero && hero.tagName === "VIDEO") {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			hero.removeAttribute("autoplay");
			hero.pause();
		} else {
			var p = hero.play();
			if (p && p.catch) p.catch(function () { hero.load(); });
		}
	}

	/* ---- Contact form "How did you hear about us?" other field ------------ */
	// Only the site-wide Contact Form (contact-form.njk's "contact" variant)
	// has this radio group; reveal the free-text field only when its "Other"
	// option is selected, and require it only in that state.
	document.querySelectorAll(".field--radio-group").forEach(function (group) {
		var otherRadio = group.querySelector("[data-toggle-other]");
		var otherField = group.querySelector("[data-other-field]");
		if (!otherRadio || !otherField) return;
		var otherInput = otherField.querySelector("input");
		group.querySelectorAll('input[type="radio"]').forEach(function (radio) {
			radio.addEventListener("change", function () {
				var show = otherRadio.checked;
				otherField.hidden = !show;
				if (otherInput) otherInput.required = show;
			});
		});
	});

	/* ---- Location pages: jump to another office --------------------------- */
	// The live site does this with an inline onchange attribute; keeping it here
	// means no inline script, so the CSP in site/_headers stays meaningful.
	document.querySelectorAll("[data-location-jump]").forEach(function (select) {
		select.addEventListener("change", function () {
			if (select.value) window.location.href = select.value;
		});
	});

	/* ---- Team directory 3-facet filter ---------------------------------- */
	// Ported from the theme's jQuery handler in assets/js/g.min.js. Each card
	// carries its terms as classes (title facet, location slug, service lines);
	// a card stays visible only while its class list contains EVERY selected
	// term. The two-step opacity/display change is what the theme's CSS
	// animates: .active fades in, .disabled removes from flow 500ms later.
	var filterRoot = document.querySelector(".team-filters-container");
	if (filterRoot) {
		var members = Array.prototype.slice.call(document.querySelectorAll(".team-member"));
		var timers = new WeakMap();
		// "Search members" narrows by name, combining with the facet dropdowns
		// rather than replacing them (a card must satisfy both).
		var nameQuery = "";

		function classTerms(el) {
			return el.className.split(/\s+/);
		}

		function matchesName(card) {
			if (!nameQuery) return true;
			return (card.getAttribute("data-name") || "").toLowerCase().indexOf(nameQuery) !== -1;
		}

		function applyFilter() {
			var selected = [];
			filterRoot.querySelectorAll(".team-filter-link.active").forEach(function (link) {
				var term = link.getAttribute("data-term");
				if (term && term !== "all") selected.push(term);
			});
			var visible = 0;
			members.forEach(function (card) {
				var terms = classTerms(card);
				var shown = matchesName(card) && selected.every(function (t) { return terms.indexOf(t) !== -1; });
				if (shown) visible++;
				clearTimeout(timers.get(card));
				if (shown) {
					card.classList.remove("disabled");
					timers.set(card, setTimeout(function () { card.classList.add("active"); }, 20));
				} else {
					card.classList.remove("active");
					timers.set(card, setTimeout(function () { card.classList.add("disabled"); }, 500));
				}
			});
			announce(visible);
		}

		// Without this an empty grid reads as a blank page, with no indication
		// the filter is what emptied it.
		var emptyEl = document.querySelector("[data-team-empty]");
		function announce(visible) {
			if (!emptyEl) return;
			emptyEl.hidden = visible !== 0;
			if (visible === 0) {
				emptyEl.textContent = nameQuery
					? "No team members match “" + nameQuery + "”."
					: "No team members match those filters.";
			}
		}

		var teamSearchForm = filterRoot.querySelector("[data-team-search]");
		if (teamSearchForm) {
			var teamSearchInput = teamSearchForm.querySelector(".team-search-input");
			// Filter as they type, and keep submit on the same page — the form's
			// GET action is only the no-JS fallback.
			teamSearchForm.addEventListener("submit", function (e) {
				e.preventDefault();
				applyFilter();
			});
			teamSearchInput.addEventListener("input", function () {
				nameQuery = teamSearchInput.value.trim().toLowerCase();
				applyFilter();
			});
		}

		// Hover opens the dropdown, as in the theme. The trigger and the options
		// are <button>s, so click covers keyboard (Enter/Space) and touch — where
		// there is no hover at all — without separate keydown handlers.
		filterRoot.querySelectorAll(".team-filter").forEach(function (filter) {
			var dropdown = filter.querySelector(".team-filter-dropdown");
			var header = filter.querySelector(".team-filter-header");
			if (!dropdown || !header) return;

			function open(state) {
				dropdown.classList.toggle("active", state);
				header.setAttribute("aria-expanded", state ? "true" : "false");
			}

			filter.addEventListener("mouseover", function () { open(true); });
			filter.addEventListener("mouseout", function () { open(false); });
			header.addEventListener("click", function () {
				open(!dropdown.classList.contains("active"));
			});

			dropdown.querySelectorAll(".team-filter-link").forEach(function (link) {
				link.addEventListener("click", function () {
					dropdown.querySelectorAll(".team-filter-link").forEach(function (sib) {
						sib.classList.remove("active");
					});
					link.classList.add("active");
					header.textContent = link.textContent;
					open(false);
					// Hovering out is what used to close this; a keyboard user never
					// hovers, so move focus back to the trigger they opened it from.
					header.focus();
					applyFilter();
				});
			});

			// Escape closes the open dropdown without changing the selection.
			filter.addEventListener("keydown", function (e) {
				if (e.key === "Escape" && dropdown.classList.contains("active")) {
					open(false);
					header.focus();
				}
			});
		});

		function resetFilter() {
			filterRoot.querySelectorAll(".team-filter-dropdown").forEach(function (dropdown) {
				dropdown.querySelectorAll(".team-filter-link").forEach(function (link) {
					link.classList.toggle("active", link.getAttribute("data-term") === "all");
				});
				var header = dropdown.parentNode.querySelector(".team-filter-header");
				var label = dropdown.parentNode.getAttribute("data-label");
				if (header && label) header.textContent = label;
			});
			nameQuery = "";
			var input = filterRoot.querySelector(".team-search-input");
			if (input) input.value = "";
			members.forEach(function (card) {
				clearTimeout(timers.get(card));
				card.classList.remove("disabled");
				card.classList.add("active");
			});
			announce(members.length);
		}

		var reset = filterRoot.querySelector(".team-filter-reset");
		if (reset) reset.addEventListener("click", resetFilter);
	}
})();
