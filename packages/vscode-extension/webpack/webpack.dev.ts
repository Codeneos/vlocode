import * as webpack from 'webpack';
import { default as common } from './webpack.common';

const development : webpack.Configuration = {
    mode: 'development',
    devtool: 'source-map',
    optimization: {
        removeAvailableModules: true,
        removeEmptyChunks: false
    },
    output: {
        pathinfo: false,
    }
};

module.exports = env => common(env, development);