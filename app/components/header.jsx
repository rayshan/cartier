import React from "react";

import Static from "components/StaticComponent.jsx";
import {MASTHEAD, LINK_DATA} from "data/constants.js"

import "./Header.scss";

// =================================================================================================

class Header extends Static {
    static get navItems() {
        return LINK_DATA.map((datum) => {
            return (
                <div className="nav-item" key={datum.label}>
                    <a className="will-fade-on-hover will-stand-out-on-active" href={datum.uri}>
                        {datum.label}
                    </a>
                </div>
            )
        })
    }
    render() {
        return (
            <header>
                <a href={MASTHEAD.LINK}>
                    <h1>{MASTHEAD.TITLE}</h1>
                </a>
                <hr />
                <nav>{Header.navItems}</nav>
            </header>
        );
    }
}

// =================================================================================================

export default Header;
