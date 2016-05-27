import "./index.scss";

import React from "react";
import ReactDOM from "react-dom";
import Router from "react-router/lib/Router";
import useRouterHistory from "react-router/lib/useRouterHistory";
import createBrowserHistory from "history/lib/createBrowserHistory";
import {MONTH_NAMES} from "./data/constants.js"

import {MediaInspector} from "./components/MediaInspector/MediaInspector.jsx";
import MediaAndAccessoryContainer from "./components/MediaInspector/MediaAndAccessoryContainer.jsx";
import Info from "./components/MediaInspector/Info.jsx";
import App from "./components/App.jsx"

import {createStore, applyMiddleware} from "redux";
import thunk from "redux-thunk";
import {Provider, connect} from "react-redux";
import {reducer} from "./reducers.js";
import {fetchGridData, photoDataFromSlugAction, mediaQueries} from "./actions.js"

// =================================================================================================

function MediaInspectorSelector(state) {
    const data = state.photoData;
    return {
        slug: data.slug,
        previousSlug: data.previous.slug,
        nextSlug: data.next.slug,
        foregroundColor: data.colors[0],
        backgroundColor: data.colors[1],
        backgroundImageUri: state.backgroundImageUri,
        shouldPresentMedia: !(state.mediaQuery === mediaQueries.XS)
    };
}
const ConnectedMediaInspector = connect(MediaInspectorSelector)(MediaInspector);

function MediaAndAccessoryContainerSelector(state) {
    const data = state.photoData;
    let results = {};
    if (data) {
        ({
            slug: results.slug,
            title: results.title,
            dimensions: results.dimensions,
            previous: results.previous,
            next: results.next,
            isLandscape: results.isLandscape,
            aspectRatio: results.aspectRatio
        } = data);
        results.foregroundColor = data.colors[0];
        results.backgroundColor = data.colors[1];
    }
    results.didLoadPicturePolyfill = state.didLoadPicturePolyfill;
    return results;
}
const ConnectedMediaAndAccessoryContainer =
    connect(MediaAndAccessoryContainerSelector)(MediaAndAccessoryContainer);

function InfoSelector(state) {
    const data = state.photoData;
    let results = {};
    if (data) {
        const date = new Date(data.date);
        ({
            slug: results.slug,
            title: results.title,
            location: results.location,
            tags: results.tags,
            weatherSummary: results.weather
        } = data);
        results.month = MONTH_NAMES[date.getMonth()];
        results.year = date.getFullYear();
        results.foregroundColor = data.colors[0];
        results.backgroundColor = data.colors[1];
    }
    return results;
}
const ConnectedInfo = connect(InfoSelector)(Info);

// =================================================================================================

// Don't listen to store by not specifying a selector; only inject dispatch
const ConnectedApp = connect()(App);

// =================================================================================================

// Create & sync Redux store
// TODO: inject initialState here instead of in reducers.js
const store = createStore(reducer, applyMiddleware(thunk));

const routeConfig = [{
    path: "/",
    component: ConnectedApp,
    onEnter: function () {
        if (!store.getState().gridData) {
            store.dispatch(fetchGridData());
        }
    },
    childRoutes: [{
        path: ":slug",
        component: ConnectedMediaInspector,
        onEnter: function (nextState) {
            const photoData = store.getState().photoData;
            if (!photoData || photoData.slug !== nextState.params.slug) {
                store.dispatch(photoDataFromSlugAction(nextState.params.slug));
            }
        },
        indexRoute: {
            component: ConnectedMediaAndAccessoryContainer
        },
        childRoutes: [{
            path: "info",
            component: ConnectedInfo
        }]
    }]
}];

// Create custom history with supports for basename / base href
// instead of using react-router/lib/browserHistory
const history = useRouterHistory(createBrowserHistory)();
ReactDOM.render(
    <Provider store={store}>
        <Router history={history} routes={routeConfig} />
    </Provider>,
    document.getElementById("app-root")
);
