const merge = require('webpack-merge').smart;
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');

const minizerOptions = {
    ecma: 6,
    warnings: true,
    parse: {},
    compress: {
        dead_code: false,
        inline: false
    },
    mangle: false,
    module: true,
    keep_classnames: true,
    keep_fnames: true
}

const prodModeConfig = {
    mode: 'production',
    devtool: 'none',
    optimization: {
        mergeDuplicateChunks: true,
        minimizer: [new TerserPlugin({terserOptions: minizerOptions})]
    }
}

module.exports = [
    merge(common.extestion, prodModeConfig),
    merge(common.views, prodModeConfig)
];