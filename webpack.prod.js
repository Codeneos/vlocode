const merge = require('webpack-merge').smart;
const common = require('./webpack.common.js');

const prodModeConfig = {
    mode: 'production',
    devtool: 'none',
    optimization: {
		minimize: false
    }
}

module.exports = [
    merge(common.extestion, prodModeConfig),
    merge(common.views, prodModeConfig)
];