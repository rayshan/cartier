import React from "react";

import {CARTIER_DESCRIPTION} from "data/constants.js";
import Copyright from "components/Copyright.jsx";
import darkLogoPath from "media/cartier-logo.min.svg";
import lightLogoPath from "media/cartier-logo-white.min.svg";

import "./Footer.scss";

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
                   title={CARTIER_DESCRIPTION}
                   target="_blank"
                   className={this.linkClassName}
                >
                    Exhibition by
                    <img className="logo" src={this.logoPath} alt="Cartier Logo" />
                </a>
            </footer>
        );
    }
}

export default Footer;
