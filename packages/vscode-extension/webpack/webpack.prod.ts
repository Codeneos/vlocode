import * as webpack from 'webpack';
import * as TerserPlugin from 'terser-webpack-plugin';
import { default as common } from './webpack.common';

const production: webpack.Configuration = {
    mode: 'production',
    devtool: false,
    optimization: {
        mergeDuplicateChunks: true,
        minimize: false,
        minimizer: [
            // @ts-ignore
            new TerserPlugin({
                // Optimize and compress code
                terserOptions: {
                    compress: {
                        arrows: true,
                        drop_debugger: true,
                        dead_code: false,
                        inline: false,
                        keep_classnames: true,
                        keep_fnames: true,
                        keep_infinity: true
                    },
                    mangle: false,
                    module: true,
                    format: undefined,
                },
                // Move license to different file
                extractComments: {
                    condition: 'some',
                    filename: fileData => {
                        // The "fileData" argument contains object with "filename", "basename", "query" and "hash"
                        return `${fileData.filename}.LICENSE.txt${fileData.query}`;
                    },
                    banner: licenseFile => {
                        return `License: ${licenseFile}`;
                    },
                }
            })
        ],
    }
};

module.exports = env => common(env, production);