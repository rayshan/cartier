import React from "react";

import Link from "react-router/lib/Link";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import {
    cDetailMainLeave,
    cDetailInfoLeave,
    cDetailMainAppear,
    cDetailInfoAppear,
    cDetailMainEnter,
    cDetailInfoEnter
} from "data/constants.js";
import BlurredMedia from "../Media/BlurredMedia.jsx";
import debounce from "lodash.debounce";
import Combokeys from "combokeys";
import screenfull from "screenfull";
import Nav from "./Nav.jsx";
import Footer from "../Footer.jsx";

import "./MediaInspector.scss";

// =================================================================================================

class Background extends React.Component {
    get mediaProps() {
        const {imageUri, width, height} = this.props;
        return {
            blurRadius: 24,
            imageUri,
            width,
            height
        };
    }
    render() {
        return (
            <Link to={this.props.linkUri} className="c-detail-background">
                <BlurredMedia {...this.mediaProps} />
            </Link>
        );
    }
}

export class MediaInspector extends React.Component {
    get basePath() {
        return `photos/${this.props.slug}`;
    }
    get isPresentingInfo() {
        return this.props.location.pathname.endsWith("/info");
    }
    get backgroundLinkUri() {
        return (this.isPresentingInfo && this.props.shouldPresentMedia) ?
            `/${this.props.slug}` : "/";
    }
    get backgroundImageUri() {
        const extension = window.chrome ? "webp" : "jpeg";
        // Use 1x due to resolution not being important after blur & enlargement
        return `${this.basePath}@1x.${extension}`;
    }
    get backgroundProps() {
        return {
            linkUri: this.backgroundLinkUri,
            imageUri: this.backgroundImageUri,
            width: this.state.width,
            height: this.state.height,
            key: this.props.slug
        };
    }
    static get backgroundTransitionProps() {
        return {
            // This wrapper div should be removed after this is resolved:
            // https://github.com/facebook/react/pull/5408
            component: "div",
            //className: "c-detail-content-wrapper",
            transitionName: "c-detail-background-fade",
            transitionAppear: true,
            transitionAppearTimeout: 1000,
            transitionEnterTimeout: 1000,
            transitionLeaveTimeout: 1000
        };
    }
    get childrenTransitionProps() {
        const {isPresentingInfo} = this.props;
        const appearTimeout = isPresentingInfo ? cDetailInfoAppear : cDetailMainAppear,
            enterTimeout = isPresentingInfo ? cDetailInfoEnter : cDetailMainEnter,
            leaveTimeout = isPresentingInfo ? cDetailInfoLeave : cDetailMainLeave;
        return {
            // This wrapper div should be removed after this is resolved:
            // https://github.com/facebook/react/pull/5408
            component: "div",
            //className: "c-detail-content-wrapper",
            transitionName: this.isPresentingInfo ? "detail-info" : "detail-main",
            transitionAppear: true,
            transitionAppearTimeout: appearTimeout,
            transitionEnterTimeout: enterTimeout,
            transitionLeaveTimeout: leaveTimeout
        };
    }
    get style() {
        return {
            backgroundColor: this.props.backgroundColor
        };
    }
    get infoUri() {
        return `/${this.props.slug}/info`;
    }
    get navData() {
        const cDetailMainNavData = !this.isPresentingInfo ? [
            {label: "INFO", uri: this.infoUri},
            {label: "FULLSCREEN", className: "full-screen-button"}
        ] : [];
        return [
            {label: this.isPresentingInfo ? "DISMISS" : "PHOTOGRAPHY", uri: this.backgroundLinkUri},
            ...cDetailMainNavData
        ]
    }
    static toggleFullScreen() {
        if (screenfull.enabled) {
            // Easier than reaching into children via ref and getting img element
            screenfull.toggle(document.getElementById("full-screen-media"));
        }
    }
    /**
     * Trying to do all key management for children in MediaInspector so we don't have to create
     * and destroy keyManagers over and over as user stays in MediaInspector and navigates around.
     */
    initKeyManager() {
        this.keyManager = new Combokeys(document.documentElement);
        this.keyManager.bind(["esc"], () => this.context.router.push(this.backgroundLinkUri));
        this.keyManager.bind(["f"], () => !this.isPresentingInfo && MediaInspector.toggleFullScreen());
        this.keyManager.bind(["i"], () => {
            const destination = this.isPresentingInfo ? this.backgroundLinkUri : this.infoUri;
            this.context.router.push(destination);
        });
        this.keyManager.bind(["left", "h", "k"], () => {
            if (!this.isPresentingInfo) this.context.router.push(this.props.previousSlug);
        });
        this.keyManager.bind(["right", "l", "j"], () => {
            if (!this.isPresentingInfo) this.context.router.push(this.props.nextSlug);
        });
    }
    // =============================================================================================
    // Event Handlers
    // =============================================================================================
    _handleResize(event) {
        event.stopPropagation();
        this.setState({
            width: Math.ceil(window.innerWidth / 4),
            height: Math.ceil(window.innerHeight / 4)
        });
    }
    get handleResize() {
        if (!this.__handleResize) {
            this.__handleResize = debounce(this._handleResize.bind(this), 128);
        }
        return this.__handleResize;
    }
    // =============================================================================================
    // Life Cycle Hooks
    // =============================================================================================
    constructor() {
        super();
        this.state = {width: null, height: null};
    }
    /**
     * Container's offsetWidth causes reflow and may interfere with other component's rendering
     */
    componentDidMount() {
        this.setState({
            width: Math.ceil(window.innerWidth / 4),
            height: Math.ceil(window.innerHeight / 4)
        });
        window.addEventListener("resize", this.handleResize);
        this.initKeyManager();
    }
    /**
     * When exiting detail view, this component receives a blank slug due to path being "/".
     * We don't need to re-render, just need to let parent transition this component out.
     */
    shouldComponentUpdate(nextProps, nextState) {
        return !!(nextProps.slug) ||
            nextState.width !== this.state.width ||
            nextState.height !== this.state.height;
    }
    componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize);
        this.keyManager.detach();
    }
    render() {
        const key = this.props.slug + this.isPresentingInfo;
        // TODO: use dialog element instead of section when dialog element is widely supported
        return (
            <section className="media-inspector" style={this.style}>
                <ReactCSSTransitionGroup {...MediaInspector.backgroundTransitionProps}>
                    <Background {...this.backgroundProps} />
                </ReactCSSTransitionGroup>

                <Nav navData={this.navData} color={this.props.foregroundColor} />

                <ReactCSSTransitionGroup {...this.childrenTransitionProps}>
                    {React.cloneElement(this.props.children, {key: key})}
                </ReactCSSTransitionGroup>

                <Footer
                    isLessProminent={true}
                    foregroundColor={this.props.foregroundColor}
                    shouldPresentCopyright={false}
                />
            </section>
        );
    }
}

MediaInspector.contextTypes = {
    router: React.PropTypes.object.isRequired
};
