import React from "react";

import {connect} from "react-redux";
import {matchMediaQuery, mediaQueries} from "../actions.js"
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

// =================================================================================================

import Grid from "./Grid/Grid.jsx"
function GridSelector(state) {
    // Must access state.reducer as it's combined via combineReducers with routeReducer
    return {
        mediaQuery: state.mediaQuery,
        data: state.gridData
    }
}
const GridConnected = connect(GridSelector)(Grid);

// =================================================================================================

class App extends React.Component {
    static get body() {
        return window.document.body;
    }
    get isInspectingMedia() {
        return !!this.props.params.slug;
    }
    // =============================================================================================
    // Event Handlers
    // =============================================================================================
    handleMediaQueryChange() {
        this.props.dispatch(matchMediaQuery());
    }
    // =============================================================================================
    // Life Cycle Hooks
    // =============================================================================================
    render() {
        App.body.style.overflow = this.isInspectingMedia ? "hidden" : "visible";
        return (
            <div className="c-app-container">
                <ReactCSSTransitionGroup
                    component="div"
                    transitionName="c-detail-fade"
                    transitionAppear={false}
                    transitionEnter={false}
                    transitionLeaveTimeout={250}
                >
                    {this.props.children}
                </ReactCSSTransitionGroup>
                <Header />
                <GridConnected isInspectingMedia={this.isInspectingMedia} />
                <Footer shouldPresentCopyright={true} />
            </div>
        )
    }
    componentDidMount() {
        this._mediaQueryLists = [];
        let mediaQuery;
        for (let key in mediaQueries) {
            mediaQuery = mediaQueries[key];
            // mediaQueries.XS === null because it's the default and doesn't need matching
            if (mediaQuery) {
                mediaQuery.addListener(this.handleMediaQueryChange.bind(this));
                this._mediaQueryLists.push(mediaQuery);
            }
        }

        this.handleMediaQueryChange();
        //this._element.addEventListener("load", this.captureLatestImageLoad.bind(this), true);
    }
}

export default App;
