/**
 * The Vitest config (#7461): the shared Vite settings (vite.shared.ts), the Vite plugins of the
 * features (their tests need them), and one project per package. `yarn test` runs every project;
 * `yarn test --project <name>` runs one, e.g. `--project feature-lsm`.
 *
 * The projects keep the root of the repository as their root, so the setup files and the
 * `import.meta.glob` in the app's test setup resolve the same way for every package.
 */
import { existsSync, readdirSync } from "fs";
import { join, posix, resolve } from "path";
import { defineConfig, mergeConfig } from "vitest/config";
import { composerVitePlugin } from "@inmanta/web-console-feature-composer/vite";
import { graphiqlVitePlugin } from "@inmanta/web-console-feature-graphiql/vite";
import { repoRoot, sharedConfig } from "./vite.shared.ts";

const workspaces = ["packages", "packages/features", "apps"].flatMap((parent) =>
  readdirSync(parent, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(parent, entry.name, "package.json")))
    .map((entry) => posix.join(parent, entry.name))
);

const projectName = (dir: string): string =>
  dir.replace("packages/features/", "feature-").replace(/^(packages|apps)\//, "");

export default defineConfig(
  mergeConfig(sharedConfig, {
    plugins: [composerVitePlugin(), graphiqlVitePlugin()],
    test: {
      globals: true,
      environment: "happy-dom",
      environmentOptions: {
        happyDOM: {
          // Never fetch scripts or stylesheets that the page links to; tests have no server for them.
          settings: { disableJavaScriptFileLoading: true, disableCSSFileLoading: true },
        },
      },
      setupFiles: [
        "./packages/test-utils/src/setup.ts",
        "./apps/web-console/src/test-setup.ts",
        "./packages/features/composer/src/Components/Composer/globalTestMocks.ts",
      ],
      restoreMocks: true,
      projects: workspaces.map((dir) => ({
        extends: true,
        test: {
          name: projectName(dir),
          include: [`${dir}/src/**/*.{test,spec}.?(c|m)[jt]s?(x)`],
        },
      })),
      coverage: {
        provider: "v8",
        enabled: process.env.CI ? true : false,
        reporter: [
          ["text", { summary: false }],
          ["cobertura", { file: "cobertura-coverage.xml" }],
        ],
        exclude: ["node_modules/", "**/*.d.ts", "**/*.config.*", "**/__mocks__/**"],
        // The source of the packages; not their Vite plugins (vite.js) or the app's index.html.
        include: workspaces.map((dir) => `${dir}/src/**/*`),
        maxThreads: process.env.CI ? 2 : 0,
      },
      deps: {
        optimizer: {
          client: {
            include: [
              "mermaid",
              "monaco-editor",
              "@monaco-editor/react",
              "@patternfly/react-styles",
            ],
          },
        },
      },
      resolve: {
        alias: [
          {
            find: "@patternfly/react-log-viewer",
            replacement: resolve(repoRoot, "__mocks__/@patternfly/react-log-viewer/index.js"),
          },
          {
            find: "@patternfly/react-code-editor",
            replacement: resolve(repoRoot, "__mocks__/@patternfly/react-code-editor.js"),
          },
          // Regex ensures ALL monaco-editor subpath imports (e.g. monaco-editor/esm/vs/...)
          // resolve to the mock instead of being rewritten as broken paths.
          {
            find: /^monaco-editor(\/.*)?$/,
            replacement: resolve(repoRoot, "__mocks__/monaco-editor.mjs"),
          },
        ],
      },
      css: {
        modules: {
          classNameStrategy: "non-scoped",
        },
      },
      maxWorkers: process.env.CI ? 3 : undefined,
      cache: true,
    },
  })
);
