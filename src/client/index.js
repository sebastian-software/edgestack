// eslint-disable filenames/match-exported
import React from "react"
import { render } from "react-dom"
import { BrowserRouter } from "react-router-dom"
import { ApolloProvider } from "react-apollo"
import { withAsyncComponents } from "react-async-component"

import AppContainer from "../app/AppContainer"
import AppState from "../app/AppState"
import { createApolloClient, createReduxStore } from "../common/Data"

// Get the DOM Element that will host our React application.
const container = document.querySelector("#app")


let apolloClient
let reduxStore

function initState(MyAppState)
{
  apolloClient = createApolloClient({
    initialState: window.APP_STATE
  })

  reduxStore = createReduxStore({
    reducers: MyAppState.getReducers(),
    enhancers: MyAppState.getEnhancers(),
    middlewares: MyAppState.getMiddlewares(),
    initialState: window.APP_STATE
  })
}

function renderApp(MyAppContainer)
{
  var fullApp = (
    <BrowserRouter>
      <ApolloProvider client={apolloClient} store={reduxStore}>
        <MyAppContainer/>
      </ApolloProvider>
    </BrowserRouter>
  )

  withAsyncComponents(fullApp).then((result) => {
    // The result will include a version of your app that is
    // built to use async components and is automatically
    // rehydrated with the async component state returned by
    // the server.
    const { appWithAsyncComponents } = result
    render(appWithAsyncComponents, container)
  }).catch((error) => {
    console.error("Client: Error wrapping application for code splitting:", error)
  })
}

// The following is needed so that we can hot reload our App.
if (process.env.NODE_ENV === "development" && module.hot)
{
  // Accept changes to this file for hot reloading.
  module.hot.accept("./index.js")

  // Any changes to our App will cause a hotload re-render.
  module.hot.accept("../app/AppContainer", () => {
    renderApp(require("../app/AppContainer").default)
  })

  module.hot.accept("../app/AppState", () => {
    console.log("Made changes on AppState!")
    // renderApp(require("../app/AppContainer").default)
  })
}

initState(AppState)
renderApp(AppContainer)
