import * as webpack from 'webpack';
import { default as common } from './webpack.common';

const production: webpack.Configuration = {
    mode: 'production',
    devtool: false,
    optimization: {
        minimize: false
    }
};

module.exports = env => common(env, production);