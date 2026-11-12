/**
 * The Vitest config of every package: the shared test settings (vitest.shared.ts), the Vite
 * plugins of the features (their tests need them) and the setup of the ISO app. `yarn test` runs
 * every project; `yarn test --project <name>` runs one, e.g. `--project feature-lsm`.
 * vitest.config.oss.ts runs the OSS packages only (`yarn test:oss`).
 */
import { defineConfig, mergeConfig } from "vitest/config";
import { composerEntry, composerVitePlugin } from "@inmanta/web-console-feature-composer/vite";
import { graphiqlVitePlugin } from "@inmanta/web-console-feature-graphiql/vite";
import { testConfig, workspaces } from "./vitest.shared.ts";

export default defineConfig(
  mergeConfig(
    testConfig(
      workspaces.map(({ dir }) => dir),
      [
        "./packages/test-utils/src/setup.ts",
        "./apps/web-console/src/test-setup.ts",
        "./packages/features/composer/src/Components/Composer/globalTestMocks.ts",
      ]
    ),
    {
      plugins: [composerVitePlugin(), graphiqlVitePlugin()],
      resolve: {
        alias: [
          // The web-console app loads the composer at runtime from its separate build; the tests
          // load it from its source, like the app's dev server.
          { find: /^composer\/feature$/, replacement: composerEntry },
        ],
      },
    }
  )
);
