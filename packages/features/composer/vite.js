// @ts-check
/// <reference types="vitest/config" />
// Plain JavaScript, so Node loads it as it is when a Vite config imports it, whatever Vite's
// config loader; the JSDoc types are checked by `yarn tsc`.
import { createRequire } from "module";
import { join } from "path";

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
