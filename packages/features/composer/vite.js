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
 * @returns {string} The path of its folder.
 */
const packageDir = (name) => {
  const entry = require.resolve(name);
  const marker = join("node_modules", name);

  return entry.slice(0, entry.lastIndexOf(marker) + marker.length);
};

/**
 * The Vite settings the composer needs in an app that ships it, and in the tests (#7461). They
 * live with the composer, so an app without it has no JointJS in its Vite config either.
 *
 * @returns {import("vite").Plugin} The Vite plugin.
 */
export const composerVitePlugin = () => {
  const jointPlus = packageDir("@joint/plus");
  const jointCore = packageDir("@joint/core");

  return {
    name: "inmanta-composer",
    config: () => ({
      resolve: {
        alias: [
          // Force @joint/plus to use ESM entry (avoids dist/joint-plus.js)
          { find: "@joint/plus", replacement: join(jointPlus, "joint-plus.mjs") },
          // Force @joint/core's bare import to the ESM entry (avoids dist/joint.js).
          // Regex matches only the exact specifier: a string alias prefix-replaces, mangling
          // @joint/plus >=4.3.0's deep imports (e.g. @joint/core/src/highlighters/index.mjs)
          // into @joint/core/joint.mjs/src/... Subpaths resolve via the package's exports map.
          { find: /^@joint\/core$/, replacement: join(jointCore, "joint.mjs") },
          { find: "@rappidcss", replacement: join(jointPlus, "joint-plus.css") },
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
        deps: { optimizer: { web: { include: ["@joint/plus"] } } },
      },
    }),
  };
};
