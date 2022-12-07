// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defineConfig } = require("cypress");

module.exports = defineConfig({
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
  },
});
