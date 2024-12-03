const { defineConfig } = require("cypress");

module.exports = defineConfig({
  env: {
    edition: "iso",
    environment: "test",
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
    supportFile: false,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
  },
});
