// @ts-check
/// <reference types="vitest/config" />
// Plain JavaScript, so Node loads it as it is when a Vite config imports it, whatever Vite's
// config loader; the JSDoc types are checked by `yarn tsc`.
import { existsSync, readFileSync } from "fs";
import { createRequire } from "module";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import ts from "typescript";

const require = createRequire(import.meta.url);

/**
 * The folder of an installed package, found from its entry point, wherever Yarn installed it.
 *
 * @param {string} name - The name of the package.
 * @param {NodeJS.Require} [from] - Resolves the package from here, by default from the composer.
 * @returns {string} The path of its folder.
 */
const packageDir = (name, from = require) => {
  const entry = from.resolve(name);
  const marker = join("node_modules", name);

  return entry.slice(0, entry.lastIndexOf(marker) + marker.length);
};

/**
 * The Vite settings the composer needs in an app that ships it, and in the tests. They
 * live with the composer, so an app without it has no JointJS in its Vite config either.
 *
 * @returns {import("vite").Plugin} The Vite plugin.
 */
export const composerVitePlugin = () => {
  const jointPlus = packageDir("@joint/plus");
  // The composer only depends on @joint/plus, so @joint/core is resolved from there.
  const jointCore = packageDir("@joint/core", createRequire(join(jointPlus, "package.json")));

  return {
    name: "inmanta-composer",
    config: () => ({
      resolve: {
        alias: [
          // Force JointJS's bare imports to the ESM entries (avoids dist/joint-plus.js and
          // dist/joint.js). Regex matches only the exact specifier: a string alias
          // prefix-replaces, mangling subpaths such as @joint/plus/joint-plus.css or
          // @joint/plus >=4.3.0's deep imports (e.g. @joint/core/src/highlighters/index.mjs)
          // into @joint/core/joint.mjs/src/... Subpaths resolve via the package's exports map.
          { find: /^@joint\/plus$/, replacement: join(jointPlus, "joint-plus.mjs") },
          { find: /^@joint\/core$/, replacement: join(jointCore, "joint.mjs") },
        ],
      },
      optimizeDeps: {
        include: ["@joint/plus"],
        exclude: ["@joint/core"],
      },
      ssr: {
        noExternal: ["@joint/plus"],
      },
      build: {
        rollupOptions: {
          output: {
            codeSplitting: {
              groups: [{ name: "jointjs", test: /node_modules[\\/]@joint[\\/]/, priority: 50 }],
            },
          },
        },
      },
      test: {
        deps: { optimizer: { client: { include: ["@joint/plus"] } } },
      },
    }),
  };
};

/**
 * The folder of the composer's separate build (vite.config.ts), which the ISO app loads at
 * runtime.
 */
export const composerBuildDir = join(dirname(fileURLToPath(import.meta.url)), "dist");

/**
 * The entry module of the composer's separate build. The ISO app's dev server and the tests
 * resolve `composer/feature` to it, instead of the separate build.
 */
export const composerEntry = join(dirname(fileURLToPath(import.meta.url)), "src/entry.ts");

/**
 * The modules the app shares with the composer's separate build: every package the code of that
 * build imports, except JointJS, which only the composer has. The app provides the only copy of
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
  const specifiers = new Set(["react/jsx-runtime"]);
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
        if (!/^@joint\/|^@images\/|\.css$/.test(specifier)) {
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
const composerSrc = join(dirname(fileURLToPath(import.meta.url)), "src");

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
