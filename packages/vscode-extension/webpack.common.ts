import * as path from 'path';
import * as webpack from 'webpack';
import { merge } from 'webpack-merge';
import * as glob from 'glob';
import * as CopyPlugin from 'copy-webpack-plugin';
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import * as ts from 'typescript';
import WatchMarkersPlugin from '../../build/plugins/watchMarkers';

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

export function transformerFactory(context: ts.TransformationContext) : ts.Transformer<ts.SourceFile> {
    return (node: ts.SourceFile) => {
        node.forEachChild(child => {
            if (ts.isImportDeclaration(child)) {
                console.debug(node.fileName + ' imports ' + child.importClause?.name?.text);
            }
        });
        return node;
    };
}

const common : webpack.Configuration = {
    context: __dirname,
    devtool: 'source-map',
    target: 'node',
    module: {
        rules: [
            {
                test: /\.ts$/,
                include: path.resolve(__dirname, 'src'),
                use: [{
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: false
                        //getCustomTransformers: () => ({ before: [transformerFactory] })
                    }
                }],
            },
            {
                test: /\.yaml$/,
                use: ['./build/loaders/yaml']
            },
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'node_modules'),
                use: ['./build/loaders/prefixTransform']
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.html', '.json', '.yaml'],
        modules: [ 'node_modules', 'src'],
        alias: {
            'salesforce-alm': path.resolve(__dirname, 'node_modules', 'salesforce-alm'),
            '@salesforce/core': path.resolve(__dirname, 'node_modules', '@salesforce', 'core'),
            'jsforce': path.resolve(__dirname, 'node_modules', 'jsforce'),
            'sass.js': path.resolve(__dirname, 'node_modules', 'sass.js'),
            'js-yaml': path.resolve(__dirname, 'node_modules', 'js-yaml'),
            'cli-ux': path.resolve(__dirname, 'node_modules', 'cli-ux'),
            '@vlocode/core': path.resolve(__dirname, 'packages', 'core', 'src', 'index.ts'),
            '@vlocode/util': path.resolve(__dirname, 'packages', 'util', 'src', 'index.ts')
        },
        plugins: [ new TsconfigPathsPlugin() ]
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
                sass: {
                    priority: 10,
                    test: /[\\/]sass\.js[\\/]/,
                    name: 'lib-sass'
                },
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor'
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

const vscodeExtension : webpack.Configuration = {
    entry: {
        'vlocode': './src/extension.ts',
        'sass-compiler': './src/lib/sass/forked/fork.ts',
    },
    name: 'vlocode',
    devtool: 'source-map',
    output: {
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname, 'out'),
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
        .map(key => merge(common, configVariations[key], extraConfig));
};