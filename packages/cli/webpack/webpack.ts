import * as path from 'path';
import glob from 'glob';
import * as webpack from 'webpack';
import packageJson from '../package.json';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { EsbuildPlugin } from 'esbuild-loader';

const packageExternals = [
    'vscode',
    'vscode-languageclient',
    'electron',
    'utf-8-validate',
    'bufferutil'
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
            sassCompiler: '../vlocity-deploy/src/scss/forked/fork.ts'
        }),
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
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js', '.cjs', '.mjs', '.json', '.yaml'],
        alias: Object.fromEntries(
                workspacePackages.map(({ dir, packageJson }) => ([
                    packageJson.name,
                    path.join(dir, 'src')
                ]))
            ),
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
        );
        if (isExternal){
            return callback(undefined, `commonjs ${request}`);
        }
        callback();
    },
    plugins: [
        new webpack.IgnorePlugin({
            resourceRegExp: /^canvas$/,
            contextRegExp: /jsdom$/,
        }),
        new webpack.IgnorePlugin({
            resourceRegExp: /build$/,
            contextRegExp: /dtrace-provider$/,
        }),
        new webpack.DefinePlugin({
            __webpack_build_info__: JSON.stringify({
                version: packageJson.version,
                description: packageJson.description,
                buildDate: new Date().toISOString()
            })
        })
    ],
    infrastructureLogging: {
        level: "log"
    }
};

export default common;