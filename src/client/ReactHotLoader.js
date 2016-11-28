import React from "react"

// Having this contained within an if statement like this allows webpack
// dead code elimination to take place. It's the small things. :)
var HotLoaderContainer
if (process.env.NODE_ENV === "development") {
  HotLoaderContainer = require("react-hot-loader").AppContainer
} else {
  HotLoaderContainer = function({ children }) {
    return React.Children.only(children)
  }
}

export default HotLoaderContainer
