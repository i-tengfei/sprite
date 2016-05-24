var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')

var isProduction = function () {
    return process.env.NODE_ENV === 'production';
};

module.exports = {
    entry: {
        app: './src/app.js'
    },
    output: {
        path: '/',
        filename: '/[hash]-[name].js'
    },
    module: {
        loaders: [
            { test: /\.js$/, include: /src/, loader: 'babel', query: {
                presets: ['es2015', 'stage-0']
            } }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            minimize: true
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/index.html',
            inject: 'body',
            chunks: [ 'app' ]
        })
    ],
    devServer: {
        host: '0.0.0.0',
        port: 3001,
        historyApiFallback: true
    },
    devtool: isProduction() ? null : 'source-map'
}
