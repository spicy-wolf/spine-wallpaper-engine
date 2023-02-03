const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

/**
 * @param {*} env from cli "--env"
 */
module.exports = (env) =>
  merge(common(env), {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
      static: './dist',
    },
  });
