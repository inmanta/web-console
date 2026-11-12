/**
 * The Vite config of the ISO app (web-console): the settings every app shares (vite.shared.ts at
 * the root) and the Vite plugins of the features it ships. The build goes to dist/ at the root of
 * the repository, where the release scripts and the SBOM expect it.
 *
 * The app loads the composer at runtime (`composer/feature` in app.ts), from the composer's
 * separate build (packages/features/composer/vite.config.ts), which `yarn build` runs first:
 * - the build gets an import map that provides the composer with the app's shared modules and
 *   points `composer/feature` at the composer's entry, and the composer's files are copied next
 *   to the app's, so the build ships with the composer;
 * - the dev server serves `composer/feature` from the composer's source instead, like a bundled
 *   feature.
 */
import { copyFileSync, readdirSync } from "fs";
import { join, relative, resolve } from "path";
import { federation } from "@module-federation/vite";
import { defineConfig, mergeConfig, Plugin } from "vite";
import {
  composerBuildDir,
  composerEntry,
  composerSharedModules,
  composerVitePlugin,
} from "@inmanta/web-console-feature-composer/vite";
import { graphiqlVitePlugin } from "@inmanta/web-console-feature-graphiql/vite";
import { appConfig, repoRoot } from "../../vite.shared.ts";

const outDir = resolve(repoRoot, "dist");

/**
 * Copies the composer's separate build next to the app's files, after the app's build.
 */
const copyComposerPlugin = (): Plugin => ({
  name: "copy-composer",
  apply: "build",
  closeBundle() {
    for (const file of readdirSync(composerBuildDir)) {
      if (file !== "mf-manifest.json") {
        copyFileSync(join(composerBuildDir, file), join(outDir, file));
      }
    }
  },
});

export default defineConfig(({ command }) =>
  mergeConfig(appConfig(import.meta.dirname, outDir), {
    plugins: [
      graphiqlVitePlugin(),
      ...(command === "build"
        ? [
            federation({
              name: "webConsole",
              remotes: {
                composer: relative(
                  import.meta.dirname,
                  join(composerBuildDir, "mf-manifest.json")
                ).replaceAll("\\", "/"),
              },
              shared: Object.fromEntries(composerSharedModules().map((key) => [key, {}])),
              dts: false,
              experiments: { hostProvidesAllShared: true },
            }),
            copyComposerPlugin(),
          ]
        : [composerVitePlugin()]),
    ],
    build: {
      rollupOptions: {
        output: {
          // The federation plugin names the chunk of each shared module "shared/<module>". The
          // orchestrator serves every file by its name from one folder, so keep them flat.
          chunkFileNames: ({ name }: { name: string }) =>
            `${name.replace(/^shared\//, "shared-")}.[hash].js`,
        },
      },
    },
    resolve:
      command === "build"
        ? {}
        : {
            alias: [
              {
                find: /^composer\/feature$/,
                replacement: composerEntry,
              },
            ],
          },
  })
);
