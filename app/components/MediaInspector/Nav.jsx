import React from "react";
import Link from "react-router/lib/Link";
import {MediaInspector} from "./MediaInspector.jsx"

// =================================================================================================

const Nav = ({navData, color}) => {
    const style = {color: color},
        linkPropsWithClassNameAndIndex = (className, i) => {
            return {
                className:
                    `${className || ""} nav-item will-stand-out-on-hover will-stand-out-on-active`,
                key: i
            };
        },
        navItems = navData.map(({label, uri, className}, i) => uri ? (
            <Link {...linkPropsWithClassNameAndIndex(className, i)} to={uri}>
                {label}
            </Link>
        ) : (
            <span
                {...linkPropsWithClassNameAndIndex(className, i)}
                onClick={label === "FULLSCREEN" ? MediaInspector.toggleFullScreen : null}
            >
                {label}
            </span>
        ));
    return (
        <nav className="nav" style={style}>
            {navItems}
        </nav>
    );
};

export default Nav;
