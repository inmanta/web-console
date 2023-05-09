// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  env: {
    edition: "oss",
    project: "oss-frontend",
  },
  video: false,
  reporter: "junit",
  viewportWidth: 1500,
  viewportHeight: 700,
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
