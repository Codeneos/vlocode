import * as path from 'path';
import * as webpack from 'webpack';
import { merge } from 'webpack-merge';
import * as glob from 'glob';
import * as CopyPlugin from 'copy-webpack-plugin';
import WatchMarkersPlugin from './plugins/watchMarkers';
import { existsSync, readdirSync, readFileSync } from 'fs';

const packageExternals = [
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

const contextFolder = path.resolve(__dirname, '..');
const workspaceFolder = path.resolve(contextFolder, '..');
const workspacePackages = readdirSync(workspaceFolder, { withFileTypes: true })
    .filter(p => p.isDirectory() && existsSync(path.join(workspaceFolder, p.name, 'package.json')))
    .map(p => ({
        name: p.name,
        dir: path.join(workspaceFolder, p.name),
        packageJson: JSON.parse(readFileSync(path.join(workspaceFolder, p.name, 'package.json')).toString())
    }));

const common : webpack.Configuration = {
    context: contextFolder,
    devtool: 'source-map',
    target: 'node',
    stats: {
        children: false,
        moduleTrace: false,
        modules: false,
        warnings: false
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        configFile: path.resolve(__dirname, 'tsconfig.json'),
                        transpileOnly: process.env.CI == 'true' || process.env.CIRCLECI == 'true'
                    }
                }],
            },
            {
                test: /\.yaml$/,
                use: [ path.join(__dirname, './loaders/yaml') ]
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.html', '.json', '.yaml'],
        alias: Object.fromEntries(
            workspacePackages.map(({ dir, packageJson }) => ([
                packageJson.name,
                path.join(dir, 'src')
            ]))
        )
    },
    output: {
        filename: '[name].js',
        chunkFilename: '[id].js',
        devtoolModuleFilenameTemplate: (info) => {
            return path.relative(
                path.resolve(contextFolder, 'out'), 
                path.resolve(info.resourcePath)
            ).replace(/\\/g,'/');
        },
    },
    plugins: [
        new webpack.IgnorePlugin({
            resourceRegExp: /^canvas$/,
            contextRegExp: /jsdom$/,
        })
    ],
    node: {
        __dirname: false,
        __filename: false
    },
    mode: 'development',
    optimization: {
        runtimeChunk: false,
        removeEmptyChunks: true,
        removeAvailableModules: true,
        mergeDuplicateChunks: true,
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
                default: false,
                defaultVendors: false,
                sass: {
                    priority: 20,
                    test: /[\\/]sass\.js[\\/]/,
                    name: 'lib-sass',
                    reuseExistingChunk: true,
                },
                shared: {
                    priority: 5,
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    reuseExistingChunk: true
                }
            },
        },
        minimize: false
    },
    externals: function({ request }, callback) {
        const isExternal = packageExternals.some(
            moduleName => request && new RegExp(`^${moduleName}(/|$)`, 'i').test(request)
        )
        if (isExternal){
            // @ts-ignore
            return callback(undefined, `commonjs ${request}`);
        }
        // @ts-ignore
        callback();
    },
    infrastructureLogging: {
        level: "log"
    }
};

const extension : webpack.Configuration = {
    entry: {
        'vlocode': './src/extension.ts',
        'sass-compiler': '../vlocity-deploy/src/scss/forked/fork.ts'
    },
    name: 'vlocode',
    output: {
        libraryTarget: 'commonjs2',
        path: path.resolve(contextFolder, 'out'),
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { context: 'node_modules/vlocity/apex', from: '**/*.cls', to: 'apex' }
            ]
        }),
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
        path: path.resolve(contextFolder, 'out', 'test')
    }
};

const configVariations = { extension, tests };

export default (env, extraConfig) => {
    return Object.keys(configVariations)
        .filter(key => env[key])
        .map(key => merge(common, configVariations[key], extraConfig));
};