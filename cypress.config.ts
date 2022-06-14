import { defineConfig } from "cypress";

export default defineConfig({
  video: false,
  reporter: "junit",
  reporterOptions: {
    mochaFile: "cypress/reports/junit/test-report-[hash].xml",
  },
  e2e: {
    baseUrl: "http://localhost:9000",
    supportFile: false,
  },
});
