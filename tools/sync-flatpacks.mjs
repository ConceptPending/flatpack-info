#!/usr/bin/env node
// Refresh try/*.html from the canonical Flatpack repo.
//
// The landing page serves real, working Flatpacks under /try/. To keep
// them current with the upstream templates and examples without coupling
// the two repos, this script copies the latest versions in.
//
// Usage:
//   node tools/sync-flatpacks.mjs                    # default: ../flatpack
//   node tools/sync-flatpacks.mjs --src /path/to/flatpack
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

const dst = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "try");

if (!fs.existsSync(src)) {
  console.error(`Source repo not found: ${src}`);
  console.error(`Pass --src /path/to/flatpack`);
  process.exit(2);
}

fs.mkdirSync(dst, { recursive: true });

let copied = 0;
for (const subdir of ["templates", "examples"]) {
  const dir = path.join(src, subdir);
  if (!fs.existsSync(dir)) continue;
  for (const entry of fs.readdirSync(dir)) {
    if (!entry.endsWith(".html")) continue;
    const from = path.join(dir, entry);
    const to = path.join(dst, entry);
    fs.copyFileSync(from, to);
    copied++;
    console.log(`  ${subdir}/${entry} → try/${entry}`);
  }
}

console.log(`\nCopied ${copied} Flatpack(s) from ${src} into try/.`);
