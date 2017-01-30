// eslint-disable filenames/match-exported
import React from "react"
import { render } from "react-dom"
import { BrowserRouter } from "react-router"
import { CodeSplitProvider, rehydrateState } from "code-split-component"
import { ApolloProvider } from "react-apollo"

import ReactHotLoader from "./ReactHotLoader"
import AppContainer from "../app/AppContainer"
import { createApolloClient, createReduxStore } from "../common/Data"

// Get the DOM Element that will host our React application.
const container = document.querySelector("#app")

function renderApp(RenderContainer)
{
  console.log("Client: Initialize state from server:", window.APP_STATE)
  const apolloClient = createApolloClient({
    initialState: window.APP_STATE
  })

  const reduxStore = createReduxStore({
    reducers: RenderContainer.getReducers(),
    enhancers: RenderContainer.getEnhancers(),
    middlewares: RenderContainer.getMiddlewares(),
    initialState: window.APP_STATE
  })

  // Firstly we ensure that we rehydrate any code split state provided to us
  // by the server response. This state typically indicates which bundles/chunks
  // need to be registered for our application to render and the React checksum
  // to match the server response.
  // @see https://github.com/ctrlplusb/code-split-component
  console.log("Client: Rehydrating code splitting state...")
  rehydrateState().then((codeSplitState) =>
  {
    console.log("Client: Code Splitting State:", codeSplitState ? codeSplitState.length : 0)
    return render(
      <ReactHotLoader>
        <CodeSplitProvider state={codeSplitState}>
          <BrowserRouter>
            <ApolloProvider client={apolloClient} store={reduxStore}>
              <RenderContainer/>
            </ApolloProvider>
          </BrowserRouter>
        </CodeSplitProvider>
      </ReactHotLoader>,
      container
    )
  })
}

// The following is needed so that we can hot reload our App.
if (process.env.NODE_ENV === "development" && module.hot)
{
  // Accept changes to this file for hot reloading.
  module.hot.accept("./index.js")

  // Any changes to our App will cause a hotload re-render.
  module.hot.accept("../app/AppContainer", () => renderApp(require("../app/AppContainer").default))
}

renderApp(AppContainer)
