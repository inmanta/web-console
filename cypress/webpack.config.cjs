const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const { GitRevisionPlugin } = require("git-revision-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const webpack = require("webpack");
const VersionFile = require("webpack-version-file");
const gitRevisionPlugin = new GitRevisionPlugin();
const packageJson = require("../package.json");

module.exports = {
  mode: "development",
  // make sure the source maps work
  devtool: "eval-source-map",
  plugins: [
    new webpack.IgnorePlugin({ resourceRegExp: /^\.\/(config|version)\.js$/ }),
    gitRevisionPlugin,
    new webpack.DefinePlugin({
      COMMITHASH: JSON.stringify(gitRevisionPlugin.commithash()),
      APP_VERSION: JSON.stringify(packageJson.version),
    }),
    new VersionFile({
      output: "src/version.json",
      package: "./package.json",
      template: "./version.ejs",
      data: {
        buildDate: new Date(),
        commitHash: JSON.stringify(gitRevisionPlugin.commithash()),
      },
    }),
    new CopyPlugin({
      patterns: [{ from: "src/version.json", to: "" }],
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(tsx|ts|jsx|js)?$/,
        use: [
          {
            loader: ["istanbul-instrumenter-loader", "ts-loader"],
            options: {
              transpileOnly: true,
              experimentalWatchApi: true,
            },
          },
        ],
      },
      {
        test: /\.(svg|ttf|eot|woff|woff2)$/,
        // only process modules with this loader
        // if they live under a 'fonts' or 'pficon' directory
        include: [
          path.resolve(__dirname, "node_modules/patternfly/dist/fonts"),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/react-core/dist/styles/assets/fonts",
          ),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/react-core/dist/styles/assets/pficon",
          ),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/patternfly/assets/fonts",
          ),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/patternfly/assets/pficon",
          ),
        ],
        use: {
          loader: "file-loader",
          options: {
            // Limit at 50k. larger files emited into separate files
            limit: 5000,
            outputPath: "fonts",
            name: "[name].[ext]",
          },
        },
      },
      {
        test: /\.svg$/,
        // only process SVG modules with this loader when they don't live under a
        // 'fonts', or 'pficon' directory, those are handled with other loaders
        type: "asset/inline",
      },
      {
        test: /\.(jpg|jpeg|png|gif)$/i,

        type: "asset/resource",
      },
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.txt$/,
        type: "asset/resource",
      },
      {
        test: /\.css$/,
        // include: [
        //   path.resolve(__dirname, "src"),
        //   path.resolve(__dirname, "node_modules/patternfly"),
        //   path.resolve(__dirname, "node_modules/@patternfly/patternfly"),
        //   path.resolve(__dirname, "node_modules/@patternfly/react-styles/css"),
        //   path.resolve(
        //     __dirname,
        //     "node_modules/@patternfly/react-core/dist/styles/base.css",
        //   ),
        //   path.resolve(
        //     __dirname,
        //     "node_modules/@patternfly/react-core/dist/esm/@patternfly/patternfly",
        //   ),
        //   path.resolve(
        //     __dirname,
        //     "node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css",
        //   ),
        //   path.resolve(
        //     __dirname,
        //     "node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css",
        //   ),
        //   path.resolve(
        //     __dirname,
        //     "node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css",
        //   ),
        //   path.resolve(__dirname, "node_modules/@inmanta/rappid/rappid.css"),
        // ],
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, "./tsconfig.json"),
      }),
    ],
    symlinks: false,
    cacheWithContext: false,
  },
};
