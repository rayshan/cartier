"use strict";

const path = require("path"),
    slug = require("slug"),
    sharp = require("sharp"),
    through = require("through2"),
    constants = require("../app/data/constants.js"),
    Imagemin = require('imagemin'),
    imageminJpegRecompress = require('imagemin-jpeg-recompress'),
    Promise = require("bluebird");

Imagemin.prototype.runAsync = Promise.promisify(Imagemin.prototype.run);

//==========================================================

// 0.9 / 0.85 multipliers are from max width & height in CSS
// as photo doesn't take up the entire screen
const MAX_WIDTH_3X = 2560 * 0.9,
    MAX_HEIGHT_3X = 1440 * 0.85,
    // Generate these sizes for each format
    sizeOptions = [
        // Grid view thumbnail @1x, sized for COLUMN_WIDTH_WIDE
        {
            maxWidth: constants.MAX_DIMENSION_1X,
            maxHeight: constants.MAX_DIMENSION_1X,
            basenameSuffix: "@1x"
        },
        // Grid view thumbnail @2x; grid view latest image @1x
        {
            maxWidth: constants.MAX_DIMENSION_1X * 2, // 461 * 2 = 922
            maxHeight: constants.MAX_DIMENSION_1X * 2,
            basenameSuffix: "@2x"
        },
        // Full size @1x, also used for grid view latest image @2x
        {
            maxWidth: MAX_WIDTH_3X,
            maxHeight: MAX_HEIGHT_3X,
            basenameSuffix: "@3x"
        }
        // TODO: Full size @2x - do we want to provide our IP at such high-resolution?
    ],
    // Generate these formats per photo
    formats = [
        {
            extname: ".jpeg",
            processedMediaBufferPromiseFrom(buffer, maxWidth, maxHeight) {
                return sharp(buffer)
                    .resize(maxWidth, maxHeight, {interpolator: sharp.interpolator.bicubic})
                    .max()
                    .withoutEnlargement()
                    .withMetadata()
                    // output with best quality as we'll recompress with jpeg-archive via Imagemin
                    .quality(100)
                    .withoutChromaSubsampling()
                    .trellisQuantisation()
                    .overshootDeringing()
                    .toBuffer();
            }
        },
        {
            extname: ".webp",
            processedMediaBufferPromiseFrom(buffer, maxWidth, maxHeight) {
                return sharp(buffer)
                    .resize(maxWidth, maxHeight, {interpolator: sharp.interpolator.bicubic})
                    .webp()
                    .max()
                    .withoutEnlargement()
                    .withMetadata()
                    .toBuffer();
            }
        }
    ];

module.exports = (taskOptions, gulp, gp) => {

    /**
     * Flatten array of array of buffers to array of files in vinyl format.
     *
     * @param {buffer[][]} sizeBuffers - For example: [[buffer, buffer...]...]
     * @param namePrefix
     * @returns Promise
     */
    function mediaPromiseFrom(sizeBuffers, namePrefix) {
        const recompressPromises = [];

        sizeBuffers.forEach((formatBuffers, sizeIndex) => {
            formatBuffers.forEach((buffer, formatIndex) => {
                let extname = formats[formatIndex].extname,
                    basename = namePrefix + sizeOptions[sizeIndex].basenameSuffix + extname;

                // .jpeg
                if (formatIndex === 0) {
                    recompressPromises.push(new Imagemin()
                        .src(buffer)
                        .use(imageminJpegRecompress({
                            accurate: true,
                            quality: "high",
                            loops: 3,
                            method: "smallfry",
                            progressive: false,
                            strip: false
                        }))
                        .runAsync()
                        .then((fileArray) => {
                            fileArray[0].path = basename;
                            return fileArray[0];
                        })
                    );
                } else {
                    // .webp
                    recompressPromises.push(Promise.resolve(new gp.util.File({
                        path: basename,
                        contents: buffer
                    })));
                }
            });

        });

        return Promise.all(recompressPromises);
    }

    const processMedia = through.obj(

        function transform(chunk, encoding, next) {
            if (typeof this.sequence === "undefined") this.sequence = 0;
            this.sequence++;
            gp.util.log(`#${this.sequence} Processing ${path.basename(chunk.path)}`);

            // Filename should be title of image;
            // this gulp task doesn't have access to metadata title field.
            const _slug = slug(path.parse(chunk.path).name, {lower: true});

            // Example of end result: array of 3 sizes, each option consisted of array of 2 formats
            const resizePromises = sizeOptions.map((sizeOption) => {
                const formatPromises = formats.map((format) => {
                    return format.processedMediaBufferPromiseFrom(
                        chunk.contents, sizeOption.maxWidth, sizeOption.maxHeight
                    );
                });
                return Promise.all(formatPromises);
            });

            Promise.all(resizePromises)
                .then((sizeBuffers) => {
                    return mediaPromiseFrom(sizeBuffers, _slug)
                        .then((files) => {
                            files.forEach((file) => {this.push(file)});
                        });
                })
                .then(next);
        },

        function flush(done) {
            gp.util.log(`Processed ${this.sequence} file${this.sequence > 1 ? "s" : ""}.`);
            done();
        }
    );

    return () => {
        gulp.src(taskOptions.glob)
            .pipe(gp.plumber())
            .pipe(processMedia)
            .pipe(gulp.dest("build/photos"));
    }
};
