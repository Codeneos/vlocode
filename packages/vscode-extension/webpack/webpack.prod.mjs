import * as webpack from 'webpack';
import common from './webpack.common.mjs';

/** @type {webpack.Configuration} */
const production = {
    mode: 'production',
    devtool: false,
    optimization: {
        minimize: true
    }
};

export default (env) => common(env, production);