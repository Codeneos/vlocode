const common = require('./webpack.common.js');

module.exports = env => common(env, {
    mode: 'development',
    devtool: 'source-map',
    optimization: {
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
    },
});