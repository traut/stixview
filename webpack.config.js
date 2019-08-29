const path = require('path');
const fs = require('fs');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');


const DEMO_SRC_DIR = path.resolve(__dirname, 'src/demos/');
const DEMO_DEST_DIR = path.resolve(__dirname, 'dist/demos/');


const demoFiles = fs.readdirSync(DEMO_SRC_DIR).map(function(filename) {
    return {
        template: path.resolve(DEMO_SRC_DIR, filename),
        filename: path.resolve(DEMO_DEST_DIR, filename),
        inject: 'head',
    }
})


module.exports = {
    entry: './src/index.js',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'stixview.bundle.js',
	},
	module: {
		rules:[
			{
                test: /\.css$/,
                use: [
                    'style-loader', 'css-loader'
                ]
            },
            {
                test: /\.svg$/,
                loader: 'svg-inline-loader'
            }
		]
    },
    watch: true,
    optimization: {
        minimize: false
    },
    plugins: demoFiles.map(function(details) {return new HtmlWebpackPlugin(details)}),
//    optimization: {
//        minimizer: [
//            new TerserPlugin({
//                cache: true,
//                parallel: true,
//                sourceMap: true, // Must be set to true if using source-maps in production
//                terserOptions: {
//                    // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
//                }
//            }),
//        ],
//    }
};
