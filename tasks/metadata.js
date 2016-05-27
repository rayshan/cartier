"use strict";

const Promise = require("bluebird"),

    path = require("path"),
    fs = Promise.promisifyAll(require("fs")),

    through = require("through2"),
    slug = require("slug"),
    dms2dec = require("dms2dec"),
    getImageTags = Promise.promisify(require("exiv2").getImageTags),
    Vibrant = require("node-vibrant"),
    parseMETAR = require("metar"),
    moment = require("moment"),
    tinycolor = require("tinycolor2"),
    sizeOf = require("image-size"),

    gulp = require("../gulpfile.js").gulp,
    gp = require("../gulpfile.js").gp,
    options = require("../gulpfile.js").options;

//==========================================================

const exifDateTimeFormat = "YYYY:MM:DD HH:mm:ss";

function stripMetadataFor(tag) {
    return tag.substr(tag.indexOf(" ") + 1);
}

function paletteWith(imageBuffer) {
    const v = new Vibrant(imageBuffer, {quality: 4});
    return Promise.fromNode(v.getPalette.bind(v));
}

/**
 * Test if a palette generated from node-vibrant is for a grayscale image
 *
 * @see https://github.com/akfish/node-vibrant/issues/16
 * @param palette
 * @returns {boolean}
 */
function isGrayscaleWith(palette) {
    const swatches = [palette.Muted, palette.DarkMuted, palette.LightMuted];
    let rgb, r;

    const isGrayscale = swatches.every((swatch) => {
        rgb = swatch.getRgb();
        r = rgb[0];
        return rgb.every((color) => color === r);
    });

    if (isGrayscale && options.debug) {
        gp.util.log(gp.util.colors.inverse("This image is grayscale."));
    }

    return isGrayscale;
}

//==========================================================

module.exports = (taskOptions) => {
    // Defined here due to needing gulp plugins in gp
    function readableColorsFrom(colorPair) {
        let color1 = colorPair[0],
            color2 = colorPair[1];

        const isReadable = tinycolor.isReadable(color1, color2, {level: "AA", size: "small"});

        if (!isReadable) {
            if (options.debug) {
                gp.util.log(gp.util.colors.bgBlue(
                    "Foreground & background colors extracted are not readable per WCAG guidelines; " +
                    "will be adjusted."
                ));
            }

            const potentialColor1 = tinycolor(color1).lighten(5).toString(),
                potentialColor2 = tinycolor(color2).darken(5).toString();

            // Avoid getting pure black or white as output
            if (potentialColor1.toUpperCase() !== "#FFFFFF") color1 = potentialColor1;
            if (potentialColor2 !== "#000000") color2 = potentialColor2;

            return readableColorsFrom([color1, color2]);

        } else {
            return [color1, color2];
        }
    }

    const extractMetadata = through.obj(
        function reduce(chunk, encoding, next) { // chunks are buffers

            if (typeof this.output === "undefined") this.output = [];
            if (typeof this.sequence === "undefined") this.sequence = 0;
            this.sequence++;

            const metadata = {};

            // TODO use chunk.contents once exiv2 supports reading from buffer
            // https://github.com/dberesford/exiv2node/issues/21
            const extractMetadataPromise = getImageTags(chunk.path)
                .then((tags) => {
                    metadata.title = stripMetadataFor(tags["Xmp.dc.title"]);
                    gp.util.log(`#${this.sequence} Extracting metadata for ${metadata.title}`);

                    metadata.date = moment(
                        tags["Exif.Photo.DateTimeOriginal"], exifDateTimeFormat
                    );

                    if (tags["Xmp.dc.subject"]) {
                        metadata.tags = tags["Xmp.dc.subject"].split(", ");
                    } else {
                        gp.util.log(gp.util.colors.red("Missing tags (Xmp.dc.subject field)."));
                    }

                    metadata.slug = slug(metadata.title, {lower: true});

                    // Write all metadata exiv2 is able to extract to a json file
                    if (options.debug) {
                        fs.writeFileAsync(
                            path.join("_debug", `${metadata.slug}-tags.json`),
                            JSON.stringify(tags, null, 4)
                        );
                    }

                    metadata.location = {
                        coordinates: dms2dec(
                            tags["Exif.GPSInfo.GPSLatitude"],
                            tags["Exif.GPSInfo.GPSLatitudeRef"],
                            tags["Exif.GPSInfo.GPSLongitude"],
                            tags["Exif.GPSInfo.GPSLongitudeRef"]
                        )
                    };

                    // There may not have data in all location tags
                    metadata.location.name = [
                        tags["Iptc.Application2.SubLocation"],
                        tags["Iptc.Application2.City"],
                        tags["Iptc.Application2.ProvinceState"],
                        tags["Iptc.Application2.CountryName"]
                    ]
                        .filter((tagContent) => tagContent) // if tag contains data
                        .join(", ");

                    // Exif.Photo.UserComment is used for weather reports in METAR format:
                    // https://en.wikipedia.org/wiki/METAR
                    if (tags["Exif.Photo.UserComment"]) {
                        metadata.weather = parseMETAR(
                            stripMetadataFor(tags["Exif.Photo.UserComment"])
                        );
                    }

                    const dimensions = sizeOf(chunk.contents);
                    return metadata.dimensions = [dimensions.width, dimensions.height];
                });

            const extractColorsPromise = paletteWith(chunk.contents) // buffer
                .then((palette) => {
                    // Flag used to desaturate Google Maps
                    metadata.isGrayscale = isGrayscaleWith(palette);

                    const foregroundColor = metadata.isGrayscale ?
                        (palette.LightMuted || palette.Muted).getHex() :
                        (palette.LightVibrant || palette.LightMuted || palette.Vibrant).getHex();
                    // Prefer DarkVibrant over DarkMuted, which looks very similar across media
                    const backgroundColor = metadata.isGrayscale ?
                        (palette.DarkMuted || palette.Muted).getHex() :
                        (palette.DarkVibrant || palette.DarkMuted).getHex();
                    metadata.colors = readableColorsFrom([foregroundColor, backgroundColor]);

                    if (options.debug) {
                        gp.util.log(palette);
                        gp.util.log(metadata.colors)
                    }
                });

            Promise.all([extractMetadataPromise, extractColorsPromise])
                .then(() => {
                    this.output.push(metadata);
                    next();
                })
        },

        function flush(done) {
            if (this.output) {
                // Sort data by date, descending
                this.output.sort((a, b) => b.date - a.date);

                const file = new gp.util.File({
                    path: "data.json",
                    // TODO: merge with site-wide metadata
                    contents: new Buffer(JSON.stringify({photoData: this.output}, null, 4))
                });
                this.push(file);

                gp.util.log(`Processed ${this.output.length} file${this.output.length > 1 ? "s" : ""}.`);

            } else {
                throw new gp.util.PluginError(
                    "_metadata",
                    "No data extracted, likely due to globbing pattern " +
                    "resulted in no files to extract from."
                );
            }
            done();
        }
    );

    return () => {
        gulp.src(taskOptions.glob)
            .pipe(gp.plumber())
            .pipe(extractMetadata)
            .pipe(gulp.dest("app/data"));
    }
};
