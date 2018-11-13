const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    app: "./tutorial/index.js"
    // app: "./benchmark/index.js"
  },
  mode: "development",
  output: {
    filename: "[name].bundle.js",
    path: path.join(__dirname, "public"),
    publicPath: "/"
  },
  devServer: {
    contentBase: path.join(__dirname, "public"),
    historyApiFallback: true,
    open: true,
    hot: true,
    overlay: {
      error: true
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "public/index.html")
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  watch: true,
  module: {
    rules: [
      {
        test: /\.js|jsx$/,
        exclude: /node_modules/,
        loaders: ["babel-loader"]
      }
    ]
  }
};
