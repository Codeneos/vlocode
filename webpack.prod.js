
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');

const minimizerOptions = {
    ecma: 2017,
    warnings: true,
    toplevel: false,
    parse: {},
    compress: false,
    mangle: false,
    module: true,
    keep_classnames: true,
    keep_fnames: true
}

module.exports = env => common(env, {
    mode: 'production',
    devtool: 'none',
    optimization: {
        mergeDuplicateChunks: true,
        minimizer: [new TerserPlugin({ terserOptions: minimizerOptions })]
    }
});