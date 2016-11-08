import React from "react"
import { render } from "react-dom"
import { BrowserRouter } from "react-router"
import { CodeSplitProvider } from "code-split-component"

import ReactHotLoader from "./ReactHotLoader"
import App from "../demo/components/App"

// Get the DOM Element that will host our React application.
const container = document.querySelector("#app")

function renderApp(AppComponent) {
  render(
    <CodeSplitProvider>
      <ReactHotLoader>
        <BrowserRouter>
          <AppComponent/>
        </BrowserRouter>
      </ReactHotLoader>
    </CodeSplitProvider>,
    container
  )
}

// The following is needed so that we can hot reload our App.
if (process.env.NODE_ENV === "development" && module.hot) {
  // Accept changes to this file for hot reloading.
  module.hot.accept("./index.js")

  // Any changes to our App will cause a hotload re-render.
  module.hot.accept(
    "../demo/components/App",
    () => renderApp(require("../demo/components/App").default)
  )
}

renderApp(App)
