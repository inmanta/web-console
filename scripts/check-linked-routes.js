#!/usr/bin/env node
/**
 * Checks that the routes a package declares for the pages of other features match those features.
 *
 * Each feature adds its routes to `RouteRegistry` (core's Domain/Route.ts) through declaration
 * merging. With TypeScript project references (#7461), a package only sees the routes of the
 * packages it depends on, and a feature never depends on another feature. So a package that names
 * another feature's route, for a link or as a parent page, declares that route itself in
 * `src/linkedRoutes.ts` (or `src/testTypes.ts` for routes only its tests name).
 *
 * No program loads every declaration, so TypeScript can't compare them. This script does: every
 * declared route must have exactly one owner (a declaration outside those files), with the same
 * params. Run by `yarn tsc`.
 */
import { execSync } from "child_process";
import { readFileSync } from "fs";

const linkerFile = /\/src\/(linkedRoutes|testTypes)\.ts$/;
const normalize = (params) => params.replace(/\s+/g, " ").replace(/;\s*}/g, " }").trim();

const files = execSync('git grep --untracked -l "interface RouteRegistry {" -- packages apps', {
  encoding: "utf8",
})
  .trim()
  .split("\n")
  .filter((file) => !file.endsWith("Domain/Route.ts"));

const owners = new Map();
const linked = [];
const problems = [];

for (const file of files) {
  const source = readFileSync(file, "utf8");
  const body = source.match(/interface RouteRegistry \{([\s\S]*?)\n\s*\}/)?.[1] ?? "";
  for (const [, kind, params] of body.matchAll(/^\s+([A-Z][A-Za-z]+): ([^;]+);/gm)) {
    if (linkerFile.test(file)) {
      linked.push({ file, kind, params: normalize(params) });
    } else if (owners.has(kind)) {
      problems.push(`${kind} is declared by two features: ${owners.get(kind).file} and ${file}`);
    } else {
      owners.set(kind, { file, params: normalize(params) });
    }
  }
}

for (const { file, kind, params } of linked) {
  const owner = owners.get(kind);
  if (!owner) {
    problems.push(`${file}: ${kind} is not a route of any feature.`);
  } else if (owner.params !== params) {
    problems.push(
      `${file}: ${kind} has params ${params}, but ${owner.file} declares ${owner.params}.`
    );
  }
}

if (problems.length > 0) {
  console.error(
    `Linked routes don't match the features that own them:\n- ${problems.join("\n- ")}`
  );
  process.exit(1);
}

console.log(
  `Linked routes match their owners (${linked.length} declarations, ${owners.size} routes).`
);
