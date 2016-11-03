/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */

import React from "react"

// Having this contained within an if statement like this allows webpack
// dead code elimination to take place. It's the small things. :)
var ReactHotLoader
if (process.env.NODE_ENV === "development") {
  ReactHotLoader = require("react-hot-loader").AppContainer
} else {
  ReactHotLoader = function({ children }) {
    React.Children.only(children)
  }
}

export default ReactHotLoader
