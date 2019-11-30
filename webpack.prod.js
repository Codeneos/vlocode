
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');

const minimizerOptions = {
    ecma: 6,
    warnings: true,
    parse: {},
    compress: {
        dead_code: false,
        inline: true,
        module: true
    },
    mangle: false,
    module: true,
    keep_classnames: true,
    keep_fnames: true
}

const chunkingOptions = {
    chunks: 'all'
}

module.exports = env => common(env, {
    mode: 'production',
    devtool: 'none',
    optimization: {
        mergeDuplicateChunks: true,
        splitChunks: chunkingOptions,
        minimizer: [new TerserPlugin({ terserOptions: minimizerOptions })]
    }
});