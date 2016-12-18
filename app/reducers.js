// Redux reducers

import * as actions from "./actions.js"

// =================================================================================================

const initialState = {
    mediaQuery: actions.matchMediaQuery().mediaQuery
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case actions.MATCH_MEDIA_QUERY:
            return Object.assign({}, state, {
                mediaQuery: action.mediaQuery
            });

        case actions.FETCH_GRID_DATA:
            return Object.assign({}, state, {
                gridData: action.data
            });

        case actions.FETCH_PHOTO_DATA:
            return Object.assign({}, state, {
                photoData: action.data
            });

        case actions.SET_BACKGROUND_IMAGE_URI:
            return Object.assign({}, state, {
                backgroundImageUri: action.backgroundImageUri
            });

        default:
            return state;
    }
}

