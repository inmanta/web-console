const path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || "9000";
const publicPath = "/";

module.exports = merge(common, {
  mode: "development",
  devtool: "eval-source-map",
  devServer: {
    contentBase: "./dist",
    host: HOST,
    port: PORT,
    compress: true,
    inline: true,
    historyApiFallback: true,
    hot: true,
    overlay: true,
    watchOptions: {
      ignored: /node_modules/,
    },
  },
  plugins: [
    new Dotenv(),
    new webpack.EnvironmentPlugin({
      PUBLIC_PATH: publicPath,
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "index.html"),
      PUBLIC_PATH: publicPath,
      favicon: path.resolve(__dirname, "public", "images", "favicon.ico"),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        include: [
          path.resolve(__dirname, "src"),
          path.resolve(__dirname, "node_modules/patternfly"),
          path.resolve(__dirname, "node_modules/@patternfly/patternfly"),
          path.resolve(__dirname, "node_modules/@patternfly/react-styles/css"),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/react-core/dist/styles/base.css"
          ),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/react-core/dist/esm/@patternfly/patternfly"
          ),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css"
          ),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css"
          ),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css"
          ),
        ],
        use: ["style-loader", "css-loader"],
      },
    ],
  },
});
