const { defineConfig } = require("cypress");

module.exports = defineConfig({
  env: {
    edition: "oss",
    gitlabToken: process.env.GITLAB_TOKEN,
    keycloak: true,
  },
  video: false,
  reporter: "junit",
  viewportWidth: 1500,
  viewportHeight: 900,
  reporterOptions: {
    mochaFile: "cypress/reports/junit/test-report-[hash].xml",
  },
  e2e: {
    baseUrl: "https://127.0.0.1:8888",
    supportFile: "cypress/support/e2e.js",
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    specPattern: "cypress/e2e/Keycloak/**",
  },
});
