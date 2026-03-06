const { defineConfig } = require("cypress");
const { config } = require("dotenv");

config();

module.exports = defineConfig({
  env: {
    edition: "iso",
    GITLAB_TOKEN: process.env.GITLAB_TOKEN,
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
    excludeSpecPattern: ["cypress/e2e/Keycloak/**", "cypress/e2e/LocalAuth/**"],
  },
});
