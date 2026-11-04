#!/usr/bin/env node
/**
 * Checks that the routes a package declares for the pages of other features match those features.
 *
 * Each feature adds its routes to `RouteRegistry` (core's Domain/Route.ts) through declaration
 * merging. With TypeScript project references, a package only sees the routes of the
 * packages it depends on, and a feature never depends on another feature. So a package that names
 * another feature's route, for a link or as a parent page, declares that route itself in
 * `src/linkedRoutes.ts` (or `src/testTypes.ts` for routes only its tests name).
 *
 * No program loads every declaration, so TypeScript can't compare them. This script does: every
 * declared route must have exactly one owner (a declaration outside those files), with the same
 * params. It reads the files with the TypeScript parser, so formatting doesn't matter. Run by
 * `yarn tsc`.
 */
import { execSync } from "child_process";
import { readFileSync } from "fs";
import ts from "typescript";

const linkedRoutesFilePattern = /\/src\/(linkedRoutes|testTypes)\.ts$/;
const printer = ts.createPrinter({ removeComments: true });

const files = execSync('git grep --untracked -l "RouteRegistry" -- packages apps', {
  encoding: "utf8",
})
  .trim()
  .split("\n")
  .filter((file) => /\.tsx?$/.test(file) && !file.endsWith("Domain/Route.ts"));

/**
 * Every property of every `interface RouteRegistry` in the file, with its type printed the same
 * way whatever the formatting of the source. An optional route (`Kind?: ...`) gets a "?" in front:
 * its params would accept `undefined` where the owner's don't.
 */
const routeDeclarations = (file) => {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true
  );
  const declarations = [];
  const visit = (node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === "RouteRegistry") {
      for (const member of node.members) {
        if (ts.isPropertySignature(member) && member.type) {
          const params = printer.printNode(ts.EmitHint.Unspecified, member.type, source);
          declarations.push({
            kind: member.name.getText(source),
            params: (member.questionToken ? "?" : "") + params.replace(/\s+/g, " "),
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);

  return declarations;
};

const owners = new Map();
const linked = [];
const problems = [];

for (const file of files) {
  for (const { kind, params } of routeDeclarations(file)) {
    if (linkedRoutesFilePattern.test(file)) {
      linked.push({ file, kind, params });
    } else if (owners.has(kind)) {
      problems.push(`${kind} is declared by two features: ${owners.get(kind).file} and ${file}`);
    } else {
      owners.set(kind, { file, params });
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
