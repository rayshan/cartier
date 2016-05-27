import React from "react";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";

import {MAX_DIMENSION_1X, MAX_PORTRAIT_ASPECT_RATIO} from "../../data/constants.js";

// =================================================================================================

class AbstractMedia extends React.Component {
    get classNameSuffix() {
        return this.state.didLoad ? "c-is-loaded" : "";
    }
    /**
     * @param {number} densityFileNameSuffix - this is not the standard srcset pixel density
     * descriptor as we use media queries to control needed density.
     * @param {('webp'|'jpeg')} format
     */
    srcWith(densityFileNameSuffix, format) {
        return `${this.props.basePrefix}@${densityFileNameSuffix}x.${format}`;
    }
    // =============================================================================================
    // Event Handlers
    // =============================================================================================
    get onLoadAttribute() {
        return {onLoad: !this.state.didLoad ? this.handleLoad.bind(this) : null};
    }
    handleLoad() {
        // Need to bubble up to GridItem
        this.setState({didLoad: true});
    }
    // =============================================================================================
    // Life Cycle Hooks
    // =============================================================================================
    constructor() {
        super();
        this.state = {didLoad: false};
    }
}

class MediaThumbnail extends AbstractMedia {
    get mediaPlaceholderProps() {
        const {width, aspectRatio, backgroundColor, foregroundColor, title} = this.props;
        return {
            width,
            aspectRatio,
            backgroundColor,
            foregroundColor,
            key: title + "-mediaPlaceholder"
        }
    }
    static get mediaPlaceholderTransitionProps() {
        return {
            component: "div",
            // component: FirstChild,
            className: "c-media-placeholder-wrapper",
            transitionName: "c-detail-background-fade",
            // style: {width: this.props.width},
            transitionAppear: false,
            transitionEnter: false,
            transitionLeaveTimeout: 1000
        }
    }
    get mediaPlaceholder() {
        return (
            <ReactCSSTransitionGroup {...MediaThumbnail.mediaPlaceholderTransitionProps}>
                {!this.state.didLoad ?
                    <MediaPlaceholder {...this.mediaPlaceholderProps} /> : null
                }
            </ReactCSSTransitionGroup>
        );
    }
    get style() {
        const {width, aspectRatio} = this.props;
        return {
            width,
            // Media must have height before onload as it needs to take up space for whole grid
            // to be laid out correctly before onload.
            // Cannot rely on MediaLoader's height because MediaLoader is absolutely positioned.
            // Using padding-top, which is relative to width & forces consistent aspect ratio.
            paddingTop: this.state.didLoad ? null : `${100 / aspectRatio}%`
        };
    }
    get media() {
        return (
            <picture className={`c-media-thumbnail ${this.classNameSuffix}`}>
                <source srcSet={this.srcSetFrom("webp")} type="image/webp" />
                <img
                    srcSet={this.srcSetFrom("jpeg")}
                    // Fallback for browsers not supporting srcSet
                    src={this.srcWith(1, "jpeg")}
                    alt={this.props.title}
                    {...this.onLoadAttribute}
                />
            </picture>
        );
    }
    srcSetFrom(format) {
        return `${this.srcWith(1, format)}, ` + `${this.srcWith(2, format)} 2x`;
    }
    /**
     * Media must be outside of ReactCSSTransitionGroup because
     * it needs to be in the DOM with MediaPlaceholder for onLoad to fire
     */
    render() {
        return (
            <div style={this.style} title={this.props.title} className="c-media-wrapper">
                {this.media}
                {this.mediaPlaceholder}
            </div>
        );
    }
}

class Media extends AbstractMedia {
    /**
     * When this media query is matched, we serve the 3x image
     * landscape: 626 * 2 ≈ 922
     * portrait: 626 * 2 / 1.6 ≈ 576
     */
    get mediaQueryList() {
        let minWidth = Math.floor(this.props.isLandscape ?
            MAX_DIMENSION_1X * 2 * 0.9 :
            MAX_DIMENSION_1X * 2 / MAX_PORTRAIT_ASPECT_RATIO
        );
        return `(min-width: ${minWidth}px)`;
    }
    get style() {
        const {foregroundColor, backgroundColor, width, height} = this.props;
        return !this.state.didLoad ? {
            width,
            height,
            background: `linear-gradient(56deg, ${backgroundColor}, ${foregroundColor})`
        } : null;
    }
    get media() {
        // console.log(this.mediaQueryList);
        const densityFileNameSuffixModifier = this.props.suffix === "png" ? 1 : 0;
        return (
            <picture className={`media ${this.classNameSuffix}`} title={this.props.title}>
                {
                    this.props.suffix !== "png" ? <source
                        media={this.mediaQueryList}
                        srcSet={this.srcWith(3 - densityFileNameSuffixModifier, "webp")}
                        type="image/webp"
                    /> : null
                }
                {
                    this.props.suffix !== "png" ? <source
                        srcSet={this.srcWith(2 - densityFileNameSuffixModifier, "webp")}
                        type="image/webp"
                    /> : null
                }
                <source
                    media={this.mediaQueryList}
                    srcSet={this.srcWith(3 - densityFileNameSuffixModifier, this.props.suffix || "jpeg")}
                />
                <img
                    src={this.srcWith(2 - densityFileNameSuffixModifier, this.props.suffix || "jpeg")}
                    alt={this.props.title}
                    ref={(element) => this.img = element}
                    id={this.props.id}
                    className="will-dim-on-active"
                    {...this.onLoadAttribute}
                />
            </picture>
        );
    }
    shouldComponentUpdate(nextProps, nextState) {
        // return false;
        return this.state.didLoad !== nextState.didLoad;
    }
    render() {
        // Container element is necessary for media to have a default size with background color
        // so page doesn't load with accessories bunched up together.
        // Not sure why but picture element couldn't act as the container element;
        // size & background-color don't apply to it.
        return (
            <div style={this.style} title={this.props.title} className="c-media-wrapper">
                {this.media}
            </div>
        );
    }
}

/**
 * Provide either width or aspect ratio via props;
 * if width isn't provided, will use paddingTop to maintain aspect ratio
 */
class MediaPlaceholder extends React.Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.width !== this.props.width;
    }
    render() {
        const {width, height, aspectRatio, foregroundColor, backgroundColor} = this.props;
        const style = {
            width,
            background: `linear-gradient(56deg, ${backgroundColor}, ${foregroundColor})`
        };
        if (height) {
            style.height = height;
        } else {
            style.paddingTop = `${1 / aspectRatio * 100}%`;
        }
        return <div className="c-media-placeholder" style={style} />;
    }
}

// =================================================================================================

export {
    Media,
    MediaThumbnail,
    MediaPlaceholder
};
