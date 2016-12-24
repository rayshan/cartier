"use strict";

const path = require("path"),
    webpack = require("webpack");

//==================================================================================================

const isDebug = process.env.NODE_ENV === "development",
    buildDir = path.resolve(__dirname, "build");

//==================================================================================================

function webpackPlugins() {
    const plugins = [
        new webpack.DefinePlugin({
            "process.env": {
                // Setting a pure string doesn't work
                NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
            }
        }),
        new webpack.DllPlugin({
            path: path.join(__dirname, "build", "[name]-manifest.json"),
            name: "[name]_[hash]", // Must be valid name in JavaScript, "_" not "-"
        }),
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
            })
        );
    }

    return plugins;
}

const config = {
    entry: {
        vendor: [
            "react",
            "react-dom",
            "react-redux",
            "react-router",
            "redux",
            "redux-thunk",
            "combokeys",
            "screenfull",
            "lodash.debounce",
        ],
    },
    debug: isDebug,
    bail: !isDebug,
    devtool: isDebug ? "cheap-module-eval-source-map" : "source-map",
    output: {
        path: buildDir,
        // Not using typical naming convention with "_" because we need to use library name in
        // vendor-manifest.json, which is also used as variable name in JavaScript
        filename: "[name]_[hash].js",
        // Must match name defined in plugins
        library: "[name]_[hash]",
    },
    plugins: webpackPlugins(),
    resolve: {
        root: path.resolve(__dirname, "node_modules")
    }
};

module.exports = config;
