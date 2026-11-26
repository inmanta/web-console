/**
 * Builds the composer on its own, into dist/, so the ISO app can load it at runtime instead of
 * bundling it: a deployment can then leave it out or install it later. Its entry is
 * src/entry.ts, exposed as `composer/feature`. The entry's name has a hash, so a replaced build
 * isn't served from the browser's cache; the app finds it through `composerManifestFile`.
 *
 * The app provides every module the composer shares with it (`composerSharedModules`) through an
 * import map, so the composer runs on the app's copy of React, the contexts and the web-console
 * packages. The files are flat and start with "composer-": the orchestrator serves every file of
 * the web console by its name from one folder, next to the app's own files.
 *
 * `COMPOSER_VERSION_OVERRIDE` builds the composer with another version than the app's
 * (`APP_VERSION`), e.g. for the version mismatch test (scripts/composer-ship-mode.js).
 */
import { relative, sep } from "path";
import { federation } from "@module-federation/vite";
import { defineConfig, mergeConfig, Plugin } from "vite";
import { repoRoot, sharedConfig } from "../../../vite.shared.ts";
import {
  canvasPackages,
  composerBuildDir,
  composerManifestFile,
  composerSharedModules,
  composerVitePlugin,
  packageOf,
} from "./vite.js";

/**
 * Names every file "composer-..." in the root of the build. The federation plugin names the
 * entries after their expose, without a hash, and puts the chunks in assets/; this runs after it.
 */
const flatFileNames = (): Plugin => ({
  name: "composer-flat-file-names",
  enforce: "post",
  config: () => ({
    build: {
      rollupOptions: {
        output: {
          entryFileNames: "composer-[name].[hash].js",
          chunkFileNames: "composer-[name].[hash].js",
        },
      },
    },
  }),
});

/**
 * Writes `composerManifestFile`, which names the entry of the build: `{ "entry": "<file>" }`. The
 * app fetches it to find the entry, whose name changes with each build.
 */
const entryManifest = (): Plugin => ({
  name: "composer-entry-manifest",
  enforce: "post",
  generateBundle(_options, bundle) {
    const entry = Object.values(bundle).find(
      (output) => output.type === "chunk" && output.isEntry && output.name === "feature"
    );

    if (!entry) {
      this.error("The composer's build has no entry named feature.");
    }

    this.emitFile({
      type: "asset",
      fileName: composerManifestFile,
      source: `${JSON.stringify({ entry: entry.fileName }, null, 2)}\n`,
    });
  },
});

/**
 * Fails the build when it bundles code the app should provide: any installed package other than
 * the canvas libraries and what they depend on (`canvasPackages`), or the code of another
 * workspace package. That code would be a second copy, with its own state and contexts, e.g. a
 * module the composer imports that isn't in `composerSharedModules`, or one only a package it
 * depends on imports.
 */
const onlyComposerCode = (): Plugin => ({
  name: "composer-only-own-code",
  enforce: "post",
  generateBundle(_options, bundle) {
    const foreign = new Set<string>();
    const canvas = new Set(canvasPackages().packages);

    for (const output of Object.values(bundle)) {
      for (const id of output.type === "chunk" ? output.moduleIds : []) {
        const path = relative(repoRoot, id.split("?")[0]).split(sep).join("/");
        const inModules = path.split("node_modules/");

        if (
          (inModules.length > 1 && !canvas.has(packageOf(inModules[inModules.length - 1]))) ||
          (path.startsWith("packages/") && !path.startsWith("packages/features/composer/"))
        ) {
          foreign.add(path);
        }
      }
    }

    if (foreign.size > 0) {
      this.error(
        [
          "The composer's build bundles code the app should provide, so it would run on a second copy of it. Share these modules (composerSharedModules in vite.js):",
          ...[...foreign].sort(),
        ].join("\n")
      );
    }
  },
});

/**
 * Fails the build when a bundled CommonJS module `require`s a module the app provides: the app
 * provides ES modules through its import map, so that `require` throws at runtime. Rolldown only
 * adds its `require` fallback, with this message, to a build that has such a `require`. Resolve
 * such a module to one the app shares with named exports instead (`canvasModuleAliases` in
 * vite.js).
 */
const noRequireOfShared = (): Plugin => ({
  name: "composer-no-require-of-shared",
  enforce: "post",
  generateBundle(_options, bundle) {
    const requiring = Object.values(bundle).filter(
      (output) =>
        output.type === "chunk" &&
        output.code.includes("in an environment that doesn't expose the `require` function")
    );

    if (requiring.length > 0) {
      this.error(
        `A CommonJS module in the composer's build requires a module the app provides, which fails at runtime. Resolve that CommonJS module to one the app shares (canvasModuleAliases in vite.js). Chunks: ${requiring.map(({ fileName }) => fileName).join(", ")}`
      );
    }
  },
});

const versionOverride = process.env.COMPOSER_VERSION_OVERRIDE;

export default defineConfig(
  mergeConfig(sharedConfig, {
    ...(versionOverride ? { define: { APP_VERSION: JSON.stringify(versionOverride) } } : {}),
    root: import.meta.dirname,
    base: "./",
    publicDir: false,
    plugins: [
      composerVitePlugin(),
      federation({
        name: "composer",
        exposes: { "./feature": "./src/entry.ts" },
        shared: Object.fromEntries(composerSharedModules().map((key) => [key, {}])),
        dts: false,
        experiments: { hostProvidesAllShared: true },
      }),
      flatFileNames(),
      entryManifest(),
      onlyComposerCode(),
      noRequireOfShared(),
    ],
    build: {
      outDir: composerBuildDir,
      emptyOutDir: true,
      assetsDir: "",
      rollupOptions: {
        // The federation plugin adds the entry of each exposed module; there is no page.
        input: {},
        output: { assetFileNames: "composer-[name].[hash][extname]" },
      },
    },
  })
);
