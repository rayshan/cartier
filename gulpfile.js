"use strict";

const gulp = require("gulp"),
    gp = require("gulp-load-plugins")({lazy: true, camelize: true}),
    minimist = require("minimist"),
    runSequence = require('run-sequence');

//==========================================================

const minimistOptions = {
    default: {
        env: process.env.NODE_ENV || "production",
        debug: false
    }
};

const options = minimist(process.argv.slice(2), minimistOptions);
// consolidate both env and debug flags to debug; only debug is used
options.debug = !(options.env === "production" && !options.debug);
if (options.debug) process.env.NODE_ENV = "development";

const DATA_GLOB = "./app/data/data.json",
    IMAGE_GLOB = "./photos/*.jp?g",
    THUMBNAIL_GLOB = "./build/photos/*@1x.jp?g";

// Export here before tasks being required in next section so tasks can access these objects
module.exports = {
    gulp: gulp,
    gp: gp,
    options: options
};

//==========================================================
// Task definitions
//==========================================================

gulp.task("_files", require("./tasks/files")(Object.assign({glob: IMAGE_GLOB}, options), gulp, gp));

// TODO: Use THUMBNAIL_GLOB - thumbnails generated from _files task - to speed up metadata
// extraction
gulp.task("_metadata", require("./tasks/metadata")({glob: THUMBNAIL_GLOB}));

// dev - logs google static image URI
gulp.task("_maps", require("./tasks/maps")(Object.assign({data: require(DATA_GLOB)}, options), gulp, gp));

//==========================================================
// Task bundles
//==========================================================

gulp.task("photos", (done) => runSequence("_files", "_metadata", "_maps", done));
