import * as path from 'path';
import * as webpack from 'webpack';
import * as merge from 'webpack-merge';
import * as glob from 'glob';
import * as CopyPlugin from 'copy-webpack-plugin';
import * as packageJson from './package.json';

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
                console.log('Webpack: build starting...');
            }
        });
        [compiler.hooks.failed, compiler.hooks.afterEmit].forEach(e => e.tap('WatchMarker', () => {
            if (--this.buildCounter == 0) {
                console.log('Webpack: build completed!');
            }
        }));
    }
};

const common : webpack.Configuration = {
    context: __dirname,
    devtool: 'source-map',
    target: 'node',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: false,
                        configFile: 'tsconfig.build.json',
                    }
                }],
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
            '@constants$': path.resolve(__dirname, 'src', 'constants'),
            '@util$': path.resolve(__dirname, 'src', 'util'),
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
        strictModuleExceptionHandling: true
    },
    plugins: [ webpackBuildWatchPlugin ],
    node: {
        __dirname: false,
        __filename: false
    },
    mode: 'development',
    optimization: {
        runtimeChunk: false,
        providedExports: false,
        usedExports: false,
        portableRecords: true,
        moduleIds: 'named',
        chunkIds: 'named',
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor'
                },
            },
        },
    },
    externals:
        function({ context, request}, callback) {
            const isExternal = packageExternals.some(
                moduleName => new RegExp(`^${moduleName}(/|$)`, 'i').test(request)
            );
            if (isExternal){
                // @ts-ignore
                return callback(undefined, `commonjs ${  request}`);
            }
            // @ts-ignore
            callback();
        }
};

const vscodeExtension : webpack.Configuration = {
    entry: {
        'vlocode': './src/extension.ts',
        'sassCompiler': './src/lib/sass/forked/fork.ts',
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

const tests : webpack.Configuration = {
    entry:
        glob.sync('./src/test/**/*.test.ts').reduce((map, file) => Object.assign(map, {
            [file.replace(/^.*?test\/(.*\.test)\.ts$/i, '$1')]: file
        }),
        {
            index: './src/test/index.ts',
            runTest: './src/test/runTest.ts'
        }),
    optimization: {
        splitChunks: false,
    },
    name: 'tests',
    output: {
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname, 'out', 'test')
    }
};

const configVariations = {
    extension: vscodeExtension,
    tests: tests
};

export default (env, extraConfig) => {
    return Object.keys(configVariations)
        .filter(key => env[key])
        .map(key => merge.smart(common, configVariations[key], extraConfig));
};