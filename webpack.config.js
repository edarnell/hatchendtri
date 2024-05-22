const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { version } = require('./public/manifest.json');

base = {
    entry: {
        main: './src/index.mjs'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: `[name].${version}.js`,
        clean: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html'
        }),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin()
    ],
    module: {
        rules: [
            // ...
            {
                test: /\.css$/,
                use: ['css-loader'],
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|ico|gz)$/i,
                type: 'asset/resource',
                generator: {
                    filename: '[name][ext]'
                }
            },
            {
                test: /\.html$/i,
                loader: 'html-loader',
            },
            {
                test: /\.mjs$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', {
                                modules: false,
                                useBuiltIns: 'usage',
                                corejs: { version: 3, proposals: true }
                            }]
                        ],
                        plugins: ['@babel/plugin-syntax-jsx']
                    }
                }
            },
        ],
    },
};

const dev = {
    mode: 'development',
    devtool: 'eval-source-map',
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        port: 3000,
        historyApiFallback: {
            index: '/'
        },
        proxy: [
            {
                context: ['/ajax'],
                target: 'http://localhost:4000',
            },
        ],
    },
};

const modern = {
    mode: 'production',
    optimization: {
        minimize: true,
        splitChunks: {
            chunks: 'all'
        }
    }
};

module.exports = (env, argv) => {
    if (argv.mode === 'production') {
        return merge(base, modern)// [merge(base, modern), merge(base, legacy)];
    } else {
        return merge(base, dev)
    }
};
