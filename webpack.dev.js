const common = require('./webpack.common.js');

module.exports = env => common(env, {
    mode: 'development',
    devtool: 'cheap-module-eval-source-map',
    stats: 'minimal',
    optimization: {
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false
    },
    output: {
        pathinfo: false,
    }
});