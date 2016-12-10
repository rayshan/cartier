import React from "react";

// =================================================================================================

export default class StaticComponent extends React.Component {
    shouldComponentUpdate() {
        return false;
    }
}
