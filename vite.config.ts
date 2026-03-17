/* eslint-disable */
import { defineConfig, UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { execSync } from "child_process";
import { writeFileSync, readdirSync, renameSync, rmSync, readFileSync, statSync } from "fs";
import mkcert from "vite-plugin-mkcert";

// Get git commit hash
const getGitCommitHash = () => {
  try {
    return execSync("git rev-parse HEAD").toString().trim();
  } catch {
    return "unknown";
  }
};

// Get package version
const packageJson = require("./package.json");

const PROTOCOL_REWRITE = process.env.HTTPS === "true" ? "https" : "http";

// Custom plugin to generate version.json
const versionPlugin = () => {
  return {
    name: "version-generator",
    closeBundle() {
      const distDir = resolve(__dirname, "dist");
      const buildDate = new Date().toISOString();
      const version = packageJson.version;
      const commitHash = getGitCommitHash();

      const versionJson = {
        version_info: {
          buildDate: buildDate,
          version: version,
          commitHash: commitHash,
        },
      };

      try {
        writeFileSync(resolve(distDir, "version.json"), JSON.stringify(versionJson, null, 2));
      } catch (error) {
        console.error("Failed to generate version.json:", error);
      }
    },
  };
};

// Custom plugin to move assets to root and rewrite references
function moveAssetsToRootPlugin() {
  return {
    name: "move-assets-to-root",
    closeBundle() {
      const distDir = resolve(__dirname, "dist");
      const assetsDir = resolve(distDir, "assets");

      // Move all files from assets to dist root
      if (statSync(assetsDir, { throwIfNoEntry: false })) {
        const files = readdirSync(assetsDir);
        for (const file of files) {
          renameSync(resolve(assetsDir, file), resolve(distDir, file));
        }
        // Remove the assets directory
        rmSync(assetsDir, { recursive: true, force: true });
      }

      // Rewrite references in all files in dist
      const distFiles = readdirSync(distDir);
      for (const file of distFiles) {
        if (file.endsWith(".js") || file.endsWith(".html") || file.endsWith(".css")) {
          const filePath = resolve(distDir, file);
          let content = readFileSync(filePath, "utf-8");
          // Replace assets/filename with filename
          content = content.replace(/assets\//g, "");
          writeFileSync(filePath, content, "utf-8");
        }
      }
    },
  };
}

// Custom plugin to copy config.js to build output
function copyConfigPlugin() {
  return {
    name: "copy-config",
    closeBundle() {
      const distDir = resolve(__dirname, "dist");
      const configSource = resolve(__dirname, "src/config.js");
      const configDest = resolve(distDir, "config.js");
      const htmlFile = resolve(distDir, "index.html");
      // Copy favicon.ico from public/images/ to dist/
      const faviconSource = resolve(__dirname, "public/images/favicon.ico");
      const faviconDest = resolve(distDir, "favicon.ico");
      try {
        // Copy config.js to dist root
        writeFileSync(configDest, readFileSync(configSource, "utf-8"));
        console.log("config.js copied to build output");
        // Copy favicon.ico to dist root
        if (statSync(faviconSource, { throwIfNoEntry: false })) {
          writeFileSync(faviconDest, readFileSync(faviconSource));
          console.log("favicon.ico copied to build output root");
        }
        // Update HTML to include config.js script before the main script in the head section
        if (statSync(htmlFile, { throwIfNoEntry: false })) {
          let htmlContent = readFileSync(htmlFile, "utf-8");
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
  };
}

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
  configureServer(server: any) {
    const shouldSuppress = (msg: string) =>
      msg.includes("Failed to load source map") || msg.includes("points to missing source files");

    for (const env of Object.values(server.environments) as any[]) {
      if (typeof env?.logger?.warn !== "function") continue;
      const origWarn = env.logger.warn.bind(env.logger);
      env.logger.warn = (msg: string, options?: unknown) => {
        if (shouldSuppress(msg)) return;
        origWarn(msg, options);
      };
      const origWarnOnce = env.logger.warnOnce?.bind(env.logger);
      if (origWarnOnce) {
        env.logger.warnOnce = (msg: string, options?: unknown) => {
          if (shouldSuppress(msg)) return;
          origWarnOnce(msg, options);
        };
      }
    }
  },

  // When the load hook returns non-null, Vite's loadAndTransform takes the
  // else-branch and never calls extractSourcemapFromFile, preventing ENOENT.
  load(id: string) {
    if (id.includes("\x00") || id.includes("?")) return null;
    if (!id.includes("node_modules")) return null;
    // Only intercept files known to reference missing .map files.
    if (!id.endsWith("marked.js")) return null;
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

  transform(code: string, id: string) {
    if (id.includes("node_modules") && code.includes("sourceMappingURL")) {
      return {
        code: code.replace(/\/\/# sourceMappingURL=\S+/g, ""),
        map: null,
      };
    }
    return null;
  },
});

const plugins = [
  react(),
  stripBrokenSourcemapsPlugin(),
  versionPlugin(),
  moveAssetsToRootPlugin(),
  copyConfigPlugin(),
  process.env.HTTPS === "true" ? mkcert() : undefined,
].filter(Boolean);

export default defineConfig({
  plugins,
  base: "./",
  publicDir: "public",
  define: {
    COMMITHASH: JSON.stringify(getGitCommitHash()),
    APP_VERSION: JSON.stringify(packageJson.version),
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
      { find: "@", replacement: resolve(__dirname, "./src") },
      { find: "@S", replacement: resolve(__dirname, "./src/Slices") },
      {
        find: "@assets",
        replacement: resolve(__dirname, "./node_modules/@patternfly/react-core/dist/styles/assets"),
      },
      { find: "@images", replacement: resolve(__dirname, "./public/images") },
      // Force @joint/plus to use ESM entry (avoids dist/joint-plus.js)
      {
        find: "@joint/plus",
        replacement: resolve(__dirname, "./node_modules/@joint/plus/joint-plus.mjs"),
      },
      // Force @joint/core to use ESM entry (avoids dist/joint.js)
      {
        find: "@joint/core",
        replacement: resolve(__dirname, "./node_modules/@joint/core/joint.mjs"),
      },
      // Force uuid to use CJS entry point
      { find: "uuid", replacement: "uuid" },
      {
        find: "@rappidcss",
        replacement: resolve(__dirname, "node_modules/@joint/plus/joint-plus.css"),
      },
      // Resolve monaco-graphql to the single instance nested under @graphiql/react
      // to avoid duplicate Monaco language registrations.
      {
        find: "monaco-graphql",
        replacement: resolve(
          __dirname,
          "./node_modules/@graphiql/react/node_modules/monaco-graphql"
        ),
      },
      // In tests, redirect ALL monaco-editor imports (including deep ESM subpaths like
      // monaco-editor/esm/vs/base/common/uri.js) to the mock. A regex find is required
      // because a string alias does a prefix replacement, turning subpath imports into
      // non-existent paths like "__mocks__/monaco-editor.mjs/esm/vs/...".
      ...(process.env.NODE_ENV === "test"
        ? [
            {
              find: /^monaco-editor(\/.*)?$/,
              replacement: resolve(__dirname, "__mocks__/monaco-editor.mjs"),
            },
          ]
        : []),
    ],
  },
  server: {
    port: 9000,
    host: true,
    https: process.env.HTTPS === "true" ? true : undefined,
    proxy: {
      /**
       * We proxy the two base urls to be able the access the endpoints when running the app locally.
       * If we do not proxy both endpoints; we face cors issues.
       */
      "/api": {
        target: process.env.VITE_API_BASEURL || "https://localhost:8888",
        changeOrigin: true,
        secure: false,
        protocolRewrite: PROTOCOL_REWRITE,
        configure: (proxy, options) => {
          proxy.on("error", (err, req, res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log("Sending Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, res) => {
            console.log("Received Response from the Target:", proxyRes.statusCode, req.url);
          });
        },
      },
      "/lsm": {
        target: process.env.VITE_API_BASEURL || "https://localhost:8888",
        changeOrigin: true,
        secure: false,
        protocolRewrite: PROTOCOL_REWRITE,
        configure: (proxy, options) => {
          proxy.on("error", (err, req, res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log("Sending Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, res) => {
            console.log("Received Response from the Target:", proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    cssCodeSplit: true, // Enable CSS code splitting
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (!assetInfo.names || assetInfo.names.length === 0) return "assets/[name].[hash].[ext]";
          const baseName = assetInfo.names[0];
          // Try to get extension from the last element, or fallback to splitting baseName
          const ext = baseName.includes(".") ? baseName.split(".").pop() : "";
          // Handle CSS, images, and other assets
          if (/(\.css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/.test(baseName)) {
            return `${baseName}`;
          }
          return `${baseName}${ext ? "." + ext : ""}`;
        },
        chunkFileNames: "[name].[hash].js",
        entryFileNames: "[name].[hash].js",
        manualChunks: {
          vendor: ["react", "react-dom"],
          patternfly: [
            "@patternfly/react-core",
            "@patternfly/react-icons",
            "@patternfly/react-styles",
            "@patternfly/react-table",
            "@patternfly/react-tokens",
          ],
          monaco: ["@monaco-editor/react", "monaco-editor"],
          jointjs: ["@joint/plus"],
          utils: ["uuid", "moment", "moment-timezone", "bignumber.js"],
          graphql: ["graphql", "graphql-request"],
          routing: ["react-router"],
          state: ["@tanstack/react-query"],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./test-setup.ts"],
    restoreMocks: true,
    dir: "./src",
    coverage: {
      provider: "v8",
      enabled: process.env.CI ? true : false,
      reporter: [
        ["text", { summary: false }],
        ["cobertura", { file: "cobertura-coverage.xml" }],
      ],
      exclude: ["node_modules/", "**/*.d.ts", "**/*.config.*", "**/__mocks__/**"],
      include: ["src/**/*"],
      maxThreads: process.env.CI ? 2 : 0,
    },
    deps: {
      optimizer: {
        web: {
          include: [
            "@joint/plus",
            "mermaid",
            "monaco-editor",
            "@monaco-editor/react",
            "graphql-request",
            "@patternfly/react-styles",
            "graphiql",
            "@graphiql/react",
          ],
        },
      },
    },
    resolve: {
      alias: [
        {
          find: "@patternfly/react-log-viewer",
          replacement: resolve(__dirname, "__mocks__/@patternfly/react-log-viewer/index.js"),
        },
        {
          find: "@patternfly/react-code-editor",
          replacement: resolve(__dirname, "__mocks__/@patternfly/react-code-editor.js"),
        },
        // Regex ensures ALL monaco-editor subpath imports (e.g. monaco-editor/esm/vs/...)
        // resolve to the mock instead of being rewritten as broken paths.
        {
          find: /^monaco-editor(\/.*)?$/,
          replacement: resolve(__dirname, "__mocks__/monaco-editor.mjs"),
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
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "monaco-editor",
      "@monaco-editor/react",
      "mermaid",
      "@joint/plus",
      "graphql-request",
      "@patternfly/react-styles",
      "nullthrows",
      "picomatch-browser",
    ],
    exclude: ["@joint/core", "monaco-graphql"],
    force: true,
  },
  ssr: {
    noExternal: ["monaco-editor", "@monaco-editor/react", "mermaid", "@joint/plus"],
  },
  worker: {
    format: "es",
  },
  css: {
    devSourcemap: false,
  },
  esbuild: {
    target: "es2020",
  },
} as UserConfig);

/**eslint-disable */
