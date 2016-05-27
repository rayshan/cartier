import React from "react";

import Link from "react-router/lib/Link";
import {GUTTER} from "../../data/constants.js";
import {MediaThumbnail} from "../Media/Media.jsx";
import {MediaFrame, MediaReflection} from "../Media/Frame.jsx"

// =================================================================================================

class GridItem extends React.Component {
    get shouldRenderAccessories() {
        return this.props.shouldRenderAccessories && this.state.mediaDidLoad;
    }
    get className() {
        const {isLandscape, isActive} = this.props;
        return this.props.className +
            (isLandscape ? " c-is-landscape" : "") +
            (isActive ? " c-is-active" : "");
    }
    get width() {
        const {isLandscape, isPercentageWidth, columnWidth} = this.props;
        let result;
        if (isPercentageWidth) {
            result = "100%";
        } else {
            const landscapeScaleFactor = isLandscape ? 2 : 1,
                gutterCompensation = isLandscape ? GUTTER : 0,
                width = columnWidth * landscapeScaleFactor + gutterCompensation;
            result = `${width}px`;
        }
        return result;
    }
    get gridItemProps() {
        const {uri, onMouseEnter, onMouseLeave} = this.props;
        const props = {
            to: uri,
            className: this.className
        };
        if (this.state.mediaDidLoad) {
            props.onMouseEnter = onMouseEnter;
            props.onMouseLeave = onMouseLeave;
        }
        return props;
    }
    get mediaProps() {
        const {aspectRatio, foregroundColor, backgroundColor} = this.props;
        return {
            basePrefix: "photos/" + this.props.slug,
            title: this.props.title,
            width: this.width,
            aspectRatio,
            foregroundColor,
            backgroundColor
            // didLoad: this.state.mediaDidLoad,
            // onLoad: !this.state.mediaDidLoad ? this.handleLoad.bind(this) : undefined
        };
    }
    get onLoadAttribute() {
        return {onLoad: !this.state.mediaDidLoad ? this.handleLoad.bind(this) : null};
    }
    get title() {
        const {backgroundColor, title} = this.props;
        return <h2 className="title" style={{color: backgroundColor}}>{title}</h2>;
    }
    // =============================================================================================
    // Event Handlers
    // =============================================================================================
    handleLoad(event) {
        event.stopPropagation();
        this.setState({mediaDidLoad: true});
    }
    // =============================================================================================
    // Life Cycle Hooks
    // =============================================================================================
    constructor() {
        super();
        this.state = {mediaDidLoad: false};
    }
    render() {
        const {backgroundColor, isPercentageWidth} = this.props;
        return (
            <Link {...this.gridItemProps} {...this.onLoadAttribute}>
                <MediaThumbnail {...this.mediaProps} />
                {isPercentageWidth ? this.title : null}
                {this.shouldRenderAccessories ? <MediaReflection /> : null}
                {this.shouldRenderAccessories ? <MediaFrame shadowColor={backgroundColor} /> : null}
            </Link>
        );
    }
}

GridItem.defaultProps = {
    className: "c-grid-item"
};

export default GridItem;
