const path = require('path');
const merge = require('webpack-merge').smart;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const packageJson = require("./package.json");
const fs = require('fs');

const externals = [
   // In order to run tests the main test frameworks need to be marked
   // as external to avoid conflicts when loaded by the VSCode test runner
   'mocha',
   'chai',
   'sinon',
   // VSCode is an external that we do not want to package
   'vscode', 
   'vscode-languageclient'
];
const packageExternals = Object.keys(packageJson.dependencies)
        .concat(externals)
        .reduce((externals, dep) => Object.assign(externals, { [dep]: dep }), {});

const common = {
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader',
                exclude: /node_modules/,
                query: {
                    useCache: true
                }
            },
            {
                test: /\.html$/,
                exclude: /test.html/i,
                use: [
                    {
                        loader: 'html-loader',
                        options: {
                            exportAsDefault: true
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.html'],
        modules: ['node_modules', 'src']
    },
    mode: 'development',
    externals: packageExternals
};

const vscodeExtension = {
    entry: {
        'vlocode': './src/extension.ts'
    },
    target: 'node',
    name: 'vlocode',
    devtool: 'source-map',
    output: {
        filename: '[name].js',
        chunkFilename: '[id].js',
        library: 'extension',
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname, 'out'),
        devtoolModuleFilenameTemplate: '[absolute-resource-path]'
    }
};

const tests = {
    entry: fs.readdirSync('./src/test/')
        .filter(file => file.match(/(.*)\.test\.ts$/))
        .reduce((map, file) => Object.assign(map, {
            [file.replace(/(.*\.test)\.ts$/, '$1')]: './src/test/' + file
        }), 
        { index: './src/test/index.ts' }),
    target: 'node',
    output: {
        filename: '[name].js',
        chunkFilename: '[id].js',
        library: 'extension',
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname, 'out', 'test'),
        devtoolModuleFilenameTemplate: '[absolute-resource-path]'
    }
};

const views = {
    entry: {
        'script': './src/views/vlocode.ts'
    },
    name: 'views',
    output: {
        path: path.resolve(__dirname, 'out', 'views'),
        publicPath: '/',
        filename: '[name].js',
        chunkFilename: '[id].js'
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'all'
                }
            }
        }
    },
    devServer: {
        contentBase: path.join(__dirname, 'out', 'views'),
        compress: true,
        port: 9000
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/test/test.html.tpl'
        })
    ]
};

module.exports = {
    extestion: merge(common, vscodeExtension),
    tests: merge(common, tests),
    views: merge(common, views)
};