// eslint-disable filenames/match-exported
import React from "react"
import { render } from "react-dom"
import { BrowserRouter, withRouter } from "react-router-dom"
import { ApolloProvider } from "react-apollo"

import { ensureIntlSupport, ensureReactIntlSupport } from "../common/Intl"
import RouterConnector from "../common/RouterConnector"
import { createReduxStore, createRootReducer } from "../common/State"
import { createApolloClient } from "../common/Apollo"
import deepFetch from "../common/deepFetch"

import Root from "../app/Root"
import State from "../app/State"

let apolloClient
let reduxStore

function initState(AppState)
{
  apolloClient = createApolloClient({
    initialState: window.APP_STATE
  })

  reduxStore = createReduxStore({
    reducers: AppState.getReducers(),
    enhancers: AppState.getEnhancers(),
    middlewares: AppState.getMiddlewares(),
    initialState: window.APP_STATE,
    apolloClient
  })
}

function renderApp(AppRoot)
{
  const RoutedAppRoot = withRouter(AppRoot)
  const WrappedRoot = (
    <BrowserRouter>
      <ApolloProvider client={apolloClient} store={reduxStore}>
        <RouterConnector>
          <RoutedAppRoot/>
        </RouterConnector>
      </ApolloProvider>
    </BrowserRouter>
  )

  return deepFetch(WrappedRoot)
    .then(() => render(WrappedRoot, document.getElementById("app")))
}

// The following is needed so that we can hot reload our App.
if (process.env.NODE_ENV === "development" && module.hot)
{
  // Accept changes to this file for hot reloading.
  module.hot.accept("./index.js")

  // Any changes to our App will cause a hotload re-render.
  module.hot.accept("../app/Root", () =>
  {
    const nextRoot = require("../app/Root").default
    renderApp(nextRoot)
  })

  module.hot.accept("../app/State", () =>
  {
    const nextState = require("../app/State").default
    const nextReducer = createRootReducer(nextState.getReducers())

    reduxStore.replaceReducer(nextReducer)
  })
}

Promise.all([
  ensureIntlSupport(window.APP_STATE.ssr.locale),
  ensureReactIntlSupport(window.APP_STATE.ssr.language)
]).then((results) => {
  // console.log("Localization is ready! Using Polyfill:", results[0])
  initState(State)
  renderApp(Root)
})
