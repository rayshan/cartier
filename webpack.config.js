"use strict";

const path = require("path"),
    webpack = require("webpack"),
    HtmlWebpackPlugin = require("html-webpack-plugin"),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    TITLE = require("./app/data/constants.js").TITLE,
    AUTHOR = require("./app/data/constants.js").AUTHOR,
    BASE_HREF = require("./app/data/constants.js").BASE_HREF,
    jsonImporter = require("node-sass-json-importer"),
    fs = require("fs");

//==========================================================

const isDebug = process.env.NODE_ENV === "development",
    cssLoaderConfig = JSON.stringify({
        sourceMap: true,
        // Doesn't seem to autoprefix, using autoprefixer-loader instead
        // css-loader uses cssnano, which uses postcss ecosystem, including autoprefixer
        //autoprefixer: {
        //    browsers: "last 2 versions",
        //    cascade: false
        //},
        autoprefixer: false,
        discardComments: {removeAll: true},
        minimize: !isDebug
    }),
    autoprefixerConfig = JSON.stringify({
        browsers: "last 2 versions",
        cascade: false
    }),
    sassLoaderSubLoaders = `css?${cssLoaderConfig}!` +
        (isDebug ? "" : `autoprefixer?${autoprefixerConfig}!`) +
        `sass`,
    // Reloading extracted css with hot module replacement per
    // https://github.com/webpack/extract-text-webpack-plugin/issues/30#issuecomment-125757853
    sassLoader = isDebug ?
        `style!${sassLoaderSubLoaders}` :
        ExtractTextPlugin.extract(sassLoaderSubLoaders),
    cssOutputPath = isDebug ? "bundle.css" : "bundle-[hash].css";

const webpackPlugins = () => {
    const plugins = [
        new webpack.optimize.OccurenceOrderPlugin(true),
        new HtmlWebpackPlugin({
            template: "app/index.html",
            title: TITLE,
            author: AUTHOR,
            favicon: "app/media/favicon.png",
            baseHref: isDebug ? "/" : BASE_HREF,
            googleAnalyticsScript: isDebug ? null : fs.readFileSync("app/google-analytics.html")
        }),
        new webpack.optimize.CommonsChunkPlugin("vendors", "vendors-[hash].js")
    ];

    if (!isDebug) {
        plugins.push(
            new webpack.DefinePlugin({
                "process.env": {
                    NODE_ENV: JSON.stringify("production") // pure string doesn't work
                }
            }),
            new webpack.optimize.OccurrenceOrderPlugin(true),
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin({
                comments: false,
                warnings: false,
                screw_ie8: true,
                compress: {
                    warnings: false,
                    pure_getters: true,
                    drop_console: true,
                    keep_fargs: false
                }
            }),
            new webpack.NoErrorsPlugin(),
            new ExtractTextPlugin(cssOutputPath)
        );
    }

    return plugins;
};

const babelPlugins = () => {
    const plugins = [
        "transform-react-jsx",
        "transform-object-rest-spread"
    ];

    if (isDebug) {
        // Don't compile down fully to ES5 as we only debug on latest Chrome / Safari / Firefox
        plugins.push(
            //"check-es2015-constants",
            "transform-es2015-arrow-functions",
            //"transform-es2015-block-scoped-functions",
            "transform-es2015-block-scoping",
            "transform-es2015-classes",
            //"transform-es2015-computed-properties",
            "transform-es2015-destructuring",
            //"transform-es2015-for-of",
            //"transform-es2015-function-name",
            //"transform-es2015-literals",
            "transform-es2015-modules-commonjs",
            //"transform-es2015-object-super",
            "transform-es2015-parameters"
            //"transform-es2015-shorthand-properties",
            //"transform-es2015-spread",
            //"transform-es2015-sticky-regex",
            //"transform-es2015-template-literals",
            //"transform-es2015-typeof-symbol",
            //"transform-es2015-unicode-regex",
            //"transform-regenerator"
        );
    } else {
        plugins.push(
            // Reduces helper code repeating
            // https://babeljs.algolia.com/docs/usage/runtime/
            "transform-runtime",
            "transform-react-constant-elements",
            "transform-react-inline-elements"
        );
    }

    return plugins;
};

const config = {
    entry: {
        vendors: [
            "react",
            "react-dom",
            "react-redux",
            "react-router",
            "redux",
            "redux-thunk",
            "combokeys",
            "screenfull"
        ],
        app: path.resolve(__dirname, "app/index.jsx")
    },
    cache: true,
    debug: isDebug,
    // emit full source maps for debugging prod build,
    // won't be loaded by browser unless DevTools are open
    devtool: isDebug ? "cheap-module-eval-source-map" : "source-map",
    devServer: {
        port: 4000,
        contentBase: "build",
        historyApiFallback: isDebug ? true : {index: BASE_HREF}
        // noInfo: !isDebug
    },
    module: {
        loaders: [
            {
                loader: "babel",
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                query: {
                    // Compile down fully to ES5 for production
                    presets: isDebug ? null : ["es2015"],
                    plugins: babelPlugins()
                }
            },
            {
                loader: "json",
                test: /\.json$/
            },
            {
                loader: "imports?screenfull=screenfull",
                test: /screenfull/
            },
            {
                loader: "file",
                test: /\.jpe?g$|\.gif$|\.png$|\.svg$/,
                query: {
                    name: isDebug ? "[path][name].[ext]" : "[name].[ext]"
                }
            },
            {
                loader: sassLoader,
                test: /\.scss$/
            }
        ]
    },
    sassLoader: {
        sourceMap: true,
        includePaths: [
            "node_modules",
            "app/data"
        ],
        importer: jsonImporter
    },
    plugins: webpackPlugins(),
    output: {
        path: path.resolve(__dirname, "build"),
        // publicPath: "/",
        publicPath: isDebug ? "/" : BASE_HREF,
        filename: isDebug ? "bundle.js" : "bundle-[hash].js"
    }
};

module.exports = config;
