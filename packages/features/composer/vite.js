// @ts-check
/// <reference types="vitest/config" />
// Plain JavaScript, so Node loads it as it is when a Vite config imports it, whatever Vite's
// config loader; the JSDoc types are checked by `yarn tsc`.
import { existsSync, readFileSync } from "fs";
import { createRequire } from "module";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import ts from "typescript";

const composerDir = dirname(fileURLToPath(import.meta.url));

/**
 * The canvas libraries: React Flow draws the canvas and dagre lays it out. Only the composer uses
 * them, so its separate build bundles them, with the packages they depend on, instead of sharing
 * them with the app.
 */
const canvasLibraries = ["@xyflow/react", "@dagrejs/dagre"];

/**
 * The package an import specifier, or a path inside node_modules, names: "@xyflow/react" for
 * "@xyflow/react/dist/style.css".
 *
 * @param {string} specifier - the specifier, or the part of a path after "node_modules/"
 * @returns {string} the package name
 */
export const packageOf = (specifier) =>
  specifier
    .split("/")
    .slice(0, specifier.startsWith("@") ? 2 : 1)
    .join("/");

/**
 * The package.json of an installed package, looked up the way Node looks up a package from a
 * folder, so it also finds a package whose exports leave out its package.json.
 *
 * @param {string} name - the package
 * @param {string} fromDir - the folder it is imported from
 * @returns {string | undefined} the path of its package.json
 */
const findManifest = (name, fromDir) =>
  (createRequire(join(fromDir, "package.json")).resolve.paths(name) ?? [])
    .map((dir) => join(dir, name, "package.json"))
    .find((path) => existsSync(path));

/**
 * The canvas libraries and every package they depend on (`packages`): the only installed packages
 * the composer's build may bundle (see vite.config.ts). Their required peer dependencies
 * (`peers`), React and React DOM, aren't in it: the app provides those, like the composer's own
 * imports.
 *
 * @returns {{ packages: string[], peers: string[] }} the package names, sorted
 * @throws {Error} when a package they depend on isn't installed
 */
export const canvasPackages = () => {
  /** @type {Set<string>} */
  const names = new Set();

  /** @type {Set<string>} */
  const peers = new Set();

  /** @type {[string, string][]} */
  const pending = canvasLibraries.map((name) => [name, composerDir]);

  for (let next = pending.pop(); next !== undefined; next = pending.pop()) {
    const [name, fromDir] = next;

    if (names.has(name)) {
      continue;
    }

    const manifest = findManifest(name, fromDir);

    if (manifest === undefined) {
      throw new Error(`Can't find ${name}, which the composer's canvas libraries depend on.`);
    }
    names.add(name);

    const {
      dependencies = {},
      peerDependencies = {},
      peerDependenciesMeta = {},
    } = JSON.parse(readFileSync(manifest, "utf8"));

    for (const dependency of Object.keys(dependencies)) {
      pending.push([dependency, dirname(manifest)]);
    }
    for (const peer of Object.keys(peerDependencies)) {
      if (!peer.startsWith("@types/") && !peerDependenciesMeta[peer]?.optional) {
        peers.add(peer);
      }
    }
  }

  return {
    packages: [...names].sort(),
    peers: [...peers].filter((peer) => !names.has(peer)).sort(),
  };
};

/**
 * The Vite settings the composer needs in an app that ships it, and in the tests: the canvas
 * libraries go into a chunk of their own.
 *
 * @returns {import("vite").Plugin} The Vite plugin.
 */
export const composerVitePlugin = () => {
  const names = new Set(canvasPackages().packages);

  return {
    name: "inmanta-composer",
    config: () => ({
      build: {
        rollupOptions: {
          output: {
            codeSplitting: {
              groups: [
                {
                  name: "canvas",
                  test: (/** @type {string} */ id) => {
                    const parts = id.replaceAll("\\", "/").split("node_modules/");

                    return parts.length > 1 && names.has(packageOf(parts[parts.length - 1]));
                  },
                  priority: 50,
                },
              ],
            },
          },
        },
      },
    }),
  };
};

/**
 * The folder of the composer's separate build (vite.config.ts), which the ISO app loads at
 * runtime.
 */
export const composerBuildDir = join(composerDir, "dist");

/**
 * The entry module of the composer's separate build. The ISO app's dev server and the tests
 * resolve `composer/feature` to it, instead of the separate build.
 */
