#!/usr/bin/env node
/**
 * Checks that the TypeScript project references match the workspace dependencies.
 *
 * Each package is its own TypeScript project (#7461) that references the projects of the packages it
 * depends on. TypeScript doesn't enforce that: an import of a package that isn't referenced still
 * compiles, by adding that package's source to the program. ESLint (import/no-extraneous-dependencies)
 * keeps the imports in step with package.json; this script keeps the references in step with
 * package.json, and the root tsconfig.json listing every project. Run by `yarn tsc`.
 *
 * core and ui have two projects: tsconfig.src.json for their code, which references their
 * dependencies, and tsconfig.test.json for their tests, which also references their own code and
 * their devDependencies (test-utils, which depends on them).
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { dirname, join, posix, relative, resolve } from "path";

const workspaceDirs = [
  ...["packages", "packages/features", "apps"].flatMap((parent) =>
    readdirSync(parent, { withFileTypes: true })
      .filter(
        (entry) => entry.isDirectory() && existsSync(join(parent, entry.name, "package.json"))
      )
      .map((entry) => posix.join(parent, entry.name))
  ),
];
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const split = (dir) => existsSync(join(dir, "tsconfig.src.json"));
const projectOf = (dir) => (split(dir) ? `${dir}/tsconfig.src.json` : `${dir}/tsconfig.json`);
const toProject = (fromFile, path) => {
  const target = resolve(dirname(fromFile), path);

  return relative(".", target.endsWith(".json") ? target : join(target, "tsconfig.json"))
    .split("\\")
    .join("/");
};
const referencesOf = (file) =>
  (readJson(file).references ?? []).map(({ path }) => toProject(file, path));

const byName = new Map(workspaceDirs.map((dir) => [readJson(join(dir, "package.json")).name, dir]));
const workspaceDeps = (deps = {}) =>
  Object.keys(deps)
    .filter((name) => byName.has(name))
    .map((name) => projectOf(byName.get(name)));

const expected = new Map();
for (const dir of workspaceDirs) {
  const pkg = readJson(join(dir, "package.json"));
  const deps = workspaceDeps(pkg.dependencies);
  const devDeps = workspaceDeps(pkg.devDependencies);
  if (split(dir)) {
    expected.set(`${dir}/tsconfig.src.json`, deps);
    expected.set(`${dir}/tsconfig.test.json`, [`${dir}/tsconfig.src.json`, ...deps, ...devDeps]);
  } else {
    expected.set(`${dir}/tsconfig.json`, [...deps, ...devDeps]);
  }
}

const problems = [];
const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

for (const [project, want] of expected) {
  if (!existsSync(project)) {
    problems.push(`${project} is missing.`);
    continue;
  }
  const have = referencesOf(project);
  if (!sameSet(have, want)) {
    const missing = want.filter((x) => !have.includes(x));
    const extra = have.filter((x) => !want.includes(x));
    problems.push(
      `${project}: ${missing.length ? `missing references to ${missing.join(", ")}` : ""}${
        missing.length && extra.length ? "; " : ""
      }${extra.length ? `references ${extra.join(", ")}, which package.json doesn't depend on` : ""}.`
    );
  }
}

const listed = referencesOf("tsconfig.json");
for (const project of expected.keys()) {
  if (!listed.includes(project)) {
    problems.push(`tsconfig.json doesn't reference ${project}.`);
  }
}

if (problems.length > 0) {
  console.error(
    `The TypeScript project references don't match package.json:\n- ${problems.join("\n- ")}`
  );
  process.exit(1);
}

console.log(`Project references match the workspace dependencies (${expected.size} projects).`);
