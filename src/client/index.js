import React from "react"
import { render } from "react-dom"
import { BrowserRouter } from "react-router"

// This library provides us with the capability to have declerative code
// splitting within our application.
// @see https://github.com/ctrlplusb/code-split-component
import { CodeSplitProvider, rehydrateState } from "code-split-component"

import ReactHotLoader from "./ReactHotLoader"
import App from "../demo/components/App"

// Get the DOM Element that will host our React application.
const container = document.querySelector("#app")

function renderApp(AppComponent) {
  // Firstly we ensure that we rehydrate any code split state provided to us
  // by the server response. This state typically indicates which bundles/chunks
  // need to be registered for our application to render and the React checksum
  // to match the server response.
  // @see https://github.com/ctrlplusb/code-split-component
  rehydrateState().then((codeSplitState) =>
    render(
      <ReactHotLoader>
        <CodeSplitProvider state={codeSplitState}>
          <BrowserRouter>
            <AppComponent/>
          </BrowserRouter>
        </CodeSplitProvider>
      </ReactHotLoader>,
      container
    )
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
