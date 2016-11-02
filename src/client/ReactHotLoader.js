/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */

import React from "react"

const ReactHotLoader = process.env.NODE_ENV === "development" ?
  require("react-hot-loader").AppContainer
  // Having this contained within an if statement like this allows webpack
  // dead code elimination to take place. It's the small things. :)
  : ({ children }) => React.Children.only(children)

export default ReactHotLoader
