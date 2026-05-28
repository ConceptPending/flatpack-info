#!/usr/bin/env node
// Refresh content from the canonical Flatpack repo into the site:
//   - templates/*.html  + examples/*.html  → try/*.html
//   - agent-rules/*.{md,mdc}               → agent-rules/*.{md,mdc}
//
// The site serves real, working Flatpacks under /try/ and the
// canonical agent-rules under /agent-rules/. To keep them current
// without coupling repos, this script copies the latest versions in.
//
// Usage:
//   node tools/sync-upstream.mjs                    # default: ../flatpack
//   node tools/sync-upstream.mjs --src /path/to/flatpack
//
// Intended to be run before every deploy. Doesn't fetch from GitHub —
// expects the Flatpack repo to be cloned locally as a sibling directory.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const argv = process.argv.slice(2);
let src = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..", "flatpack");
const srcIdx = argv.indexOf("--src");
if (srcIdx >= 0 && argv[srcIdx + 1]) src = path.resolve(argv[srcIdx + 1]);

const siteRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

if (!fs.existsSync(src)) {
  console.error(`Source repo not found: ${src}`);
  console.error(`Pass --src /path/to/flatpack`);
  process.exit(2);
}

/**
 * @param {string} fromDir absolute path in the upstream repo
 * @param {string} toDir   absolute path in the site repo
 * @param {(name: string) => boolean} accept
 * @returns {number} number of files copied
 */
function syncDir(fromDir, toDir, accept) {
  if (!fs.existsSync(fromDir)) return 0;
  fs.mkdirSync(toDir, { recursive: true });
  let n = 0;
  for (const entry of fs.readdirSync(fromDir)) {
    if (!accept(entry)) continue;
    fs.copyFileSync(path.join(fromDir, entry), path.join(toDir, entry));
    n++;
  }
  return n;
}

const isHtml = (n) => n.endsWith(".html");
const isAgentRule = (n) => n.endsWith(".md") || n.endsWith(".mdc");

// /try/ — combine templates + examples into one flat directory.
const tryDst = path.join(siteRoot, "try");
const fromTemplates = syncDir(path.join(src, "templates"), tryDst, isHtml);
const fromExamples  = syncDir(path.join(src, "examples"),  tryDst, isHtml);

// /agent-rules/ — mirror straight across (README + 5 rule files).
const ruleDst = path.join(siteRoot, "agent-rules");
const fromRules = syncDir(path.join(src, "agent-rules"), ruleDst, isAgentRule);

console.log("Synced from", src);
console.log(`  ${fromTemplates}  template HTML files  → try/`);
console.log(`  ${fromExamples}  example HTML files   → try/`);
console.log(`  ${fromRules}  agent-rule files     → agent-rules/`);
console.log(`Total: ${fromTemplates + fromExamples + fromRules} files`);
