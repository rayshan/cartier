"use strict";

const Promise = require("bluebird"),
    path = require("path"),
    GoogleMapsAPI = require("googlemaps"),
    through = require("through2"),
    streamifyArray = require("stream-array"),
    constants = require("../app/data/constants.js");

//==================================================================================================

const googleMapsApiConfig = {key: "AIzaSyCNEN-G4ePJrShWnzi1RA5POGfByUpixY8", secure: true},
    GOOGLE_MAPS_MAX_1X_WIDTH = 640; // Free Google Maps API allows maximum of 640x640 @ up to 2x

class GoogleMapsParams {
    constructor(properties) {
        Object.assign(this, properties);
        return this.data;
    }
    get data() {
        return {
            center: this.location,
            zoom: 10,
            size: `${GOOGLE_MAPS_MAX_1X_WIDTH}x${Math.floor(GOOGLE_MAPS_MAX_1X_WIDTH / constants.GOLDEN_RATIO)}`,
            scale: this.scale,
            maptype: "roadmap",
            markers: [{
                location: this.location,
                color: this.color
            }],
            style: [
                {
                    feature: "all",
                    rules: {
                        invert_lightness: true,
                        saturation: this.saturation,
                        hue: this.hue
                    }
                },
                {
                    feature: "road.highway",
                    rules: {visibility: "simplified"}
                },
                {
                    feature: "road.highway",
                    element: "labels",
                    rules: {visibility: "off"}
                },
                {
                    feature: "road.arterial",
                    element: "labels",
                    rules: {visibility: "off"}
                },
                {
                    feature: "road.local",
                    element: "labels",
                    rules: {visibility: "off"}
                }
            ]
        }
    }
}

const googleMapsAPI = new GoogleMapsAPI(googleMapsApiConfig);

//==================================================================================================

module.exports = (options, gulp, gp) => {
    const mapScales = [1, 2];
    let gmParams, outputFile;

    const generateMap = through.obj(function transform(metadata, encoding, next) {
        const mapPromises = mapScales.map((scale) => {
            gmParams = new GoogleMapsParams({
                location: metadata.location.coordinates.join(","),
                scale: scale,
                color: "0x" + metadata.colors[1].substr(1),
                saturation: metadata.isGrayscale ? -100 : "",
                hue: !metadata.isGrayscale ? "0x" + metadata.colors[0].substr(1) : ""
            });

            if (options.debug) gp.util.log(googleMapsAPI.staticMap(gmParams));

            return Promise.fromNode(googleMapsAPI.staticMap.bind(googleMapsAPI, gmParams))
        });

        Promise.all(mapPromises)
            .then((maps) => {
                maps.forEach((map, i) => {
                    outputFile = new gp.util.File({
                        contents: new Buffer(map, "binary")
                    });
                    outputFile.path = `${metadata.slug}-location-map@${i + 1}x.png`;
                    this.push(outputFile);
                });
                next();
            });
    });

    return () => {
        streamifyArray(options.data.photoData)
            .pipe(generateMap)
            .pipe(gulp.dest("build/maps"));
    }
};
