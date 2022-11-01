import * as webpack from 'webpack';
import { default as common } from './webpack.common';

const development : webpack.Configuration = {
    mode: 'development',
    optimization: {
        removeAvailableModules: true,
        removeEmptyChunks: false
    },
    output: {
        pathinfo: false,
    }
};

module.exports = env => common(env, development);