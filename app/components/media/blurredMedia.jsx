import React from "react";
import stackBlurImage from "./../StackBlur.js";

class BlurredMedia extends React.Component {
    performStackBlur() {
        stackBlurImage(
            this.img,
            this.canvas,
            this.props.blurRadius,
            this.props.width,
            this.props.height
        );
    }
    // =============================================================================================
    // Event Handlers
    // =============================================================================================
    handleLoad(event) {
        if (event) event.stopPropagation();
        this.setState({mediaDidLoad: true});
        this.img.onload = null;
    }
    // =============================================================================================
    // Life Cycle Hooks
    // =============================================================================================
    constructor() {
        super();
        this.state = {mediaDidLoad: false};
        /**
         * @private
         * @type {?HTMLCanvasElement}
         */
        this.canvas = undefined;
    }
    componentDidMount() {
        this.canvas.width = this.props.width;
        this.canvas.height = this.props.height;
        // TODO: detect & use createImageBitmap(), can eliminate handleLoad:
        // https://developers.google.com/web/updates/2016/03/createimagebitmap-in-chrome-50
        this.img = new Image();
        this.img.onload = this.handleLoad.bind(this);
        this.img.src = this.props.imageUri;
    }
    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.width !== this.props.width ||
            nextProps.height !== this.props.height ||
            nextState.mediaDidLoad !== this.state.mediaDidLoad;
    }
    componentDidUpdate() {
        if (this.state.mediaDidLoad) this.performStackBlur();
    }
    render() {
        return <canvas ref={(component) => this.canvas = component}/>;
    }
}

export default BlurredMedia;
