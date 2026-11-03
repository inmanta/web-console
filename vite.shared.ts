/**
 * The Vite settings every app and the tests share (#7461): React, the global constants, the
 * aliases of the shared assets and the Monaco setup. Each app's vite.config.ts adds its own build
 * and dev server settings and the plugins of the features it ships; vitest.config.ts adds the
 * test settings.
 */
import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import { LogOptions, UserConfig, ViteDevServer } from "vite";

export const repoRoot = import.meta.dirname;

// Get git commit hash
const getGitCommitHash = () => {
  try {
    return execSync("git rev-parse HEAD").toString().trim();
  } catch {
    return "unknown";
  }
};

// Version of the app, stamped into every feature module
const appVersion = JSON.parse(readFileSync(resolve(repoRoot, "package.json"), "utf-8")).version;

// In Vite's loadAndTransform, `logger` is destructured from the Environment
// object — not from config.logger — so customLogger doesn't intercept it.
// configureServer patches each environment's logger directly after the server
// (and its environments) are fully initialised.
//
// The load hook is kept as a first-line defence: when it returns non-null Vite
// skips extractSourcemapFromFile entirely, so the ENOENT never occurs.
// The transform hook handles build-time sourcemap stripping.
const stripBrokenSourcemapsPlugin = () => ({
  name: "strip-broken-sourcemaps",
  enforce: "pre" as const,

  // Patch the per-environment loggers that loadAndTransform actually uses.
  // "Failed to load source map" uses logger.warn; "points to missing source files"
  // uses logger.warnOnce — both need to be suppressed.
  configureServer(server: ViteDevServer) {
    const shouldSuppress = (msg: string) =>
      msg.includes("Failed to load source map") || msg.includes("points to missing source files");

    for (const env of Object.values(server.environments)) {
      if (typeof env?.logger?.warn !== "function") {
        continue;
      }
      const origWarn = env.logger.warn.bind(env.logger);
      env.logger.warn = (msg: string, options?: LogOptions) => {
        if (shouldSuppress(msg)) {
          return;
        }
        origWarn(msg, options);
      };
      const origWarnOnce = env.logger.warnOnce?.bind(env.logger);
      if (origWarnOnce) {
        env.logger.warnOnce = (msg: string, options?: LogOptions) => {
          if (shouldSuppress(msg)) {
            return;
          }
          origWarnOnce(msg, options);
        };
      }
    }
  },

  // When the load hook returns non-null, Vite's loadAndTransform takes the
  // else-branch and never calls extractSourcemapFromFile, preventing ENOENT.
  load(id: string) {
    if (id.includes("\x00") || id.includes("?")) {
      return null;
    }
    if (!id.includes("node_modules")) {
      return null;
    }
    // Only intercept files known to reference missing .map files.
    if (!id.endsWith("marked.js")) {
      return null;
    }
    try {
      const code = readFileSync(id, "utf-8");
      if (code.includes("sourceMappingURL")) {
        return { code: code.replace(/\/\/# sourceMappingURL=\S+/g, ""), map: null };
      }
    } catch {
      // unreadable — fall through to Vite's default handler
    }

    return null;
  },

  // Only strip sourcemaps from the known offenders (marked, graphiql and its
  // sub-packages). Stripping all node_modules sourcemaps would make debugging
  // unrelated dependencies harder in DevTools.
  transform(code: string, id: string) {
    if (
      id.includes("node_modules") &&
      (id.includes("marked") || id.includes("graphiql") || id.includes("@graphiql")) &&
      code.includes("sourceMappingURL")
    ) {
      return {
        code: code.replace(/\/\/# sourceMappingURL=\S+/g, ""),
        map: null,
      };
    }

    return null;
  },
});

export const sharedConfig: UserConfig = {
  plugins: [react(), stripBrokenSourcemapsPlugin()],
  define: {
    COMMITHASH: JSON.stringify(getGitCommitHash()),
    APP_VERSION: JSON.stringify(appVersion),
    global: "globalThis",
    ...(process.env.VITEST || process.env.NODE_ENV === "production"
      ? {
          // Ensure API base URL is empty in tests and production builds
          "import.meta.env.VITE_API_BASEURL": JSON.stringify(""),
        }
      : {}),
  },
  resolve: {
    alias: [
      {
        find: "@assets",
        replacement: resolve(repoRoot, "./node_modules/@patternfly/react-core/dist/styles/assets"),
      },
      { find: "@images", replacement: resolve(repoRoot, "./public/images") },
      // Force uuid to use CJS entry point
      { find: "uuid", replacement: "uuid" },
      // In tests, redirect ALL monaco-editor imports (including deep ESM subpaths like
      // monaco-editor/esm/vs/base/common/uri.js) to the mock. A regex find is required
      // because a string alias does a prefix replacement, turning subpath imports into
      // non-existent paths like "__mocks__/monaco-editor.mjs/esm/vs/...".
      ...(process.env.NODE_ENV === "test"
        ? [
            {
              find: /^monaco-editor(\/.*)?$/,
              replacement: resolve(repoRoot, "__mocks__/monaco-editor.mjs"),
            },
          ]
        : []),
    ],
    // Ensure only one copy of each monaco package is loaded.
    // @patternfly/react-code-editor nests its own @monaco-editor/loader@1.4.0
    // (CDN default: monaco-editor@0.43.0). Without deduplication that loader gets
    // its own module-level state, ignores our loader.config() call in index.tsx,
    // and hits cdn.jsdelivr.net at runtime. Deduplicating forces all consumers to
    // share the root instance so our config applies universally.
    dedupe: ["monaco-editor", "@monaco-editor/loader", "@monaco-editor/react"],
  },
  ssr: {
    noExternal: ["monaco-editor", "@monaco-editor/react", "mermaid"],
  },
  worker: {
    format: "es",
  },
  css: {
    devSourcemap: false,
  },
};
