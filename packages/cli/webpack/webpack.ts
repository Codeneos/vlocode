import * as path from 'path';
import * as glob from 'glob';
import * as webpack from 'webpack';
import WatchMarkersPlugin from './plugins/watchMarkers';
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import type { Options } from 'ts-loader';
import * as packageJson from '../package.json';

const packageExternals = [
    'vscode',
    'vscode-languageclient',
    'electron'
];

const contextFolder = path.resolve(__dirname, '..');
const workspaceFolder = path.resolve(contextFolder, '..');

const common : webpack.Configuration = {
    name: 'vlocode-cli',
    mode: 'production',
    context: contextFolder,
    target: 'node',
    entry:
        glob.sync('./src/commands/**/*.ts').reduce((map, file) => Object.assign(map, {
            [file.replace(/^.*commands[\//]([^.]+)\.ts$/i, 'commands/$1')]: {
                dependOn: 'cli',
                import: file,
                runtime: false
            }
        }),
        {
            cli: './src/index.ts',
            sassCompiler: '../vlocity-deploy/src/sass/forked/fork.ts'
        }),
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        onlyCompileBundledFiles: true,
                        compilerOptions: {
                            sourceMap: false,
                            rootDir: undefined,
                            outDir: path.resolve(contextFolder, '.ts-temp')
                        },
                        transpileOnly: true,
                        configFile: 'tsconfig.json'
                    } as Options
                }],
            }
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
    optimization: {
        minimize: false,
        runtimeChunk: false,
        concatenateModules: true,
        mergeDuplicateChunks: true,
        mangleExports: false,
        removeEmptyChunks: true,
        removeAvailableModules: true,
        providedExports: false,
        usedExports: false,
        portableRecords: true,
        splitChunks: false,
    },
    externals: function({ request }, callback) {
        const isExternal = packageExternals.some(
            moduleName => request && new RegExp(`^${moduleName}(/|$)`, 'i').test(request)
        );
        if (isExternal){
            // @ts-ignore
            return callback(undefined, `commonjs ${request}`);
        }
        // @ts-ignore
        callback();
    },
    plugins: [
        new WatchMarkersPlugin(),
        new webpack.IgnorePlugin({
            resourceRegExp: /^canvas$/,
            contextRegExp: /jsdom$/,
        }),
        new webpack.DefinePlugin({
            __webpack_build_info__: JSON.stringify({ 
                version: packageJson.version, 
                description: packageJson.description, 
                buildDate: new Date().toISOString() 
            })
        })
    ]
};

export default common;