export const composerEntry = join(composerDir, "src/entry.ts");

/**
 * The modules the app shares with the composer's separate build: every package the code of that
 * build imports, except the canvas libraries, which only the composer has, and the peer
 * dependencies of those libraries. The app provides the only copy of
 * each through its import map, so the composer uses the app's React, contexts and web-console
 * packages.
 *
 * The list comes from the composer's source, so a new import is shared without anyone listing
 * it: a module that isn't shared would be bundled into that build as a second copy, with its own
 * state and contexts (the build fails on that, see vite.config.ts). It follows the imports from
 * the build's entry (`composerEntry`) with TypeScript's parser, so it sees exactly the code the
 * build bundles, and not the tests or their mocks. Type-only imports and stylesheets are left
 * out.
 *
 * @returns {string[]} the shared import specifiers, sorted
 * @throws {Error} when the code imports a module with a computed specifier, which can't be shared
 */
export const composerSharedModules = () => {
  const specifiers = new Set(["react/jsx-runtime", ...canvasPackages().peers]);
  const visited = new Set();
  const pending = [composerEntry];

  for (let file = pending.pop(); file !== undefined; file = pending.pop()) {
    if (visited.has(file)) {
      continue;
    }
    visited.add(file);

    for (const specifier of importsOf(file)) {
      const ownPath = ownModulePath(file, specifier);

      if (ownPath === undefined) {
        if (
          !canvasLibraries.includes(packageOf(specifier)) &&
          !/^@images\/|\.css$/.test(specifier)
        ) {
          specifiers.add(specifier);
        }
        continue;
      }

      const resolved = resolveSource(ownPath);

      if (resolved !== undefined) {
        pending.push(resolved);
      } else if (!isAsset(ownPath)) {
        throw new Error(`${file}: can't resolve ${specifier} to a file of the composer.`);
      }
    }
  }

  return [...specifiers].sort();
};

const composerPackage = "@inmanta/web-console-feature-composer";
const composerSrc = join(composerDir, "src");

/**
 * The path of an import of the composer's own code (relative, or through its package name),
 * without extension, or undefined for an import of another package.
 *
 * @param {string} file - the importing module
 * @param {string} specifier - what it imports
 * @returns {string | undefined} the path
 */
const ownModulePath = (file, specifier) => {
  if (specifier.startsWith(".")) {
    return join(dirname(file), specifier);
  }
  if (specifier === composerPackage) {
    return join(composerSrc, "index");
  }
  if (specifier.startsWith(`${composerPackage}/`)) {
    return join(composerSrc, specifier.slice(composerPackage.length + 1));
  }

  return undefined;
};

/**
 * Whether an import of the composer's own code is an asset (a stylesheet or an image), which
 * the build bundles as it is and has no imports to follow.
 *
 * @param {string} path - the imported path
 * @returns {boolean} whether it is an asset
 */
const isAsset = (path) => /\.(css|svg|png|jpe?g|gif)$/.test(path);

/**
 * The source file of an import of the composer's own code, or undefined for an asset (an image or
 * a stylesheet), which has no imports to follow.
 *
 * @param {string} path - the imported path, without extension
 * @returns {string | undefined} the file
 */
const resolveSource = (path) =>
  [path, `${path}.ts`, `${path}.tsx`, join(path, "index.ts"), join(path, "index.tsx")].find(
    (candidate) => /\.tsx?$/.test(candidate) && existsSync(candidate)
  );

/**
 * The specifiers a module imports at runtime: its import and export declarations, except
 * type-only ones, and its `import()` calls.
 *
 * @param {string} file - the module
 * @returns {string[]} the specifiers
 * @throws {Error} for an `import()` whose specifier isn't a string literal
 */
const importsOf = (file) => {
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest);

  /** @type {string[]} */
  const specifiers = [];

  /** @param {import("typescript").Node} node */
  const visit = (node) => {
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      !node.importClause?.isTypeOnly
    ) {
      specifiers.push(node.moduleSpecifier.text);
    } else if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      !node.isTypeOnly
    ) {
      specifiers.push(node.moduleSpecifier.text);
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const [argument] = node.arguments;

      if (!argument || !ts.isStringLiteralLike(argument)) {
        throw new Error(
          `${file}: import() with a computed specifier; the composer's build can't share it with the app.`
        );
      }
      specifiers.push(argument.text);
    }
    ts.forEachChild(node, visit);
  };

  visit(source);

  return specifiers;
};
