const { join } = require("path");
const { pathToFileURL } = require("url");
const { defineConfig } = require("cypress");
const { config } = require("dotenv");

config();

/**
 * The tests of the composer's ship modes (cypress/e2e/ShipModes), against the ISO web console.
 * They put the web console they run against in each mode with the `setComposerShipMode` task
 * (scripts/composer-ship-mode.js): the one the orchestrator's container serves
 * (`ORCHESTRATOR_CONTAINER`, by default inmanta_orchestrator, as set up by
 * `yarn install:orchestrator:iso`), or the folder in `WEB_CONSOLE_DIR`, e.g. one served by
 * `vite preview`.
 */
module.exports = defineConfig({
  env: {
    GITLAB_TOKEN: process.env.GITLAB_TOKEN,
  },
  expose: {
    edition: "iso",
  },
  video: false,
  reporter: "junit",
  viewportWidth: 1500,
  viewportHeight: 900,
  reporterOptions: {
    mochaFile: "cypress/reports/junit/test-report-[hash].xml",
  },
  e2e: {
    baseUrl: "http://127.0.0.1:8888",
    supportFile: "cypress/support/e2e.js",
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    specPattern: "cypress/e2e/ShipModes/**",
    setupNodeEvents(on) {
      on("task", {
        async setComposerShipMode(mode) {
          const { setComposerShipMode } = await import(
            pathToFileURL(join(__dirname, "scripts/composer-ship-mode.js")).href
          );

          return setComposerShipMode(
            mode,
            process.env.WEB_CONSOLE_DIR
              ? { dir: process.env.WEB_CONSOLE_DIR }
              : { container: process.env.ORCHESTRATOR_CONTAINER || "inmanta_orchestrator" }
          );
        },
      });
    },
  },
});
