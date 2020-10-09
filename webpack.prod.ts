import { default as common } from './webpack.common';
import * as TerserPlugin from 'terser-webpack-plugin';

module.exports = env => common(env, {
    mode: 'production',
    devtool: 'none',
    optimization: {
        mergeDuplicateChunks: true,
        minimizer: [new TerserPlugin({
            terserOptions: {
                ecma: 2019,
                toplevel: false,
                parse: {},
                compress: false,
                mangle: false,
                module: true,
                keep_classnames: true,
                keep_fnames: true
            }
        })]
    }
});