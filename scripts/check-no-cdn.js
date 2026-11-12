#!/usr/bin/env node
/**
 * Verifies that no CDN URLs survived into the production builds.
 *
 * Our customers run the web console in controlled
 * environments where outbound internet access is restricted. Requests to
 * external CDNs (cdn.jsdelivr.net, esm.sh, …) would be silently blocked by
 * their firewalls, causing Monaco Editor and related tooling to fail at
 * runtime. All editor assets must therefore be self-hosted and bundled
 * locally — no runtime CDN fetches allowed.
 *
 * Run this after every production build (yarn build:ci) to catch regressions
 * early, before they reach a customer environment. It checks every build that
 * `yarn build:ci` makes: the ISO app (dist), the OSS app (apps/oss/dist) and the
 * composer's separate build (packages/features/composer/dist), or the folders given
 * as arguments, e.g. `yarn check-no-cdn apps/oss/dist`.
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";

const defaultDistDirs = ["dist", "apps/oss/dist", "packages/features/composer/dist"];
const distDirs = process.argv.length > 2 ? process.argv.slice(2) : defaultDistDirs;
const cdnPatterns = ["esm.sh", "cdn.jsdelivr.net"];

const missing = distDirs.filter((dir) => !existsSync(dir));

if (missing.length) {
  console.error(`ERROR: no build in ${missing.join(", ")}, run \`yarn build:ci\` first.`);
  process.exit(1);
}

const hits = [];
const withoutJs = [];
for (const distDir of distDirs) {
  const jsFiles = readdirSync(distDir).filter((f) => f.endsWith(".js"));

  // Otherwise a build whose scripts land in another folder would pass without being checked.
  if (jsFiles.length === 0) {
    withoutJs.push(distDir);
  }
  for (const file of jsFiles) {
    const content = readFileSync(join(distDir, file), "utf8");
    for (const pattern of cdnPatterns) {
      if (content.includes(pattern)) {
        hits.push(`${join(distDir, file)} (contains "${pattern}")`);
        break;
      }
    }
  }
}

if (withoutJs.length) {
  console.error(`ERROR: no .js files in ${withoutJs.join(", ")}, nothing to check.`);
  process.exit(1);
}

if (hits.length) {
  console.error("ERROR: CDN URLs found in bundle:");
  for (const hit of hits) {
    console.error("  " + hit);
  }
  process.exit(1);
}

console.log(`OK: no CDN URLs in ${distDirs.join(", ")}`);
