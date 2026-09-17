#!/usr/bin/env node
/*
 * Opens the dev server in a browser tab shortly after `npm start`, then exits
 * immediately so it never holds up Eleventy.
 *
 * The delay exists because the browser has to be pointed at the server before
 * the server is listening; a detached child that sleeps is the portable way to
 * do that. The previous shell version — `(sleep 1.5 && ./open-chrome-tab.sh &)`
 * in package.json — relied on `sleep`, `&`, subshells and `;`, none of which
 * work in cmd.exe, so `npm start` failed on Windows before Eleventy ever ran.
 *
 * On macOS it focuses an existing tab on the URL rather than stacking up
 * duplicates on every restart (see open-chrome-tab.applescript). Elsewhere it
 * hands off to the OS default-browser opener, which will reuse a tab only if
 * the browser itself decides to.
 */
const { spawn } = require("child_process");
const path = require("path");

const URL = "http://localhost:8080";
const DELAY_MS = 1500;

function command() {
	if (process.platform === "darwin") {
		return { cmd: "osascript", args: [path.join(__dirname, "open-chrome-tab.applescript"), URL] };
	}
	if (process.platform === "win32") {
		// `start` is a cmd builtin, not an executable; the empty string is the
		// window title, which start would otherwise take the URL to be.
		return { cmd: "cmd", args: ["/c", "start", "", URL], windowsVerbatimArguments: true };
	}
	return { cmd: "xdg-open", args: [URL] };
}

const { cmd, args, windowsVerbatimArguments } = command();

// Re-exec self as a detached grandchild that waits, so `npm start` proceeds to
// Eleventy right away instead of blocking for the delay.
if (process.argv[2] === "--delayed") {
	setTimeout(() => {
		const child = spawn(cmd, args, { stdio: "ignore", detached: true, windowsVerbatimArguments });
		// A browser that isn't installed shouldn't take the dev server down.
		child.on("error", () => {});
		child.unref();
	}, DELAY_MS);
} else {
	const child = spawn(process.execPath, [__filename, "--delayed"], {
		stdio: "ignore",
		detached: true,
	});
	child.on("error", () => {});
	child.unref();
}
