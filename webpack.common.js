const path = require('path');
const merge = require('webpack-merge').smart;
const packageJson = require("./package.json");
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
const packageExternals = [...Object.keys(packageJson.dependencies), ...externals];

/**@type {import('webpack').Configuration}*/
const common = {
    context: __dirname,
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                enforce: 'pre',
                use: [
                    {
                        loader: 'tslint-loader',
                        options: { 
                            fix: true,
                            typeCheck: false,
                            tsConfigFile: 'tsconfig.json'
                        }
                    }
                ]
            },
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                            experimentalWatchApi: true
                        },
                    },
                ],
            },
            {
                test: /\.html$/,
                exclude: /test.html/i,
                use: [
                    { loader: 'cache-loader' },
                    {
                        loader: 'html-loader',
                        options: {
                            exportAsDefault: true
                        }
                    }
                ]
            },
            {
                test: /\.yaml$/,
                use: ['cache-loader', './build/loaders/yaml']
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.html'],
        modules: ['node_modules', 'src']
    },
    output: {
        filename: '[name].js',
        chunkFilename: '[id].js',
        devtoolModuleFilenameTemplate: '[absolute-resource-path]',
        pathinfo: false
    },
    mode: 'development',
    externals: 
        function(context, request, callback) {
            const isExternal = packageExternals.some(
                moduleName => new RegExp(`^${moduleName}(/|$)`, 'i').test(request)
            )
            if (isExternal){
                return callback(null, 'commonjs ' + request);
            }
            callback();
        }
};

/**@type {import('webpack').Configuration}*/
const vscodeExtension = {
    entry: {
        'vlocode': './src/extension.ts'
    },
    target: 'node',
    name: 'vlocode',
    devtool: 'source-map',
    output: {
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname, 'out')
    }
};

/**@type {import('webpack').Configuration}*/
const tests = {
    entry: fs.readdirSync('./src/test/')
        .filter(file => file.match(/(.*)\.test\.ts$/))
        .reduce((map, file) => Object.assign(map, {
            [file.replace(/(.*\.test)\.ts$/, '$1')]: './src/test/' + file
        }), 
        { index: './src/test/index.ts' }),
    target: 'node',
    name: 'tests',
    output: {
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname, 'out', 'test')
    }
};

/**@type {import('webpack').Configuration}*/
const views = {
    entry: {
        'script': './src/views/vlocode.ts'
    },
    name: 'views',
    output: {
        path: path.resolve(__dirname, 'out', 'views'),
        publicPath: '/'
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
