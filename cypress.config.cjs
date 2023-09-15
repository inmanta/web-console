// eslint-disable @typescript-eslint/no-var-requires
const { defineConfig } = require("cypress");
const { merge } = require("webpack-merge");
const webpackConfig = require("./cypress/webpack.config.cjs");

module.exports = defineConfig({
  env: {
    edition: "iso",
    project: "lsm-frontend",
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

  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
      webpackConfig: merge(webpackConfig, {
        entry: "",
        devServer: {
          port: 3000,
        },
      }),
    },
  },
});
