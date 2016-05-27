import React from "react";

import Copyright from "../Copyright.jsx";
import {Media} from "./../Media/Media.jsx"
import Static from "./../Static.jsx";
import {KT_TO_KPH} from "../../data/constants.js";

// =================================================================================================

/**
 * For figcaption link - no official Google Image Search API; manually constructing the URI
 * @see http://stackoverflow.com/a/21530368/2152076
 */
class Map extends Static {
    /**
     * Maps are hardcoded to have GOLDEN_RATIO as aspectRatio; see gulp task in map.js
     */
    get mediaProps() {
        return {
            id: "full-screen-media",
            basePrefix: `maps/${this.props.slug}-location-map`,
            title: this.props.title,
            isLandscape: true,
            suffix: "png"
        };
    }
    render() {
        const {mapUri, locationName} = this.props;
        return (
            <figure className="c-map">
                <a
                    href={mapUri}
                    target="_blank"
                    title="Open in Google Maps"
                >
                    <Media
                        ref={(component) => this.media = component}
                        {...this.mediaProps}
                    />
                </a>
                <figcaption>
                    <a
                        href={`https://www.google.com/search?q=${locationName}&tbm=isch`}
                        target="_blank"
                        title="Search for more images"
                        className="will-fade-on-hover will-stand-out-on-active"
                    >
                        {locationName}
                    </a>
                </figcaption>
            </figure>
        );
        // <img
        //     src={`maps/${slug}-location-map@1x.png`}
        //     alt={slug}
        //     className="will-dim-on-active"
        // />
    }
}

const Tags = ({data, backgroundColor}) => {
    const elements = data.map(
        (datum, i) => (
            <span
                className="c-label"
                key={i}
                style={{backgroundColor: backgroundColor}}
            >
                {datum}
            </span>
        )
    );
    return <div>{elements}</div>
};

const Weather = ({temperature, windSpeed, windDirection, summary}) => {
    /**
     * METAR wind direction is the direction from which wind originates. E.g. 160 is SSE wind.
     * Subtracting 180° to flip unicode arrow symbol around.
     * Subtracting 90° due to unicode arrow symbol pointing east by default.
     */
    const _wind = windSpeed ?
        <span>
            {` ・ ${Math.round(windSpeed * KT_TO_KPH)} km/h `}
            <span
                className="wind-symbol"
                style={{transform: `rotate(${windDirection - 180 - 90}deg)`}}
            >➤</span>
        </span> : null;
    const _temperature = temperature ? `${temperature} ℃` : null,
        _summary = summary ? ` ・ ${summary}` : null;
    return <div>{_temperature}{_wind}{_summary}</div>;
};

class Info extends React.Component {
    get mapProps() {
        return {
            mapUri: "https://maps.google.com/?q=" +
                `${this.props.location.coordinates[0]},${this.props.location.coordinates[1]}`,
            slug: this.props.slug,
            locationName: this.props.location.name
        }
    }
    get style() {
        return {
            color: this.props.foregroundColor
        };
    }
    // =============================================================================================
    // Life Cycle Hooks
    // =============================================================================================
    shouldComponentUpdate(nextProps) {
        return nextProps.slug ? true : false;
    }
    render() {
        const {title, month, year, tags, backgroundColor} = this.props;
        return (
            <section id="media-inspector-info" style={this.style}>
                <h1 className="title">{title}</h1>
                <Map {...this.mapProps} />
                <div className="c-metadata">
                    <span>{month} {year}</span>
                    <Weather {...this.props.weather} />
                    <Tags data={tags} backgroundColor={backgroundColor} />
                    <Copyright />
                </div>
            </section>
        )
    }
}

Info.defaultProps = {
    location: {coordinates: []},
    tags: []
};

export default Info;
