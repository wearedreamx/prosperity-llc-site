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
	var hero = document.querySelector(".hero__video");
	if (hero) {
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
})();
