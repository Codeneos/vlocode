const path = require('path');
const merge = require('webpack-merge').smart;
const webpack = require('webpack');
const entry = require('webpack-glob-entry');
const HtmlWebpackPlugin = require('html-webpack-plugin')

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
      },
      {
        test: /\.html$/,
        exclude: /test.html/i,
        use: [
          {
            loader: 'html-loader',
            options: {
              exportAsDefault: true
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.html']
  },
  mode: 'development'
};

let vscodeExtension = {
  entry: {
    'vlocode': './src/extension.ts'
  },
  target: 'node',
  name: 'vlocode',
  devtool: 'source-map',
  output: {    
    filename: '[name].js',
    chunkFilename: '[id].js',
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
  entry: {
    'script': './src/views/vlocode.ts'
  },
  name: 'views',
  output: {
    path: path.resolve(__dirname, 'out', 'views'),
    publicPath: '/',
    filename: '[name].js',
    chunkFilename: '[id].js'
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all'
        }
      }
    }
  },
  devServer: {
    contentBase: path.join(__dirname, 'out', 'views'),
    compress: true,
    port: 9000
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/test/test.html.tpl'
    })
  ]
};

module.exports = [
  merge(common, vscodeExtension), 
  merge(common, views)
];