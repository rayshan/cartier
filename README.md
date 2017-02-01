![Cartier logo](cartier-logo.png?raw=true "Cartier logo")
===

> Exhibit your best photographs.


## :camera: [DEMO](https://shan.io/photography/) :camera:


## Features

- More focus, less clutter on your best photographs
- Fast load times by using image processing and asset bundling best practices
- Optimized for mobile devices
- Optimized for ultra-high-resolution displays
- Keyboard navigation

**Instructions below are work-in-progress and incomplete**


## Prerequisites

Please install below before proceeding to Quick Start. Examples are given for OS X via [Homebrew](http://brew.sh/):

- [Node.js](https://nodejs.org/) via `brew install node`
- [exiv2](http://exiv2.org/) via `brew install exiv2`
- [libvips](http://www.vips.ecs.soton.ac.uk/) built with `mozjpeg` and `webp`:
    - `brew tap homebrew/science`
    - `brew install vips --with-mozjpeg --with-webp`


## Quick Start

- `git clone` this repo
- `npm install`
- Drop your high-resolution photos into `photos` directory
- `gulp photos` to process your photos and generate `data.json` file that feeds your website
- `npm run prod` to generate your website
- Serve `build` directory locally or upload it to your web host


## Prepare Your Photo

### Metadata

Tagging in Lightroom:

![Tagging in Lightroom](screenshot-metadata-input2.jpg?raw=true "Tagging in Lightroom")

[Tag references](http://www.exiv2.org/metadata.html)

If you use Lightroom, I recommend Jeffrey Friedl's [Metadata Wrangler](http://regex.info/blog/lightroom-goodies/metadata-wrangler) plugin to export exactly what's needed for Cartier.

Result:

![Tagging output](screenshot-metadata-output.png?raw=true "Tagging output")


## Customize

- Modify Property Info section in `app/data/constant.js` for your preferred website title etc.


## Individual Processing Commands

`gulp _metadata` extract metadata from photos and dump into `assets/data.json`

- `--env development` writes each image's full metadata into json files, logs actual colors extracted
- `--glob` process specific files based on the given globbing pattern
    - Default `"./photos/*full*.jpg"`
    - Example of processing an individual photo `"./photos/yellowstone.jpg"`

...

## FAQ

**Why "Cartier"?**

The name pays homage to [Henri Cartier-Bresson](https://en.wikipedia.org/wiki/Henri_Cartier-Bresson).
