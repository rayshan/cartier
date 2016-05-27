import React from "react";

import Static from "./Static.jsx";
import {LINK_DATA} from "../data/constants.js"

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
                <h1>Ray Shan</h1>
                <hr />
                <nav>{Header.navItems}</nav>
            </header>
        );
    }
}

export default Header;
