import React from "react"
import { render } from "react-dom"
import { BrowserRouter } from "react-router"
import { CodeSplitProvider, rehydrateState } from "code-split-component"
import { ApolloProvider } from "react-apollo"

import { createApolloClient } from "../universal/Data"

import ReactHotLoader from "./ReactHotLoader"
import App from "../demo/App"

// Get the DOM Element that will host our React application.
const container = document.querySelector("#app")

function renderApp(AppComponent)
{
  console.log("Client: Initialize state from server:", window.APP_STATE)
  const apollo = createApolloClient({
    initialState: window.APP_STATE
  })

  console.log("Client: Rehydrating code splitting state...")
  // Firstly we ensure that we rehydrate any code split state provided to us
  // by the server response. This state typically indicates which bundles/chunks
  // need to be registered for our application to render and the React checksum
  // to match the server response.
  // @see https://github.com/ctrlplusb/code-split-component
  rehydrateState().then((codeSplitState) =>
  {
    console.log("Client: Code Splitting State:", codeSplitState ? codeSplitState.length : 0)
    return render(
      <ReactHotLoader>
        <CodeSplitProvider state={codeSplitState}>
          <BrowserRouter>
            <ApolloProvider client={apollo.client} store={apollo.store}>
              <AppComponent/>
            </ApolloProvider>
          </BrowserRouter>
        </CodeSplitProvider>
      </ReactHotLoader>,
      container
    )
  })
}

// The following is needed so that we can hot reload our App.
if (process.env.NODE_ENV === "development" && module.hot) {
  // Accept changes to this file for hot reloading.
  module.hot.accept("./index.js")

  // Any changes to our App will cause a hotload re-render.
  module.hot.accept(
    "../demo/App",
    () => renderApp(require("../demo/App").default)
  )

  // Enable Webpack hot module replacement for reducers. This is so that we
  // don"t lose all of our current application state during hot reloading.
  /*
  module.hot.accept("../universal/reducers", () => {
    const nextRootReducer = require("../universal/reducers").default // eslint-disable-line global-require
    store.replaceReducer(nextRootReducer)
  })
  */
}

renderApp(App)
