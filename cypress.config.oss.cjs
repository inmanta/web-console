const { defineConfig } = require("cypress");
const { config } = require("dotenv");

config();

module.exports = defineConfig({
  env: {
    edition: "oss",
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
    excludeSpecPattern: [
      "cypress/e2e/Keycloak/**",
      "cypress/e2e/LocalAuth/**",
      "cypress/e2e/Oidc/**",
      "cypress/e2e/scenario-2.1-basic-service.cy.js",
      "cypress/e2e/scenario-2.2-child-parent-service.cy.js",
      "cypress/e2e/scenario-2.4-expert-mode.cy.js",
      "cypress/e2e/scenario-3-service-details.cy.js",
      "cypress/e2e/scenario-9-orders.cy.js",
    ],
  },
});
