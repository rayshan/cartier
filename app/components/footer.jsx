import React from "react";

import darkLogoPath from "../media/cartier-logo.min.svg";
import lightLogoPath from "../media/cartier-logo-white.min.svg";
import {MASTHEAD} from "../data/constants.js";
import Copyright from "./Copyright.jsx";

// =================================================================================================

class Footer extends React.Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.foregroundColor !== this.props.foregroundColor;
    }
    get style() {
        return {
            color: this.props.foregroundColor
        }
    }
    get logoPath() {
        return this.props.foregroundColor ? lightLogoPath : darkLogoPath;
    }
    get linkClassName() {
        return (this.props.isLessProminent ? "will-stand-out-on-hover" : "will-fade-on-hover") +
                " will-stand-out-on-active"
    }
    render() {
        return (
            <footer style={this.style}>
                {this.props.shouldPresentCopyright ? <Copyright /> : null}

                <a href="https://github.com/rayshan/cartier"
                   title={MASTHEAD}
                   target="_blank"
                   className={this.linkClassName}
                >
                    Exhibition by
                    <img className="c-logo" src={this.logoPath} alt="Cartier Logo" />
                </a>
            </footer>
        );
    }
}

export default Footer;
