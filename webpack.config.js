"use strict";

const path = require("path"),
    fs = require("fs"),
    webpack = require("webpack"),
    DashboardPlugin = require('webpack-dashboard/plugin'),
    jsonImporter = require("node-sass-json-importer"),
    HtmlWebpackPlugin = require("html-webpack-plugin"),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    buildDir = path.resolve(__dirname, "build"),
    vendorManifest = require(path.resolve(buildDir, "vendor-manifest.json")),
    TITLE = require("./app/data/constants.js").TITLE,
    AUTHOR = require("./app/data/constants.js").AUTHOR,
    BASE_HREF = require("./app/data/constants.js").BASE_HREF;

//==================================================================================================

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
    cssOutputPath = isDebug ? "bundle.css" : "bundle-[hash].css",
    uglifyJsConfig = {
        comments: false,
        warnings: false,
        screw_ie8: true,
        compress: {
            warnings: false,
            pure_getters: true,
            drop_console: true,
            keep_fargs: false
        }
    },
    // Need to find it as filename contains a hash
    vendorBundleFilename = `${vendorManifest.name}.js`;

const webpackPlugins = function () {
    const plugins = [
        new webpack.DefinePlugin({
            "process.env": {
                // Setting a pure string doesn't work
                NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
            }
        }),
        new HtmlWebpackPlugin({
            template: "app/index.html",
            title: TITLE,
            author: AUTHOR,
            favicon: "app/media/favicon.png",
            baseHref: isDebug ? "/" : BASE_HREF,
            googleAnalyticsScript: isDebug ? null : fs.readFileSync("app/google-analytics.html"),
            vendorBundleScriptTag: `<script src="${vendorBundleFilename}"></script>>`,
        }),
        // TODO: investigate long-term caching strategies using
        // https://github.com/diurnalist/chunk-manifest-webpack-plugin
        new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: vendorManifest
        }),
    ];

    if (isDebug) {
        plugins.push(
            new DashboardPlugin()
        );
    } else {
        plugins.push(
            new webpack.optimize.OccurrenceOrderPlugin(true),
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin(uglifyJsConfig),
            new ExtractTextPlugin(cssOutputPath)
        );
    }

    return plugins;
};

const babelPlugins = function () {
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

/**
 * TODO: use HappyPack to parallelize loaders when project grows
 * @returns {[]}
 */
function webpackLoaders() {
    const loaders = [
        {
            loader: "babel",
            test: /\.jsx?$/,
            include: path.resolve(__dirname, "app"),
            query: {
                // Compile down fully to ES5 for production
                presets: isDebug ? null : ["es2015"],
                plugins: babelPlugins(),
                // Babel has its own cache separate from webpack's
                cacheDirectory: true,
            }
        },
        {
            loader: "json",
            include: path.resolve(__dirname, "app/data"),
            test: /\.json$/,
        },
        // This loader is helpful as webpack automatically bundles the assets with the
        // production build, with corrected paths
        {
            loader: "file",
            include: path.resolve(__dirname, "app/media"),
            test: /\.jpe?g$|\.gif$|\.png$|\.svg$/,
            query: {
                name: isDebug ? "[path][name].[ext]" : "[name].[ext]"
            },
        },
        {
            loader: sassLoader,
            include: path.resolve(__dirname, "app"),
            test: /\.scss$/,
        },
    ];
    return loaders;
}

const config = {
    entry: path.resolve(__dirname, "app/index.jsx"),
    resolve: {
        // So we don't have to do import from "app/data/xxx"
        root: path.resolve(__dirname, "app"),
        // Only use this for package managers as defining in resolve.root is faster
        // https://webpack.github.io/docs/build-performance.html#resolve-root-vs-resolve-modulesdirectories
        //
        modulesDirectories: ["node_modules"],
    },
    cache: true,
    debug: isDebug,
    bail: !isDebug,
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
        loaders: webpackLoaders()
    },
    sassLoader: {
        sourceMap: true,
        includePaths: [
            "node_modules",
            "app",
        ],
        // TODO: switch to sass-vars-loader so we don't have to
        // hard code calculations as strings in sassConstants.json
        importer: jsonImporter
    },
    plugins: webpackPlugins(),
    output: {
        path: buildDir,
        // publicPath: "/",
        publicPath: isDebug ? "/" : BASE_HREF,
        filename: isDebug ? "bundle.js" : "bundle-[hash].js"
    }
};

module.exports = config;
