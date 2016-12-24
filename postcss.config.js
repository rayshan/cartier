"use strict";

module.exports = {
    plugins: [
        require("autoprefixer")({
            browsers: "last 2 versions, not Explorer < 11, not Opera > 0, not ExplorerMobile > 0",
            cascade: false,
        })
    ]
};
