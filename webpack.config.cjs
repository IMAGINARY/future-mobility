const path = require('path');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const entryPoints = require('./webpack.entry-points.json');

const entry = Object.fromEntries(Object.entries(entryPoints)
  .map(([name, def]) => [name, `./src/js/${def.mainJs ? def.mainJs : `main-${name}.js`}`]));

const htmlPlugins = Object.entries(entryPoints).map(([name, def]) => {
  const htmlFileName = def.html ? def.html : `${name}.html`;
  return new HtmlWebpackPlugin({
    template: path.resolve(__dirname, `src/html/${htmlFileName}`),
    filename: path.resolve(__dirname, htmlFileName),
    chunks: [name],
    minify: true,
  });
});

module.exports = {
  entry,
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'assets'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: './.babel-cache',
            presets: [
              // Note: to debug Babel, the cache has to be disabled or emptied
              ['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3, debug: false }],
            ],
            sourceType: 'unambiguous',
          },
        },
      },
      {
        test: /\.(scss|css)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: './',
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
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  plugins: [
    new Dotenv(),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
    ...htmlPlugins,
    new CleanWebpackPlugin({
      // todo: temporary measure. Dev builds should be done without hashes in the filename.
      cleanOnceBeforeBuildPatterns: ['**/*'],
    }),
  ],
  mode: 'development',
  // Todo: change the source map settings for production builds
  devtool: 'source-map',
};
