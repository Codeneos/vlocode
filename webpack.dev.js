const common = require('./webpack.common.js');

module.exports = env => common(env, {
    mode: 'development',
    devtool: 'cheap-module-eval-source-map',
    stats: {
        children: false,
        moduleTrace: false,
        modules: false,
        // hide modoule warnings to avoid cluter
        warningsFilter: [
            (warning) => warning && !warning.includes('in./node_modules/')
        ]
    },
    optimization: {
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false
    },
    output: {
        pathinfo: false,
    }
});