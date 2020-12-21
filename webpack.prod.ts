
import * as webpack from 'webpack';
import { default as common } from './webpack.common';
import * as TerserPlugin from 'terser-webpack-plugin';

const production: webpack.Configuration = {
    mode: 'production',
    devtool: 'inline-source-map',
    optimization: {
        mergeDuplicateChunks: true
    }
};

module.exports = env => common(env, production);