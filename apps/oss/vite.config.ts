/**
 * The Vite config of the open-source app: the settings every app shares (vite.shared.ts at the
 * root) and the Vite plugins of the features it ships. The build goes to apps/oss/dist/.
 */
import { resolve } from "path";
import { defineConfig, mergeConfig } from "vite";
import { graphiqlVitePlugin } from "@inmanta/web-console-feature-graphiql/vite";
import { appConfig } from "../../vite.shared.ts";

export default defineConfig(
  mergeConfig(appConfig(import.meta.dirname, resolve(import.meta.dirname, "dist")), {
    plugins: [graphiqlVitePlugin()],
  })
);
