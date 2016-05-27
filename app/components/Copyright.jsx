import React from "react";

import {AUTHOR, COPYRIGHT} from "../data/constants.js";

// =================================================================================================

const Copyright = () => {
    return <span className="c-copyright">© {AUTHOR} {COPYRIGHT}</span>;
};

export default Copyright;
