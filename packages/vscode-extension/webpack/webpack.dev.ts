import * as webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';

import { default as common } from './webpack.common';

const development : webpack.Configuration = {
    mode: 'development',
    output: {
        pathinfo: true,
    },
    optimization: {
        minimize: false
    }
};

module.exports = env => common(env, development);