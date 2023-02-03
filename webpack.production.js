const { mergeWithRules } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = (env) =>
  mergeWithRules({
    module: {
      rules: {
        test: 'match',
        exclude: 'replace',
      },
    },
  })(common(env), {
    mode: 'production',
  });
