import React from "react";

import Static from "../StaticComponent.jsx";
import hexRgb from "hex-rgb";

// =================================================================================================

class MediaFrame extends Static {
    get shadow() {
        const color = hexRgb(this.props.shadowColor);
        return (
            // Slight vignette effect on "mat"
            `0 0 16px rgba(${color}, 0.15) inset,` +
            // Below taken from Angular Material, .md-whiteframe-20dp
            // https://material.angularjs.org/latest/demo/whiteframe
            `0 10px 13px -6px rgba(${color}, .2),` +
            `0 20px 31px 3px rgba(${color}, .14),` +
            `0 8px 38px 7px rgba(${color}, .12)`
        );
    }
    render() {
        //let style = this.props.style || {};
        //style.boxShadow = boxShadowFrom(hexRgb(this.props.shadowColor));
        const style = {
            width: this.props.width,
            boxShadow: this.shadow
        };
        return <div className="c-frame" style={style}>{this.props.children}</div>;
    }
}

// =================================================================================================

// CReflection is just a styled rectangle; container needed to set overflow hidden to clip
// CReflection into polygon.
class MediaReflection extends Static {
    render() {
        return (
            <div className="c-frame-reflection-container">
                <div className="c-frame-reflection"></div>
            </div>
        );
    }
}

// =================================================================================================

export {
    MediaFrame,
    MediaReflection
};
