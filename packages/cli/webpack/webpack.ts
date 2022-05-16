import * as path from 'path';
import * as webpack from 'webpack';
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import type { Options } from 'ts-loader';

const contextFolder = path.resolve(__dirname, '..');
const workspaceFolder = path.resolve(contextFolder, '..');

const common : webpack.Configuration = {
    name: 'vlocode-cli',
    context: contextFolder,
    devtool: 'source-map',
    target: 'node',
    entry: {
        'cli': './src/index.ts'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                //include: path.resolve(__dirname, 'src'),
                use: [{
                    loader: 'ts-loader',
                    options: {
                        onlyCompileBundledFiles: true,
                        compilerOptions: {
                            rootDir: workspaceFolder
                        },
                        transpileOnly: false,
                        configFile: 'tsconfig.json'
                    } as Options
                }],
            }
            // ,
            // {
            //     test: /\.yaml$/,
            //     use: ['./build/loaders/yaml']
            // },
            // {
            //     test: /\.js$/,
            //     include: path.resolve(contextFolder, 'node_modules'),
            //     use: ['./build/loaders/prefixTransform']
            // }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.html', '.json', '.yaml'],
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
        devtoolModuleFilenameTemplate: '[absolute-resource-path]',
        libraryTarget: 'commonjs2',
        path: path.resolve(contextFolder, 'dist')
    },
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
        splitChunks: false
    },
    cache: {
        type: 'memory'
    }    
};

export default common;