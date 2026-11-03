/**
 * The Vite config of the web-console app (#7461): the shared settings (vite.shared.ts at the
 * root), the Vite plugins of the features it ships, its dev server and its build. The build goes
 * to dist/ at the root of the repository, where the release scripts and the SBOM expect it.
 */
import { writeFileSync, readdirSync, renameSync, rmSync, readFileSync, statSync } from "fs";
import { resolve } from "path";
import { defineConfig, mergeConfig, PluginOption } from "vite";
import mkcert from "vite-plugin-mkcert";
import { composerVitePlugin } from "@inmanta/web-console-feature-composer/vite";
import { graphiqlVitePlugin } from "@inmanta/web-console-feature-graphiql/vite";
import { repoRoot, sharedConfig } from "../../vite.shared.ts";

const distDir = resolve(repoRoot, "dist");

const PROTOCOL_REWRITE = process.env.HTTPS === "true" ? "https" : "http";

// Custom plugin to move assets to root and rewrite references
function moveAssetsToRootPlugin() {
  return {
    name: "move-assets-to-root",
    closeBundle() {
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
      const configSource = resolve(import.meta.dirname, "src/config.js");
      const configDest = resolve(distDir, "config.js");
      const htmlFile = resolve(distDir, "index.html");
      // Copy favicon.ico from public/images/ to dist/
      const faviconSource = resolve(repoRoot, "public/images/favicon.ico");
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
  };
}

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

const plugins: PluginOption = [
  composerVitePlugin(),
  graphiqlVitePlugin(),
  blockMonacoCDNPlugin(),
  moveAssetsToRootPlugin(),
  copyConfigPlugin(),
  process.env.HTTPS === "true" ? mkcert() : undefined,
].filter(Boolean);

export default defineConfig(
  mergeConfig(sharedConfig, {
    root: import.meta.dirname,
    // The .env file and the shared public folder are at the root of the repository.
    envDir: repoRoot,
    publicDir: resolve(repoRoot, "public"),
    plugins,
    base: "./",
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
          target:
            process.env.VITE_API_BASEURL || process.env.PROXY_TARGET || "https://localhost:8888",
          changeOrigin: true,
          secure: false,
          protocolRewrite: PROTOCOL_REWRITE,
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
        },
        "/lsm": {
          target:
            process.env.VITE_API_BASEURL || process.env.PROXY_TARGET || "https://localhost:8888",
          changeOrigin: true,
          secure: false,
          protocolRewrite: PROTOCOL_REWRITE,
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
        },
      },
    },
    build: {
      outDir: distDir,
      // dist/ is outside the app's folder, so Vite only empties it when asked to.
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
  })
);
