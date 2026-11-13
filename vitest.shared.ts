/**
 * The test settings both Vitest configs share, on top of the shared Vite settings
 * (vite.shared.ts): one project per package, the happy-dom environment, the mocks and the
 * coverage. vitest.config.ts runs every package; vitest.config.oss.ts only the OSS ones, and
 * also works in the OSS app's install, without the JointJS token (see `yarn test:oss`).
 *
 * The projects keep the root of the repository as their root, so the setup files and the
 * `import.meta.glob` in the apps' test setup resolve the same way for every package.
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join, posix, resolve } from "path";
import { mergeConfig, ViteUserConfig } from "vitest/config";
import { repoRoot, sharedConfig } from "./vite.shared.ts";

// Vitest loads itself with the drive letter of the working directory, while Vite resolves the
// tests' `vitest` imports with an upper-case one. Node.js caches modules by URL, so from c:\...
// (a terminal opened from cmd or VS Code on Windows) the tests get a second copy of Vitest without
// the matchers of the setup files, and fail with "Invalid Chai property".
if (/^[a-z]:/.test(process.cwd())) {
  throw new Error(
    `Run the tests from a working directory with an upper-case drive letter, not ${process.cwd()}: run \`cd .\` in Git Bash, or cd to it as C:\\... in cmd.`
  );
}

/**
 * Every workspace package, relative to the repository root, with its edition (`"inmanta":
 * { "edition": ... }` in its package.json).
 */
export const workspaces = ["packages", "packages/features", "apps"].flatMap((parent) =>
  readdirSync(resolve(repoRoot, parent), { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() && existsSync(join(repoRoot, parent, entry.name, "package.json"))
    )
    .map((entry) => {
      const dir = posix.join(parent, entry.name);
      const manifest: { inmanta?: { edition?: string } } = JSON.parse(
        readFileSync(join(repoRoot, dir, "package.json"), "utf-8")
      );

      return { dir, edition: manifest.inmanta?.edition };
    })
);

const projectName = (dir: string): string =>
  dir.replace("packages/features/", "feature-").replace(/^(packages|apps)\//, "");

/**
 * The test settings for the given packages: one Vitest project each.
 *
 * @param dirs - the folders of the packages, relative to the repository root
 * @param setupFiles - the setup files, run before every test file
 * @returns the Vitest config, without the Vite plugins of the features
 */
export const testConfig = (dirs: string[], setupFiles: string[]): ViteUserConfig =>
  mergeConfig(sharedConfig, {
    root: repoRoot,
    test: {
      globals: true,
      environment: "happy-dom",
      environmentOptions: {
        happyDOM: {
          // Never fetch scripts or stylesheets that the page links to; tests have no server for them.
          settings: { disableJavaScriptFileLoading: true, disableCSSFileLoading: true },
        },
      },
      setupFiles,
      restoreMocks: true,
      projects: dirs.map((dir) => ({
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
        include: dirs.map((dir) => `${dir}/src/**/*`),
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
  });
