const path = require('path');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    default: './src/js/main.js',
    city: './src/js/main-city.js',
    editor: './src/js/main-editor.js',
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'assets'),
  },
  module: {
    rules: [
      {
        test: /\.(scss|css)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '',
            },
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new Dotenv(),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/html/index.html'),
      filename: path.resolve(__dirname, 'index.html'),
      chunks: ['default'],
      minify: true,
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/html/city.html'),
      filename: path.resolve(__dirname, 'city.html'),
      chunks: ['city'],
      minify: true,
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/html/editor.html'),
      filename: path.resolve(__dirname, 'editor.html'),
      chunks: ['editor'],
      minify: true,
    }),
    new CleanWebpackPlugin({
      // todo: temporary measure. Dev builds should be done without hashes in the filename.
      cleanOnceBeforeBuildPatterns: ['**/*'],
    }),
  ],
  mode: 'development',
  // Todo: change the source map settings for production builds
  devtool: 'source-map',
};
