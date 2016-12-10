import React from "react";

import Static from "components/StaticComponent.jsx";
import {LINK_DATA, BASE_HREF} from "data/constants.js"
import Link from "react-router/lib/Link";

import "./Header.scss";

// =================================================================================================

const isDebug = process.env.NODE_ENV === "development";

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
                <Link to={isDebug ? "/" : BASE_HREF}>
                    <h1>Ray Shan</h1>
                </Link>
                <hr />
                <nav>{Header.navItems}</nav>
            </header>
        );
    }
}

// =================================================================================================

export default Header;
