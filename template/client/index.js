// eslint-disable filenames/match-exported
import React from "react"
import { render } from "react-dom"
import { BrowserRouter } from "react-router-dom"
import { ApolloProvider } from "react-apollo"
import { withAsyncComponents } from "react-async-component"

import Root from "../app/Root"
import State from "../app/State"

// eslint-disable-next-line import/no-unresolved
import { ensureIntlSupport, ensureReactIntlSupport, createApolloClient, createReduxStore, createRootReducer } from "edgestack"

// Get the DOM Element that will host our React application.
const container = document.querySelector("#app")


let apolloClient
let reduxStore

function initState(MyState)
{
  apolloClient = createApolloClient({
    initialState: window.APP_STATE
  })

  reduxStore = createReduxStore({
    reducers: MyState.getReducers(),
    enhancers: MyState.getEnhancers(),
    middlewares: MyState.getMiddlewares(),
    initialState: window.APP_STATE,
    apolloClient
  })
}

function renderApp(MyRoot)
{
  var WrappedRoot = (
    <BrowserRouter>
      <ApolloProvider client={apolloClient} store={reduxStore}>
        <MyRoot/>
      </ApolloProvider>
    </BrowserRouter>
  )

  withAsyncComponents(WrappedRoot).then((result) => {
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
  module.hot.accept("../app/Root", () => {
    console.log("- Hot: Rendering root...")
    renderApp(require("../app/Root").default)
  })

  module.hot.accept("../app/State", () => {
    console.log("- Hot: Updating reducers...")
    const nextState = require("../app/State").default
    const nextReducer = createRootReducer(nextState.getReducers())

    reduxStore.replaceReducer(nextReducer)
  })
}


// console.log("SSR CLIENT DATA: ", window.APP_STATE.ssr)

Promise.all([
  ensureIntlSupport(window.APP_STATE.ssr.locale),
  ensureReactIntlSupport(window.APP_STATE.ssr.language)
]).then((results) => {
  console.log("Localization is ready! Using Polyfill:", results[0])
  initState(State)
  renderApp(Root)
})
