/**
 * The Vite config of the ISO app (web-console): the settings every app shares (vite.shared.ts at
 * the root) and the Vite plugins of the features it ships. The build goes to dist/ at the root of
 * the repository, where the release scripts and the SBOM expect it.
 */
import { resolve } from "path";
import { defineConfig, mergeConfig } from "vite";
import { composerVitePlugin } from "@inmanta/web-console-feature-composer/vite";
import { graphiqlVitePlugin } from "@inmanta/web-console-feature-graphiql/vite";
import { appConfig, repoRoot } from "../../vite.shared.ts";

export default defineConfig(
  mergeConfig(appConfig(import.meta.dirname, resolve(repoRoot, "dist")), {
    plugins: [composerVitePlugin(), graphiqlVitePlugin()],
  })
);
