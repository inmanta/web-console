/**
 * Builds the composer on its own, into dist/, so the ISO app can load it at runtime instead of
 * bundling it: a deployment can then leave it out or install it later. Its entry is
 * src/entry.ts, exposed as `composer/feature`.
 *
 * The app provides every module the composer shares with it (`composerSharedModules`) through an
 * import map, so the composer runs on the app's copy of React, the contexts and the web-console
 * packages. The files are flat and start with "composer-": the orchestrator serves every file of
 * the web console by its name from one folder, next to the app's own files.
 */
import { relative, sep } from "path";
import { federation } from "@module-federation/vite";
import { defineConfig, mergeConfig, Plugin } from "vite";
import { repoRoot, sharedConfig } from "../../../vite.shared.ts";
import {
  canvasPackages,
  composerBuildDir,
  composerSharedModules,
  composerVitePlugin,
  packageOf,
} from "./vite.js";

/**
 * Names every file "composer-..." in the root of the build. The federation plugin names the
 * entries after their expose and puts the chunks in assets/; this runs after it.
 */
const flatFileNames = (): Plugin => ({
  name: "composer-flat-file-names",
  enforce: "post",
  config: () => ({
    build: {
      rollupOptions: {
        output: {
          entryFileNames: "composer-[name].js",
          chunkFileNames: "composer-[name].[hash].js",
        },
      },
    },
  }),
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

export default defineConfig(
  mergeConfig(sharedConfig, {
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
      onlyComposerCode(),
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
