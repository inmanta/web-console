#!/usr/bin/env node
/**
 * Verifies that every build `yarn build:ci` makes carries the version in package.json: the ISO
 * app (dist), the OSS app (apps/oss/dist) and the composer's separate build
 * (packages/features/composer/dist). Each feature is stamped with that version (`version:
 * APP_VERSION` in its FeatureModule), and an app leaves out a feature loaded at runtime whose
 * version differs from its own, so the composer only installs on an app of the same version.
 *
 * Run this after `yarn build:ci`.
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";

const distDirs = ["dist", "apps/oss/dist", "packages/features/composer/dist"];
const { version } = JSON.parse(readFileSync("package.json", "utf8"));
// A feature module as the minifier writes it, e.g. {id:`composer`,version:`4.3.0`,...
const featurePattern = /id:\s*(["'`])([\w-]+)\1,\s*version:\s*(["'`])([^"'`]+)\3/g;

const errors = [];
for (const distDir of distDirs) {
  if (!existsSync(distDir)) {
    errors.push(`${distDir}: no build, run \`yarn build:ci\` first`);
    continue;
  }

  const features = readdirSync(distDir)
    .filter((file) => file.endsWith(".js"))
    .flatMap((file) => [...readFileSync(join(distDir, file), "utf8").matchAll(featurePattern)])
    .map((match) => ({ id: match[2], version: match[4] }));

  if (features.length === 0) {
    errors.push(`${distDir}: no feature with a version found`);
  }
  for (const feature of features.filter((feature) => feature.version !== version)) {
    errors.push(`${distDir}: ${feature.id} has version ${feature.version}`);
  }
}

if (errors.length) {
  console.error(`ERROR: not every build has version ${version} (package.json):`);
  for (const error of errors) {
    console.error("  " + error);
  }
  process.exit(1);
}

console.log(`OK: ${distDirs.join(", ")} all have version ${version}`);
