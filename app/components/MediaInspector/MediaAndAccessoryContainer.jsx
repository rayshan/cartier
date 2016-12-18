import React from "react";

import Link from "react-router/lib/Link";
import Static from "components/StaticComponent.jsx";
import {Media} from "components/Media/Media.jsx"

import "./MediaAndAccessoryContainer.scss";

// =================================================================================================

/**
 * SVG based on Google Material Icons
 */
class PaginationLink extends Static {
    get path() {
        return this.props.direction === "previous" ?
            "M30.83 14.83L28 12 16 24l12 12 2.83-2.83L21.66 24z" :
            "M20 12l-2.83 2.83L26.34 24l-9.17 9.17L20 36l12-12z"
    }
    render() {
        const {uri, title, color} = this.props;
        return (
            <Link
                to={uri}
                title={title}
                className={"pagination-link will-stand-out-on-hover " + this.props.direction}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    style={{fill: color}}
                    className="pagination-link-symbol"
                >
                    <path d={this.path} />
                    <path d="M0 0h48v48H0z" fill="none" />
                </svg>
            </Link>
        )
    }
}

class MediaAndAccessoryContainer extends React.Component {
    get mediaProps() {
        // TODO: recalculate shouldRestrictHeight upon resize; not a priority as user is unlikely
        // to resize viewport while looking at an image, and if they do, they're unlikely to remain
        // on an image for a long period of time. When they move on to the next image, this will be
        // recalculated according to new viewport size.
        const {aspectRatio, backgroundColor, foregroundColor, isLandscape} = this.props,
            shouldRestrictWidth = window.innerWidth * 0.9 < window.innerHeight * 0.85 * aspectRatio;
        return {
            id: "full-screen-media",
            basePrefix: "photos/" + this.props.slug,
            title: this.props.title,
            isLandscape,
            width: shouldRestrictWidth ? "90vw" : `${Math.floor(85 * aspectRatio)}vh`,
            height: !shouldRestrictWidth ? "85vh" : `${Math.floor(90 / aspectRatio)}vw`,
            foregroundColor,
            backgroundColor
        };
    }
    get style() {
        return {
            color: this.props.foregroundColor
        };
    }
    // =============================================================================================
    // Life Cycle Hooks
    // =============================================================================================
    /**
     * This instance should not re-render when there's no slug while going back to grid,
     * or when slug changes - it doesn't need to render a new slug as router
     * will create a new instance to render the new slug
     */
    shouldComponentUpdate(nextProps) {
        return nextProps.slug !== this.props.slug;
    }
    render() {
        const {slug, title, foregroundColor} = this.props;
        return (
            <section className="media-and-accessory-container" style={this.style}>
                {/* This wrapper is necessary to position accessories relative to it;
                    cannot make accessories relative to media-and-accessory-container as it's
                    relative positioned to allow build in / out animation and relative positioning
                    stretches it to full size of viewport. */}
                <div className="content-container">
                    <Link to={`/${slug}/info`}>
                        <Media
                            ref={(component) => this.media = component}
                            {...this.mediaProps}
                        />
                        <h1 className="title will-fade-on-hover will-stand-out-on-active">{title}</h1>
                    </Link>
                    <PaginationLink
                        direction="previous"
                        uri={`/${this.props.previous.slug}`}
                        title={this.props.previous.title}
                        color={foregroundColor}
                    />
                    <PaginationLink
                        direction="next"
                        uri={`/${this.props.next.slug}`}
                        title={this.props.next.title}
                        color={foregroundColor}
                    />
                </div>
            </section>
        );
    }
}

export default MediaAndAccessoryContainer;
