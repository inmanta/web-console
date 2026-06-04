#!/usr/bin/env node
/**
 * Verifies that no CDN URLs survived into the production bundle.
 *
 * Our customers run the web console in controlled
 * environments where outbound internet access is restricted. Requests to
 * external CDNs (cdn.jsdelivr.net, esm.sh, …) would be silently blocked by
 * their firewalls, causing Monaco Editor and related tooling to fail at
 * runtime. All editor assets must therefore be self-hosted and bundled
 * locally — no runtime CDN fetches allowed.
 *
 * Run this after every production build (yarn build:ci) to catch regressions
 * early, before they reach a customer environment.
 */
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const distDir = "dist";
const cdnPatterns = ["esm.sh", "cdn.jsdelivr.net"];

const jsFiles = readdirSync(distDir).filter((f) => f.endsWith(".js"));

const hits = [];
for (const file of jsFiles) {
  const content = readFileSync(join(distDir, file), "utf8");
  for (const pattern of cdnPatterns) {
    if (content.includes(pattern)) {
      hits.push(`${file} (contains "${pattern}")`);
      break;
    }
  }
}

if (hits.length) {
  console.error("ERROR: CDN URLs found in bundle:");
  for (const hit of hits) {
    console.error("  " + hit);
  }
  process.exit(1);
}

console.log("OK: no CDN URLs in bundle");
