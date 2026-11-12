/**
 * The Vitest config of the OSS packages (`"inmanta": { "edition": "oss" }`): the shared test
 * settings (vitest.shared.ts), the Vite plugins of the OSS features and the setup of the OSS app.
 * It imports nothing of the ISO features, so it also runs in the OSS app's install, without the
 * JointJS token: `yarn test:oss`, as the OSS CI job does (jenkins/Jenkinsfile.oss).
 */
import { defineConfig, mergeConfig } from "vitest/config";
import { graphiqlVitePlugin } from "@inmanta/web-console-feature-graphiql/vite";
import { testConfig, workspaces } from "./vitest.shared.ts";

export default defineConfig(
  mergeConfig(
    testConfig(
      workspaces.filter(({ edition }) => edition === "oss").map(({ dir }) => dir),
      ["./packages/test-utils/src/setup.ts", "./apps/oss/src/test-setup.ts"]
    ),
    {
      plugins: [graphiqlVitePlugin()],
      // The OSS app's install has no coverage provider; `yarn test:ci` reports the coverage.
      test: { coverage: { enabled: false } },
    }
  )
);
