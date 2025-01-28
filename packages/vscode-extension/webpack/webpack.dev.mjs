
import * as webpack from 'webpack';
import common from './webpack.common.mjs';

/** @type {webpack.Configuration} */
const development = {
    mode: 'development',
    output: {
        pathinfo: true,
    },
    optimization: {
        minimize: false
    }
};

export default (env) => common(env, development);