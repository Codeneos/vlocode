const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/extension.ts', 
  target: 'node',
  name: 'vlocode',
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
    extensions: [ '.tsx', '.ts', '.js' ]
  },
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
  },
  mode: 'development'
};