const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
  webpackFinal: async (config) => {
    config.resolve.plugins.push(new TsconfigPathsPlugin());
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });
    return config;
  },
  babel: async (options) => ({
    ...options,
    /**
     * This plugin was manually added because storybook was
     * crashing on a certain TypeScript feature.
     *
     * The specific feature that was causing the issue was
     * the contructor parameter properties shorthand.
     * With this you can just specify the contructor
     * parameters and the class properties are automatically
     * created and set.
     *
     * I believe babel for storybook has been configured to understand
     * TypeScript. But it might just remove typescript syntax.
     * And sometimes we need certain typescript code to result
     * in actual javascript code changes. This plugin fixes it.
     */
    plugins: ["@babel/plugin-transform-typescript"],
  }),
  typescript: {
    reactDocgen: "none",
  },
};
