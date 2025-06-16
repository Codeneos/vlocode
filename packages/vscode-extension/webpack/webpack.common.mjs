import path from 'path';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import CopyPlugin from 'copy-webpack-plugin';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { EsbuildPlugin } from 'esbuild-loader';

const packageExternals = [
    // VSCode is an external that we do not want to package
    'vscode',
    'vscode-languageclient',
    'electron'
];

const contextFolder = path.resolve('.');
const packageJson = JSON.parse(readFileSync(path.join(contextFolder, './package.json')));
const workspaceFolder = path.resolve(contextFolder, '..');
const workspacePackages = readdirSync(workspaceFolder, { withFileTypes: true })
    .filter(p => p.isDirectory() && existsSync(path.join(workspaceFolder, p.name, 'package.json')))
    .map(p => ({
        name: p.name,
        dir: path.join(workspaceFolder, p.name),
        packageJson: JSON.parse(readFileSync(path.join(workspaceFolder, p.name, 'package.json')).toString())
    }));

/** @type {webpack.Configuration} */
const common = {
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
                        configFile: path.resolve('./webpack/tsconfig.json'),
                        onlyCompileBundledFiles: true,
                        projectReferences: true,
                        transpileOnly: process.env.CI == 'true' || process.env.CIRCLECI == 'true'
                    }
                }],
            },
            {
                test: /\.yaml$/,
                use: [ path.resolve('./webpack/loaders/yaml') ]
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
        }),
        new webpack.WatchIgnorePlugin({
            paths:[
            /\.js$/,
            /\.d\.[cm]ts$/
        ]})
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
        minimize: true,
        minimizer: [
            new EsbuildPlugin({
                target: 'es2020',
                keepNames: true,
                minify: true,
                legalComments: 'external'
            })
        ]
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

/** @type {webpack.Configuration} */
const extension  = {
    entry: {
        'vlocode': './src/extension.ts',
        'sass-compiler': '../vlocity-deploy/src/scss/sassCompilerProcess.ts'
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
        new webpack.BannerPlugin({
            banner: `vlocode v${packageJson.version} - ${new Date().toISOString()}\nCopyright P. van Gulik <peter@curlybracket.nl>\n[fullhash] ([file])`,
            include: [ 'vlocode.js' ]
        }),
        new webpack.BannerPlugin({
            banner: `vlocode v${packageJson.version} - ${new Date().toISOString()} ([fullhash])`,
            exclude: [ 'vlocode.js' ]
        }),
        new webpack.BannerPlugin({
            banner: `"use strict";\nvar __vlocodeStartTime = Date.now();`,
            include: [ 'vlocode.js' ],
            raw: true
        }),
        new webpack.DefinePlugin({
            __webpackBuildInfo: JSON.stringify({
                version: packageJson.version,
                buildDate: new Date().toISOString() 
            })
        })
    ]
};

const configVariations = { extension };

export default (env, extraConfig) => {
    return Object.keys(configVariations)
        .filter(key => env[key])
        .map(key => merge(common, configVariations[key], extraConfig));
};