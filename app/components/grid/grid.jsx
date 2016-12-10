import React from "react";

import debounce from "lodash.debounce";
import {mediaQueries} from "actions.js"
import GridItem from "./GridItem.jsx"
import {COLUMN_WIDTH_NARROW, COLUMN_WIDTH_WIDE} from "data/constants.js";
import Combokeys from "combokeys";
import pause from "combokeys/plugins/pause";

import "./Grid.scss";

// =================================================================================================

class Grid extends React.Component {
    get columnWidth() {
        return this.props.mediaQuery === mediaQueries.LG ? COLUMN_WIDTH_WIDE: COLUMN_WIDTH_NARROW;
    }
    get isScreenXs() {
        return this.props.mediaQuery === mediaQueries.XS;
    }
    get shouldRenderAccessories() {
        return this.props.mediaQuery === mediaQueries.MD ||
            this.props.mediaQuery === mediaQueries.LG;
    }
    // get isLatestPercentageWidth() {
    //     return !(this.props.mediaQuery === mediaQueries.MD) &&
    //         !(this.props.mediaQuery === mediaQueries.LG);
    // }
    get gridItems() {
        return this.props.data.map((datum, i) => {
            const width = datum.dimensions[0],
                height = datum.dimensions[1],
                isLandscape = width > height,
                isActive = this.state.hoveredImageIndex === i,
                props = {
                    foregroundColor: datum.colors[0],
                    backgroundColor: datum.colors[1],
                    uri: datum.slug + (this.isScreenXs ? "/info" : ""),
                    key: i,
                    shouldRenderAccessories: this.shouldRenderAccessories,
                    isPercentageWidth: this.isScreenXs,
                    columnWidth: this.columnWidth,
                    slug: datum.slug,
                    title: datum.title,
                    aspectRatio: width / height,
                    // Necessary to set c-landscape class, which styles c-reflection differently
                    isLandscape,
                    isActive
                };

            // Delegate grid items' event handling to parent grid
            if (props.shouldRenderAccessories) {
                props.onMouseEnter = !isActive ?
                    this.handleMouseEnterAtIndex.bind(this, i) : undefined;
                props.onMouseLeave = isActive ?
                    this.handleMouseLeave.bind(this) : undefined;
            }

            // return isLatest ? <LatestGridItem {...props} /> : <GridItem {...props} />;
            return <GridItem {...props} />;
        });
    }
    get gridItemElements() {
        if (!this._gridItemElements) {
            this._gridItemElements =
                document.getElementsByClassName(GridItem.defaultProps.className);
        }
        return this._gridItemElements;
    }
    get className() {
        return "c-grid" +
            (this.props.isInspectingMedia ? "" : " c-is-active") +
            (this.state.hoveredImageIndex !== null ? " c-dim" : "");
    }
    initKeyManager() {
        this.keyManager = pause(new Combokeys(document.documentElement));
        this.keyManager.bind(["left", "h", "k"], () => {
            if (document.activeElement &&
                document.activeElement instanceof HTMLAnchorElement &&
                document.activeElement.classList.contains(GridItem.defaultProps.className)) {
                if (document.activeElement.previousSibling) {
                    document.activeElement.previousSibling.focus();
                } else {
                    this.gridItemElements[this.gridItemElements.length - 1].focus();
                }
            } else {
                this.gridItemElements[0].focus();
            }
        });
        this.keyManager.bind(["right", "l", "j"], () => {
            if (document.activeElement &&
                document.activeElement instanceof HTMLAnchorElement &&
                document.activeElement.classList.contains(GridItem.defaultProps.className) &&
                document.activeElement.nextSibling) {
                document.activeElement.nextSibling.focus();
            } else {
                this.gridItemElements[0].focus();
            }
        });
    }
    // =============================================================================================
    // Event Handlers
    // =============================================================================================
    handleMouseEnterAtIndex(i) {
        this.setState({hoveredImageIndex: i});
    }
    handleMouseLeave() {
        // handleMouseLeave is debounced. By the time it fires, user may be hovering above
        // another image. Need to double check if any GridItem is still :hover.
        if (!document.querySelector(`.${GridItem.defaultProps.className}:hover`)) {
            this.setState({hoveredImageIndex: null});
        }
    }
    // =============================================================================================
    // Life Cycle Hooks
    // =============================================================================================
    constructor() {
        super();
        this.state = {hoveredImageIndex: null};
    }
    componentWillMount() {
        // Debounce here per http://stackoverflow.com/a/24679479/2152076
        this.handleMouseLeave = debounce(this.handleMouseLeave, 350);
    }
    componentDidMount() {
        if (!this.keyManager) this.initKeyManager();
    }
    componentDidUpdate() {
        if (this.props.isInspectingMedia) {
            this.keyManager.pause();
        } else {
            this.keyManager.unpause();
        }
    }
    render() {
        //console.log("mediaQuery = ", mediaQuery);
        //console.log("isPercentageWidth = ", this.isPercentageWidth);

        return (
            <section className={this.className} id="grid">
                {this.gridItems}
            </section>
        );
    }
}

export default Grid;
