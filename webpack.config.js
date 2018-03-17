const config = require('./config');
const path = require('path');
const SRC = config.SRC;
const CONFIG = config.CONFIG;
const HTDOCS = config.HTDOCS;
const BASE_PATH = config.BASE_PATH;
const DEST = config.DEST;

const mode = 'development';

module.exports = {
    mode,
    entry: `${SRC}/js/script.js`,
    output: {
        filename: 'script.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    devtool: mode === 'development' ? 'inline-source-map' : 'none'
};
