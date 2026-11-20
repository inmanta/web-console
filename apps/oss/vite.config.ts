/**
 * The Vite config of the OSS app: the settings every app shares (vite.shared.ts at the
 * root) and the Vite plugins of the features it ships. The build goes to dist-oss/ at the root of
 * the repo, next to the ISO app's dist/, so the npm package ships both.
 */
import { resolve } from "path";
import { defineConfig, mergeConfig } from "vite";
import { graphiqlVitePlugin } from "@inmanta/web-console-feature-graphiql/vite";
import { appConfig, repoRoot } from "../../vite.shared.ts";

export default defineConfig(
  mergeConfig(appConfig(import.meta.dirname, resolve(repoRoot, "dist-oss")), {
    plugins: [graphiqlVitePlugin()],
  })
);
