const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const resolve = (pathStr) => {
  return path.join(__dirname, pathStr);
};

const DIST_FOLDER = 'dist';
const PUBLIC_FOLDER = 'public';

module.exports = (env) => ({
  mode: 'development',
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname, DIST_FOLDER),
    filename: 'bundle.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    alias: {
      '@src': resolve('src'),
      '@public': resolve('public'),
      '@resources': resolve('resources'),
    },
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: PUBLIC_FOLDER,
          to: '', // default output path
        },
      ],
    }),
  ],
  devServer: {
    historyApiFallback: true,
  },
});
