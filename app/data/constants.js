"use strict";

// Sass constants are in separate file due to node-sass-json-importer not able to
// import from JavaScript files; see: https://github.com/Updater/node-sass-json-importer/issues/18
const sassConstants = require("./sassConstants.json");

const GOLDEN_RATIO = 1.62,
    THUMBNAIL_SCALE_NARROW = 100,
    // Enlarge thumbnails slightly on larger screens
    THUMBNAIL_SCALE_WIDE = THUMBNAIL_SCALE_NARROW * GOLDEN_RATIO,
    // PADDING_BASE = 16,
    // Below max aspect ratios are just estimates, e.g. pano pics could be much wider than 2.39
    MAX_LANDSCAPE_ASPECT_RATIO = 2.39,
    MAX_PORTRAIT_ASPECT_RATIO = GOLDEN_RATIO,
    // 100 * 1.62 = 162
    COLUMN_WIDTH_NARROW = Math.floor(GOLDEN_RATIO * THUMBNAIL_SCALE_NARROW),
    // 162 * 1.62 ≈ 262
    COLUMN_WIDTH_WIDE = Math.floor(GOLDEN_RATIO * THUMBNAIL_SCALE_WIDE),
    // 262 * 2.39 ≈ 626; used to calculate 2x, 3x, etc.
    MAX_DIMENSION_1X = Math.floor(COLUMN_WIDTH_WIDE * MAX_LANDSCAPE_ASPECT_RATIO);

module.exports = {
    // Property Info
    MASTHEAD: "Cartier - Exhibit your best photographs.",
    TITLE: "Photography of Ray Shan.",
    AUTHOR: "Ray Shan",
    COPYRIGHT: "All rights reserved.",
    BASE_HREF: "/photography/",
    LINK_DATA: [
        {label: "Home", uri: "https://shan.io"},
        {label: "Instagram", uri: "https://instagram.com/rayshan"},
        {label: "Twitter", uri: "https://twitter.com/rayshan"},
        {label: "Facebook", uri: "https://facebook.com/rayshan"}
    ],

    // Sizing
    //THUMBNAIL_SCALE_NARROW: THUMBNAIL_SCALE_NARROW,
    //THUMBNAIL_SCALE_WIDE: THUMBNAIL_SCALE_WIDE,
    GOLDEN_RATIO: GOLDEN_RATIO,
    // PADDING_BASE: PADDING_BASE,
    //MAX_LANDSCAPE_ASPECT_RATIO: MAX_LANDSCAPE_ASPECT_RATIO,
    MAX_PORTRAIT_ASPECT_RATIO: MAX_PORTRAIT_ASPECT_RATIO,
    COLUMN_WIDTH_NARROW: COLUMN_WIDTH_NARROW,
    COLUMN_WIDTH_WIDE: COLUMN_WIDTH_WIDE,
    MAX_DIMENSION_1X: MAX_DIMENSION_1X,

    // SASS / JavaScript bridge
    GUTTER: +sassConstants["grid-gutter"].substring(0, 2),
    cDetailMainLeave: sassConstants["cDetailMainLeave"],
    cDetailInfoLeave: sassConstants["cDetailInfoLeave"],
    cDetailMainAppear: sassConstants["cDetailMainAppear"],
    cDetailInfoAppear: sassConstants["cDetailInfoAppear"],
    cDetailMainEnter: sassConstants["cDetailMainEnter"],
    cDetailInfoEnter: sassConstants["cDetailInfoEnter"],

    // Other
    MONTH_NAMES: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ],
    KT_TO_KPH: 1.852
};
