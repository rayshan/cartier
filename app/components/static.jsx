import React from "react";

// =================================================================================================

export default class Static extends React.Component {
    shouldComponentUpdate() {
        return false;
    }
}
