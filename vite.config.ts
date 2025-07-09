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

      try {
        // Copy config.js to dist root
        writeFileSync(configDest, readFileSync(configSource, "utf-8"));
        console.log("config.js copied to build output");

        // Update HTML to include config.js script before the main script in the head section
        if (statSync(htmlFile, { throwIfNoEntry: false })) {
          let htmlContent = readFileSync(htmlFile, "utf-8");
          // Insert config.js script before the main script in the head section
          htmlContent = htmlContent.replace(
            /(<script type="module" crossorigin src="\.\/[^"]+\.js"><\/script>)/,
            '  <script type="module" src="./config.js"></script>\n$1'
          );
          writeFileSync(htmlFile, htmlContent, "utf-8");
          console.log("HTML updated to include config.js script");
        }
      } catch (error) {
        console.error("Failed to copy config.js or update HTML:", error);
      }
    },
  };
}

const plugins = [
  react(),
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
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@S": resolve(__dirname, "./src/Slices"),
      "@assets": resolve(__dirname, "./node_modules/@patternfly/react-core/dist/styles/assets"),
      "@images": resolve(__dirname, "./public/images"),
      // Handle lodash-es to use CommonJS version
      "lodash-es": "lodash",
      // Force rappid to use ESM version
      "@inmanta/rappid": resolve(__dirname, "./node_modules/@inmanta/rappid/joint-plus.mjs"),
      // Force uuid to use CJS entry point
      uuid: "uuid",
      "@rappidcss": resolve(__dirname, "node_modules/@inmanta/rappid/joint-plus.css"),
      // Only mock monaco-editor in test environment
      ...(process.env.NODE_ENV === "test"
        ? {
            "monaco-editor": resolve(__dirname, "__mocks__/monaco-editor.mjs"),
          }
        : {}),
    },
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
          rappid: ["@inmanta/rappid"],
          utils: ["lodash", "lodash-es", "uuid", "moment", "moment-timezone", "bignumber.js"],
          graphql: ["graphql", "graphql-request"],
          routing: ["react-router", "@remix-run/router"],
          state: ["easy-peasy", "@tanstack/react-query"],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./test-setup.ts"],
    coverage: {
      provider: "v8",
      enabled: process.env.CI ? true : false,
      reporter: [
        ["text", { summary: false }],
        ["cobertura", { file: "cobertura-coverage.xml" }],
      ],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/__mocks__/**",
        "cypress/**",
      ],
      include: ["src/**/*"],
      maxThreads: process.env.CI ? 2 : 0,
    },
    deps: {
      optimizer: {
        web: {
          include: [
            "@inmanta/rappid",
            "mermaid",
            "monaco-editor",
            "@monaco-editor/react",
            "graphql-request",
            "@patternfly/react-styles",
          ],
        },
      },
    },
    resolve: {
      alias: {
        "@patternfly/react-log-viewer": resolve(
          __dirname,
          "__mocks__/@patternfly/react-log-viewer/index.js"
        ),
        "@patternfly/react-code-editor": resolve(
          __dirname,
          "__mocks__/@patternfly/react-code-editor.js"
        ),
        "monaco-editor": resolve(__dirname, "__mocks__/monaco-editor.mjs"),
      },
    },
    css: {
      modules: {
        classNameStrategy: "non-scoped",
      },
    },
    maxThreads: process.env.CI ? 2 : undefined,
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
      "@inmanta/rappid",
      "graphql-request",
      "@patternfly/react-styles",
    ],
    exclude: ["@joint/core"],
    force: true,
  },
  ssr: {
    noExternal: ["monaco-editor", "@monaco-editor/react", "mermaid", "@inmanta/rappid"],
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
