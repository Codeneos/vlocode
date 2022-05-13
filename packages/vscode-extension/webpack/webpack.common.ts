import * as path from 'path';
import * as webpack from 'webpack';
import { merge } from 'webpack-merge';
import * as glob from 'glob';
import * as CopyPlugin from 'copy-webpack-plugin';
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
//import * as ts from 'typescript';
import WatchMarkersPlugin from './plugins/watchMarkers';
import type { Options } from 'ts-loader';
import { readdirSync } from 'fs';

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

// export function transformerFactory(context: ts.TransformationContext) : ts.Transformer<ts.SourceFile> {
//     return (node: ts.SourceFile) => {
//         node.forEachChild(child => {
//             if (ts.isImportDeclaration(child)) {
//                 console.debug(node.fileName + ' imports ' + child.importClause?.name?.text);
//             }
//         });
//         return node;
//     };
// }

const common : webpack.Configuration = {
    context: contextFolder,
    devtool: 'source-map',
    target: 'node',
    module: {
        rules: [
            {
                test: /\.ts$/,
                //include: path.resolve(__dirname, 'src'),
                use: [{
                    loader: 'ts-loader',
                    options: {
                        onlyCompileBundledFiles: true,
                        transpileOnly: false,
                        configFile: 'tsconfig.json'
                    } as Options
                }],
            },
            {
                test: /\.yaml$/,
                use: ['./build/loaders/yaml']
            },
            {
                test: /\.js$/,
                include: path.resolve(contextFolder, 'node_modules'),
                use: ['./build/loaders/prefixTransform']
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.html', '.json', '.yaml'],
        // alias: {
        //     'salesforce-alm': path.resolve(__dirname, 'node_modules', 'salesforce-alm'),
        //     '@salesforce/core': path.resolve(__dirname, 'node_modules', '@salesforce', 'core'),
        //     'jsforce': path.resolve(__dirname, 'node_modules', 'jsforce'),
        //     'sass.js': path.resolve(__dirname, 'node_modules', 'sass.js'),
        //     'js-yaml': path.resolve(__dirname, 'node_modules', 'js-yaml'),
        //     'cli-ux': path.resolve(__dirname, 'node_modules', 'cli-ux'),
        //     '@vlocode/core': path.resolve(__dirname, 'packages', 'core', 'src', 'index.ts'),
        //     '@vlocode/util': path.resolve(__dirname, 'packages', 'util', 'src', 'index.ts')
        // },
        alias: {
            '@vlocode/core': path.resolve(workspaceFolder, 'core', 'src', 'index.ts'),
            '@vlocode/salesforce': path.resolve(workspaceFolder, 'salesforce', 'src', 'index.ts'),
            '@vlocode/util': path.resolve(workspaceFolder, 'util', 'src', 'index.ts'),
            '@vlocode/vlocity-deploy': path.resolve(workspaceFolder, 'vlocity-deploy', 'src', 'index.ts')
        },
        plugins: [ 
            new TsconfigPathsPlugin()
        ]
    },
    output: {
        filename: '[name].js',
        chunkFilename: '[id].js',
        devtoolModuleFilenameTemplate: '[absolute-resource-path]'
    },
    plugins: [
        new WatchMarkersPlugin()
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
                    priority: 10,
                    test: /[\\/]sass\.js[\\/]/,
                    name: 'lib-sass',
                    reuseExistingChunk: false,
                },
                'vlocity-deploy': {
                    priority: 10,
                    test: /[\\/]packages[\\/]vlocity-deploy[\\/]/,
                    name: 'vlocity-deploy'
                },
                salesforce: {
                    priority: 10,
                    test: /[\\/]packages[\\/]salesforce[\\/]/,
                    name: 'salesforce'
                },
                core: {
                    priority: 10,
                    test: /[\\/]packages[\\/]core[\\/]/,
                    name: 'core'
                },
                util: {
                    priority: 10,
                    test: /[\\/]packages[\\/]util[\\/]/,
                    name: 'util'
                },
                shared: {
                    priority: 5,
                    test: /[\\/]node_modules[\\/]/,
                    name: 'shared',
                    reuseExistingChunk: false
                }
            },
        },
    },
    cache: {
        type: 'memory'
    },
    externals:
        function({ request }, callback) {
            const isExternal = packageExternals.some(
                moduleName => request && new RegExp(`^${moduleName}(/|$)`, 'i').test(request)
            );
            if (isExternal){
                // @ts-ignore
                return callback(undefined, `commonjs ${request}`);
            }
            // @ts-ignore
            callback();
        }
};

const extension : webpack.Configuration = {
    entry: {
        'vlocode': './src/extension.ts',
        'sass-compiler': '../vlocity-deploy/src/sass/forked/fork.ts'
    },
    name: 'vlocode',
    devtool: 'source-map',
    output: {
        libraryTarget: 'commonjs2',
        path: path.resolve(contextFolder, 'out'),
    },
    plugins: [
        // new CopyPlugin({
        //     patterns: [
        //         { context: 'node_modules/vlocity/apex', from: '**/*.cls', to: 'apex' }
        //     ]
        // }),
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