/* eslint-disable */
import { defineConfig, UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { execSync } from "child_process";
import { copyFileSync, mkdirSync, existsSync, writeFileSync } from "fs";

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

// Custom plugin to copy monaco workers to dist root
const monacoWorkersPlugin = () => {
  return {
    name: "monaco-workers",
    closeBundle() {
      const workersDir = resolve(__dirname, "public/monaco-editor-workers");
      const imagesDir = resolve(__dirname, "public/images");
      const distDir = resolve(__dirname, "dist");

      // Copy monaco workers
      if (existsSync(workersDir)) {
        const files = ["editor.worker.js", "jsonWorker.js", "xmlWorker.js", "pythonWorker.js"];
        files.forEach((file) => {
          const src = resolve(workersDir, file);
          const dest = resolve(distDir, file);
          if (existsSync(src)) {
            try {
              copyFileSync(src, dest);
            } catch (error) {
              console.error(`Failed to copy ${file}:`, error);
            }
          }
        });
      }

      // Copy favicon.ico
      const faviconSrc = resolve(imagesDir, "favicon.ico");
      const faviconDest = resolve(distDir, "favicon.ico");
      if (existsSync(faviconSrc)) {
        try {
          copyFileSync(faviconSrc, faviconDest);
        } catch (error) {
          console.error("Failed to copy favicon.ico:", error);
        }
      }
    },
  };
};

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

export default defineConfig({
  plugins: [react(), monacoWorkersPlugin(), versionPlugin()],
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
      // Handle CSS import with proper alias
      "@inmanta/rappid/joint-plus.css": resolve(
        __dirname,
        "./node_modules/@inmanta/rappid/joint-plus.css"
      ),
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
    proxy: {
      "/api": {
        target: process.env.VITE_API_BASEURL || "http://localhost:8888",
        changeOrigin: true,
        secure: false,
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
        target: process.env.VITE_API_BASEURL || "http://localhost:8888",
        changeOrigin: true,
        secure: false,
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
    sourcemap: true,
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    cssCodeSplit: true, // Enable CSS code splitting
    minify: "esbuild", // Use esbuild for faster minification
    target: "es2020", // Target modern browsers
    chunkSizeWarningLimit: 1000, // Increase chunk size warning limit
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Output assets directly to dist root, similar to webpack
          if (!assetInfo.name) return "assets/[name].[hash].[ext]";
          const info = assetInfo.name.split(".");
          const ext = info[info.length - 1];
          // Handle CSS, images, and other assets
          if (/\.(css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/.test(assetInfo.name)) {
            return `${info[0]}.${ext}`;
          }
          return `${info[0]}.${ext}`;
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
      reporter: ["text", "cobertura"],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/__mocks__/**",
        "cypress/**",
      ],
    },
    deps: {
      inline: [
        "@inmanta/rappid",
        "mermaid",
        "monaco-editor",
        "@monaco-editor/react",
        "graphql-request",
        "@patternfly/react-styles",
      ],
    },
    server: {
      deps: {
        inline: [
          "@inmanta/rappid",
          "mermaid",
          "monaco-editor",
          "@monaco-editor/react",
          "graphql-request",
          "@patternfly/react-styles",
        ],
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
    esbuildOptions: {
      target: "es2020",
      // Reduce memory usage during dependency optimization
      maxParallel: 4,
    },
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

/* eslint-enable */
