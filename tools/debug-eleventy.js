#!/usr/bin/env node
/*
 * Runs Eleventy with DEBUG enabled, cross-platform.
 *
 * `DEBUG=Eleventy* eleventy` — the previous package.json script — is bash
 * syntax: cmd.exe treats the VAR=value prefix as a command name and fails, so
 * `npm run debug` was macOS/Linux-only. Setting the variable in the environment
 * we hand to the child works everywhere.
 *
 * The binary is located by path rather than by `require` because @11ty/eleventy
 * exports neither ./cmd.cjs nor ./package.json, so both resolve to
 * ERR_PACKAGE_PATH_NOT_EXPORTED. npm puts node_modules/.bin on PATH for run
 * scripts, but that shim is a shell script on POSIX and needs shell:true on
 * Windows, so invoking cmd.cjs with the current node binary is simpler and
 * avoids a shell entirely.
 */
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const eleventy = path.join(__dirname, "..", "node_modules", "@11ty", "eleventy", "cmd.cjs");
if (!fs.existsSync(eleventy)) {
	console.error(`Cannot find Eleventy at ${eleventy} — run \`npm install\` first.`);
	process.exit(1);
}

const child = spawn(process.execPath, [eleventy, ...process.argv.slice(2)], {
	stdio: "inherit",
	env: { ...process.env, DEBUG: process.env.DEBUG || "Eleventy*" },
});
child.on("exit", (code, signal) => {
	// Re-raise rather than swallowing the signal, so Ctrl-C behaves normally.
	if (signal) process.kill(process.pid, signal);
	else process.exit(code ?? 0);
});
