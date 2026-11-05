// @ts-check
/// <reference types="vitest/config" />
// Plain JavaScript, so Node loads it as it is when a Vite config imports it, whatever Vite's
// config loader; the JSDoc types are checked by `yarn tsc`.
import { readdirSync, readFileSync } from "fs";
import { createRequire } from "module";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

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
 * The folder the composer is built into as a runtime plugin, see vite.config.ts.
 */
export const composerPluginDir = join(dirname(fileURLToPath(import.meta.url)), "dist");

/**
 * The modules the app shares with the composer plugin: every package the composer's code imports,
 * except JointJS, which only the composer has. The app provides the only copy of each through
 * its import map, so the composer uses the app's React, contexts and web-console packages.
 *
 * The list comes from the composer's source, so a new import is shared without anyone listing
 * it: a module that isn't shared is bundled into the plugin as a second copy, with its own
 * state and contexts. Type-only imports and stylesheets are left out.
 *
 * @returns {string[]} the shared import specifiers, sorted
 */
export const composerSharedModules = () => {
  const src = join(dirname(fileURLToPath(import.meta.url)), "src");
  const specifiers = new Set(["react/jsx-runtime"]);
  const importPattern =
    /(?:^|\n)\s*(?:import|export)\s+(?!type\s)(?:[^"';]*?\sfrom\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;

  for (const file of readdirSync(src, { recursive: true, encoding: "utf8" })) {
    if (!/\.tsx?$/.test(file) || /\.(test|spec)\.tsx?$|(^|[\/])Mocks?([\/]|\.)/.test(file)) {
      continue;
    }

    for (const [, staticImport, dynamicImport] of readFileSync(join(src, file), "utf8").matchAll(
      importPattern
    )) {
      const specifier = staticImport ?? dynamicImport;

      if (
        specifier.startsWith(".") ||
        specifier.startsWith("@joint/") ||
        specifier.startsWith("@images/") ||
        specifier.startsWith("@inmanta/web-console-feature-composer") ||
        specifier.endsWith(".css")
      ) {
        continue;
      }
      specifiers.add(specifier);
    }
  }

  return [...specifiers].sort();
};
