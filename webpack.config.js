const path = require('path');
const merge = require('webpack-merge').smart;
const webpack = require('webpack');
const entry = require('webpack-glob-entry');

let common = {
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        exclude: /node_modules/,
        query: {
          useCache: true
        }
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  mode: 'development'
};

let vscodeExtension = {
  entry: './src/extension.ts',
  target: 'node',
  name: 'vlocode',
  devtool: 'source-map',
  output: {
    filename: '[name].js',
    library: 'extension',
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, 'out'),
    devtoolModuleFilenameTemplate: '[absolute-resource-path]'
  },
  externals: {
    vscode: 'vscode',
    vlocity: 'vlocity'
  }
};

let views = {
  entry: entry('./src/views/*.ts'),
  output: {
    path: path.resolve(__dirname, 'out'),
    publicPath: '/',
    filename: '[name].js',
    chunkFilename: '[id].chunk.js'
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};

module.exports = [
  merge(common, vscodeExtension), 
  merge(common, views)
];