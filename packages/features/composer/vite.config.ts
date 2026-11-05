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
import { federation } from "@module-federation/vite";
import { defineConfig, mergeConfig, Plugin } from "vite";
import { sharedConfig } from "../../../vite.shared.ts";
import { composerBuildDir, composerSharedModules, composerVitePlugin } from "./vite.js";

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
    ],
    build: {
      outDir: composerBuildDir,
      emptyOutDir: true,
      target: "esnext",
      assetsDir: "",
      rollupOptions: {
        // The federation plugin adds the entry of each exposed module; there is no page.
        input: {},
        output: { assetFileNames: "composer-[name].[hash][extname]" },
      },
    },
  })
);
