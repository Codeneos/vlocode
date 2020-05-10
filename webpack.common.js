const path = require('path');
const merge = require('webpack-merge').smart;
const packageJson = require("./package.json");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const glob = require('glob');
const CopyPlugin = require('copy-webpack-plugin');

const externals = [
   // In order to run tests the main test frameworks need to be marked
   // as external to avoid conflicts when loaded by the VSCode test runner
   'mocha',
   'chai',
   'sinon',
   // VSCode is an external that we do not want to package
   'vscode', 
   'vscode-languageclient',
   'electron'
];
const packageExternals = [...Object.keys(packageJson.dependencies), ...externals];
const webpackBuildWatchPlugin = {
    buildCounter: 0,
    apply(compiler) {
        // Create text markers in webpacks output to make it easier
        // for VSCode to detect errors during the build in watch mode
        compiler.hooks.compile.tap('WatchMarker', () => {
            if (this.buildCounter++ == 0) {
                console.log(`Webpack: build starting...`);
            }
        });
        [compiler.hooks.failed, compiler.hooks.afterEmit].forEach(e => e.tap('WatchMarker', () => {
            if (--this.buildCounter == 0) {
                console.log(`Webpack: build completed!`);
            }
        }));
    }
}; 

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
            '@salesforce/core': path.resolve(__dirname, 'node_modules', '@salesforce', 'core'),
            'jsforce': path.resolve(__dirname, 'node_modules', 'jsforce'),
            'sass.js': path.resolve(__dirname, 'node_modules', 'sass.js'),
            'js-yaml': path.resolve(__dirname, 'node_modules', 'js-yaml')
        }
    },
    output: {
        filename: '[name].js',
        chunkFilename: '[id].js',
        devtoolModuleFilenameTemplate: '[absolute-resource-path]',
        pathinfo: true
    },    
    plugins: [ webpackBuildWatchPlugin ],
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
    },
    name: 'vlocode',
    devtool: 'source-map',
    output: {
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname, 'out'),
    },    
    plugins: [
        new CopyPlugin([     
            { context: 'node_modules/vlocity/apex', from: '**/*.cls', to: 'apex', ignore: [ 'TestJob.cls' ] }
        ]),
    ]
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

const configVariations = {
    extension: vscodeExtension,
    tests: tests
}

module.exports = (env, extraConfig) => {
    const configCommon = common(env);
    return Object.keys(configVariations)
        .filter(key => env[key])
        .map(key => merge(configCommon, configVariations[key], extraConfig));
};