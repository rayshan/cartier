// Redux actions

import gridData from "./data/data.json";
import {TITLE} from "./data/constants.js";
import loadJS from "fg-loadjs";

// =================================================================================================

export const MATCH_MEDIA_QUERY = "MATCH_MEDIA_QUERY";
export const FETCH_GRID_DATA = "FETCH_GRID_DATA";
export const FETCH_PHOTO_DATA = "FETCH_PHOTO_DATA";
export const SET_TITLE = "SET_TITLE";
export const SET_KEYWORDS = "SET_KEYWORDS";
export const DID_LOAD_PICTURE_POLYFILL = "DID_LOAD_PICTURE_POLYFILL";
export const SET_BACKGROUND_IMAGE_URI = "SET_BACKGROUND_IMAGE_URI";

// Matches >= pixels, e.g. >= medium-width screen;
// same as @include media-breakpoint-up(md); see Bootstrap $grid-breakpoints.
// Some mediaQueries are not directly referenced, e.g. SM / MD.
// They're still needed to negate other mediaQueries.
export const mediaQueries = {
    XS: null,
    SM: window.matchMedia("(min-width: 544px)"),
    // Bootstrap uses 768px for MD; increasing slightly so iPad portrait renders as SM
    // and latest image renders with percentage size
    MD: window.matchMedia("(min-width: 768px)"),
    LG: window.matchMedia("(min-width: 992px)")
};

export function matchMediaQuery() {
    let mediaQuery;
    // Order is important; for...in loop does not guarantee order.
    if (mediaQueries.LG.matches) {
        mediaQuery = mediaQueries.LG;
    } else if (mediaQueries.MD.matches) {
        mediaQuery = mediaQueries.MD;
    } else if (mediaQueries.SM.matches) {
        mediaQuery = mediaQueries.SM;
    } else { // media query would still be mediaQueries.MD but it wouldn't match
        mediaQuery = mediaQueries.XS;
    }
    return {
        type: MATCH_MEDIA_QUERY,
        mediaQuery
    };
}

export function fetchGridData() {
    return {
        type: FETCH_GRID_DATA,
        data: gridData.photoData
    };
}

function weatherSummaryFromMETARData(data) {
    let summary;
    const {weather, clouds, temperature} = data;
    const {speed, direction} = data.wind;

    // metar parser produces nested weather.weather
    if (weather) {
        summary = weather.reduce(function (previous, current) {
            return current.meaning + (previous ? " / " + previous : "");
        }, "");
    } else if (clouds) {
        summary = clouds.reduce(function (previous, current) {
            current = current.meaning.includes("no clouds") ? "clear" : current.meaning;
            return current !== previous ?
                current + (previous ? " / " + previous : "") :
                previous;
        }, "");
    }
    return {
        windSpeed: speed,
        windDirection: direction,
        temperature,
        summary
    }
}

export function photoDataFromSlugAction(slug) {
    let i;
    const data = gridData.photoData.filter(({slug: _slug}, _i) => {
        if (_slug === slug) {
            i = _i;
            return true;
        }
    })[0];

    if (!data.isProcessed) {
        data.isLandscape = data.dimensions[0] > data.dimensions[1];
        data.aspectRatio = data.dimensions[0] / data.dimensions[1];
        if (data.weather) {
            data.weatherSummary = weatherSummaryFromMETARData(data.weather)
        }

        const previousIndex = i === 0 ? gridData.photoData.length - 1 : i - 1;
        const previousData = gridData.photoData[previousIndex];
        if (previousData) {
            data.previous = {
                slug: previousData.slug,
                title: previousData.title
            };
        }

        const nextIndex = i === gridData.photoData.length - 1 ? 0 : i + 1;
        const nextData = gridData.photoData[nextIndex];
        if (nextData) {
            data.next = {
                slug: nextData.slug,
                title: nextData.title
            };
        }

        data.isProcessed = true;
    }

    return {
        type: FETCH_PHOTO_DATA,
        data
    };
}

export function setTitle(titleFragment = "") {
    document.title = titleFragment + TITLE;
    return {
        type: SET_TITLE
    };
}

export function setKeywords(keywords = []) {
    let meta = document.querySelector('meta[name="keywords"]');
    if (!meta) {
        meta = document.createElement('meta');
        meta.name = "keywords";
        document.getElementsByTagName('head')[0].appendChild(meta);
    }
    meta.content = keywords;
    return {
        type: SET_KEYWORDS
    };
}

/**
 * This action is invoked once per application.
 *
 * @returns {Function}
 */
export function loadPicturePolyfill() {
    return dispatch => {
        const picturefillUri =
            "https://cdnjs.cloudflare.com/ajax/libs/picturefill/3.0.1/picturefill.min.js";
        window.picturefillCFG = window.picturefillCFG || [];
        window.picturefillCFG.push(["algorithm", "saveData"]);
        loadJS(picturefillUri, () => {
            dispatch(setDidLoadPicturePolyfill(true));
        });
    }
}

export function setDidLoadPicturePolyfill(didLoadPicturePolyfill) {
    return {
        type: DID_LOAD_PICTURE_POLYFILL,
        didLoadPicturePolyfill
    };
}

export function setBackgroundImageUri(backgroundImageUri) {
    return {
        type: SET_BACKGROUND_IMAGE_URI,
        backgroundImageUri
    };
}
