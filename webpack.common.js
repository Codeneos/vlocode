const path = require('path');
const merge = require('webpack-merge').smart;
const packageJson = require("./package.json");
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const glob = require('glob');
const CopyPlugin = require('copy-webpack-plugin');
const { DuplicatesPlugin } = require("inspectpack/plugin");

const externals = [
   // In order to run tests the main test frameworks need to be marked
   // as external to avoid conflicts when loaded by the VSCode test runner
   'mocha',
   'chai',
   'sinon',
   // VSCode is an external that we do not want to package
   'vscode', 
   'vscode-languageclient',
   // these do not want to package
   'electron',
   'sass.js'
];
const packageExternals = [...Object.keys(packageJson.dependencies), ...externals];

/**@type {import('webpack').Configuration}*/
const common = env => ({
    context: __dirname,
    devtool: 'source-map',
    target: 'node',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    { loader: 'ts-loader', options: { transpileOnly: env.transpileOnly } }
                ],
            },
            {
                test: /\.html$/,
                exclude: /test.html/i,
                use: [
                    { loader: 'cache-loader' },
                    { loader: 'html-loader', options: { exportAsDefault: true } }
                ]
            },
            {
                test: /\.yaml$/,
                use: ['cache-loader', './build/loaders/yaml']
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.html', '.json'],
        modules: ['node_modules', 'src'],
        alias: {
            "@constants$": path.resolve(__dirname, 'src', 'constants'),
            "@util$": path.resolve(__dirname, 'src', 'util'),
            'salesforce-alm': path.resolve(__dirname, 'node_modules', 'salesforce-alm'),
            '@salesforce/core': path.resolve(__dirname, 'node_modules', '@salesforce', 'core')            
        }
    },
    output: {
        filename: '[name].js',
        chunkFilename: '[id].js',
        devtoolModuleFilenameTemplate: '[absolute-resource-path]',
        pathinfo: true
    },    
    node: {
        process: false,
        __dirname: false,
        __filename: false
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
});

/**@type {import('webpack').Configuration}*/
const vscodeExtension = {
    entry: {
        'vlocode': './src/extension.ts',
        'fork': './src/extensionFork.ts'
    },
    name: 'vlocode',
    devtool: 'source-map',
    output: {
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname, 'out'),
    },    
    plugins: [
        new CopyPlugin([
            { context: 'node_modules/vlocity/lib', from: '*.yaml', to: '.' },       
            { context: 'node_modules/vlocity/lib', from: '*.json', to: '.' }
        ]),
    ],
    // plugins: [
    //     new DuplicatesPlugin({
    //         // Emit compilation warning or error? (Default: `false`)
    //         emitErrors: false,
    //         // Display full duplicates information? (Default: `false`)
    //         verbose: false
    //     })
    // ],
    // resolve: {
    //     alias: {
    //         'js-force': path.resolve(__dirname, 'node_modules', 'js-force')
    //     }
    // }
};

/**@type {import('webpack').Configuration}*/
const tests = {
    entry:
        glob.sync('./src/test/**/*.test.ts').reduce((map, file) => Object.assign(map, {
            [file.replace(/^.*?test\/(.*\.test)\.ts$/i, '$1')]: file
        }), 
        { 
            index: './src/test/index.ts', 
            runTest: './src/test/runTest.ts' 
        }),
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

const configVariations = {
    extension: vscodeExtension,
    tests: tests,
    views: views
}

module.exports = (env, extraConfig) => {
    const configCommon = common(env);
    return Object.keys(configVariations)
        .filter(key => env[key])
        .map(key => merge(configCommon, configVariations[key], extraConfig));
};