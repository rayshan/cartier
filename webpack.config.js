"use strict";

const path = require("path"),
    webpack = require("webpack"),
    autoprefixer = require("autoprefixer"),
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
        // css-loader uses cssnano, which only uses autoprefixer to remove unnecessary prefixes;
        // we don't need this since we're passing it to autoprefixer for prefixing
        autoprefixer: false,
        discardComments: {removeAll: true},
        minimize: !isDebug
    }),
    sassLoaderSubLoaders = `css?${cssLoaderConfig}!` +
        (isDebug ? "" : `postcss!`) +
        `sass`,
    // Reloading extracted css with hot module replacement per
    // https://github.com/webpack/extract-text-webpack-plugin/issues/30#issuecomment-125757853
    sassLoader = isDebug ?
        `style!${sassLoaderSubLoaders}` :
        ExtractTextPlugin.extract(sassLoaderSubLoaders),
    cssOutputPath = isDebug ? "bundle.css" : "bundle-[hash].css";

const webpackPlugins = () => {
    const plugins = [
        new webpack.DefinePlugin({
            "process.env": {
                // Setting a pure string doesn't work
                NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
            }
        }),
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
            // Safari TP 13 complains about mediaQueries not found,
            // but it should support const block scoping, not sure why this is needed
            "transform-es2015-block-scoping",
            // No browser supports this for now; webpack2 may remove the need for it
            "transform-es2015-modules-commonjs"
        );
    } else {
        plugins.push(
            // Uses entire es2015 preset plus below
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
    resolve: {
        modulesDirectories: ["node_modules", "app"]
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
                loader: sassLoader,
                test: /\.scss$/
            }
        ]
    },
    postcss: function () {
        return [
            autoprefixer({
                browsers: "last 2 versions",
                cascade: false,
            }),
        ];
    },
    sassLoader: {
        sourceMap: true,
        includePaths: [
            "node_modules",
            "app",
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
