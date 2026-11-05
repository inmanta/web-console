/**
 * The Vite settings every app and the tests share: React, the global constants, the aliases of
 * the shared assets and the Monaco setup (`sharedConfig`). On top of those, `appConfig` holds the
 * dev server and build settings every app shares. Each app's vite.config.ts adds the plugins of
 * the features it ships; vitest.config.ts adds the test settings.
 *
 * Every app lists the packages this file imports (vite, @vitejs/plugin-react, vite-plugin-mkcert)
 * in its own devDependencies, even though the root lists them too: `yarn workspaces focus` on an
 * app, the OSS install without the JointJS token, doesn't install the root's devDependencies.
 * A package added here goes into every app's devDependencies as well.
 */
import { execSync } from "child_process";
import { readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "fs";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import {
  loadEnv,
  LogOptions,
  mergeConfig,
  PluginOption,
  ProxyOptions,
  UserConfig,
  ViteDevServer,
} from "vite";
import mkcert from "vite-plugin-mkcert";

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

// Moves the assets to the root of the build and rewrites the references to them.
const moveAssetsToRootPlugin = (outDir: string) => ({
  name: "move-assets-to-root",
  closeBundle() {
    const assetsDir = resolve(outDir, "assets");

    // Move all files from assets to the root of the build
    if (statSync(assetsDir, { throwIfNoEntry: false })) {
      const files = readdirSync(assetsDir);
      for (const file of files) {
        renameSync(resolve(assetsDir, file), resolve(outDir, file));
      }
      // Remove the assets directory
      rmSync(assetsDir, { recursive: true, force: true });
    }

    // Rewrite references in all files of the build
    const distFiles = readdirSync(outDir);
    for (const file of distFiles) {
      if (file.endsWith(".js") || file.endsWith(".html") || file.endsWith(".css")) {
        const filePath = resolve(outDir, file);
        let content = readFileSync(filePath, "utf-8");
        // Replace assets/filename with filename
        content = content.replace(/assets\//g, "");
        writeFileSync(filePath, content, "utf-8");
      }
    }
  },
});

// Copies the app's config.js and the favicon to the build output, and loads config.js first.
const copyConfigPlugin = (appDir: string, outDir: string) => ({
  name: "copy-config",
  closeBundle() {
    const configSource = resolve(appDir, "src/config.js");
    const configDest = resolve(outDir, "config.js");
    const htmlFile = resolve(outDir, "index.html");
    // Copy favicon.ico from public/images/ to the root of the build
    const faviconSource = resolve(repoRoot, "public/images/favicon.ico");
    const faviconDest = resolve(outDir, "favicon.ico");
    try {
      // Copy config.js to the root of the build
      writeFileSync(configDest, readFileSync(configSource, "utf-8"));
      console.log("config.js copied to build output");
      // Copy favicon.ico to the root of the build
      if (statSync(faviconSource, { throwIfNoEntry: false })) {
        writeFileSync(faviconDest, readFileSync(faviconSource));
        console.log("favicon.ico copied to build output root");
      }
      // Update HTML to include config.js script before the main script in the head section,
      // once: closeBundle can run more than once in a build.
      if (statSync(htmlFile, { throwIfNoEntry: false })) {
        let htmlContent = readFileSync(htmlFile, "utf-8");
        if (htmlContent.includes('src="./config.js"')) {
          return;
        }
        // Insert config.js script before the main script in the head section
        htmlContent = htmlContent.replace(
          /(<script type="module" crossorigin src="\.\/[^\"]+\.js"><\/script>)/,
          '  <script type="module" src="./config.js"></script>\n$1'
        );
        writeFileSync(htmlFile, htmlContent, "utf-8");
        console.log("HTML updated to include config.js script");
      }
    } catch (error) {
      console.error("Failed to copy config.js, favicon.ico, or update HTML:", error);
    }
  },
});

// Physically remove Monaco CDN URL strings from the production bundle so they
// can never be used even if a loader instance slips through deduplication or
// loader.config() is called too late. The URLs only exist as dead string
// literals in @monaco-editor/loader's default config; removing them has no
// runtime side-effect beyond making CDN loading impossible.
const blockMonacoCDNPlugin = () => ({
  name: "block-monaco-cdn",
  renderChunk(code: string) {
    const cleaned = code.replace(
      /https:\/\/cdn\.jsdelivr\.net\/npm\/monaco-editor@[^/'"]+\/min\/vs/g,
      ""
    );

    return cleaned !== code ? { code: cleaned, map: null } : null;
  },
});

/**
 * We proxy the two base urls to be able the access the endpoints when running the app locally.
 * If we do not proxy both endpoints; we face cors issues.
 */
const apiProxy = (env: Record<string, string | undefined>): ProxyOptions => ({
  target: env.VITE_API_BASEURL || env.PROXY_TARGET || "https://localhost:8888",
  changeOrigin: true,
  secure: false,
  protocolRewrite: env.HTTPS === "true" ? "https" : "http",
  configure: (proxy) => {
    proxy.on("error", (err) => {
      console.log("proxy error", err);
    });
    proxy.on("proxyReq", (_proxyReq, req) => {
      console.log("Sending Request to the Target:", req.method, req.url);
    });
    proxy.on("proxyRes", (proxyRes, req) => {
      console.log("Received Response from the Target:", proxyRes.statusCode, req.url);
    });
  },
});

/**
 * The Vite settings of an app: the shared settings above, its dev server and its build.
 *
 * @param appDir - the folder of the app, which holds its index.html and src/config.js
 * @param outDir - the folder the app is built into
 */
export const appConfig = (appDir: string, outDir: string): UserConfig => {
  // The variables of the .env file at the root (if there is one), for the dev server's proxy and
  // HTTPS; the variables of the shell win. The app's code gets the VITE_ ones through envDir.
  const env = { ...loadEnv("development", repoRoot, ""), ...process.env };
  const https = env.HTTPS === "true";

  const plugins: PluginOption[] = [
    blockMonacoCDNPlugin(),
    moveAssetsToRootPlugin(outDir),
    copyConfigPlugin(appDir, outDir),
    https ? mkcert() : undefined,
  ].filter(Boolean);

  return mergeConfig(sharedConfig, {
    root: appDir,
    // The .env file and the shared public folder are at the root of the repository.
    envDir: repoRoot,
    publicDir: resolve(repoRoot, "public"),
    plugins,
    base: "./",
    server: {
      port: 9000,
      host: true,
      https: https ? true : undefined,
      proxy: {
        "/api": apiProxy(env),
        "/lsm": apiProxy(env),
      },
    },
    build: {
      outDir,
      // The build folder can be outside the app's folder, so Vite only empties it when asked to.
      emptyOutDir: true,
      sourcemap: false,
      assetsInlineLimit: 4096, // Inline assets smaller than 4kb
      cssCodeSplit: true, // Enable CSS code splitting
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            if (!assetInfo.names || assetInfo.names.length === 0) {
              return "assets/[name].[hash].[ext]";
            }
            const baseName = assetInfo.names[0];
            // Try to get extension from the last element, or fallback to splitting baseName
            const ext = baseName.includes(".") ? baseName.split(".").pop() : "";
            // Handle CSS, images, and other assets
            if (/(\.(css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot))$/.test(baseName)) {
              return `${baseName}`;
            }

            return `${baseName}${ext ? "." + ext : ""}`;
          },
          chunkFileNames: "[name].[hash].js",
          entryFileNames: "[name].[hash].js",
          codeSplitting: {
            groups: [
              { name: "vendor", test: /node_modules[\\/](react|react-dom)[\\/]/, priority: 80 },
              { name: "patternfly", test: /node_modules[\\/]@patternfly[\\/]/, priority: 70 },
              {
                name: "monaco",
                test: /node_modules[\\/](monaco-editor|@monaco-editor)[\\/]/,
                priority: 60,
              },
              {
                name: "utils",
                test: /node_modules[\\/](uuid|dayjs|bignumber\.js)[\\/]/,
                priority: 40,
              },
              {
                name: "graphql",
                test: /node_modules[\\/]graphql[\\/]/,
                priority: 30,
              },
              { name: "routing", test: /node_modules[\\/]react-router[\\/]/, priority: 20 },
              { name: "state", test: /node_modules[\\/]@tanstack[\\/]/, priority: 10 },
            ],
          },
        },
      },
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "monaco-editor",
        "@monaco-editor/react",
        "@braintree/sanitize-url",
        "@patternfly/react-styles",
        "nullthrows",
        "picomatch-browser",
        "react-diff-viewer-continued",
      ],
      force: true,
    },
  });
};
