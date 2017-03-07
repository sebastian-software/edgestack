// eslint-disable filenames/match-exported
import React from "react"
import { render } from "react-dom"
import { BrowserRouter, withRouter } from "react-router-dom"
import { ApolloProvider } from "react-apollo"
import reactTreeWalker from "react-tree-walker"
import { IntlProvider } from "react-intl"

import { ensureIntlSupport, ensureReactIntlSupport } from "../common/Intl"

import Root from "../app/Root"
import State from "../app/State"
import messages from "../app/messages/en.json"

import { createReduxStore, createRootReducer } from "../common/State"
import { createApolloClient } from "../common/Apollo"

// Get the DOM Element that will host our React application.
const container = document.querySelector("#app")

let apolloClient
let reduxStore

// FIXME
let currentLocale = "en-US"

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

function getConfirmation(message, callback) {
  console.log("BrowserRouter getConfirmation():", message)
  callback()
}

function renderApp(MyRoot)
{
  var MyRoutedRoot = withRouter(MyRoot)
  var RoutedApolloProvider = withRouter(ApolloProvider)
  var RoutedIntlProvider = withRouter(IntlProvider)

  var WrappedRoot = (
    <BrowserRouter getUserConfirmation={getConfirmation}>
      <RoutedApolloProvider client={apolloClient} store={reduxStore}>
        <RoutedIntlProvider locale={currentLocale} messages={messages}>
          <MyRoutedRoot/>
        </RoutedIntlProvider>
      </RoutedApolloProvider>
    </BrowserRouter>
  )

  /* eslint-disable no-shadow */
  function scanElement(rootElement, context = {}, skipRoot = false)
  {
    const schedule = []

    function visitor(element, instance, context)
    {
      if (rootElement === element && skipRoot) {
        return
      }

      if (instance && instance.fetchData)
      {
        var returnValue = instance.fetchData()
        if (returnValue instanceof Promise)
        {
          schedule.push({
            resolver: returnValue,
            element,
            context
          })
        }
      }
    }

    console.log("Scanning...")
    reactTreeWalker(rootElement, visitor, context)
    console.log("- Scan result: ", schedule.length)

    const nestedPromises = schedule.map(({ resolver, element, context }) =>
      resolver.then(() => scanElement(element, context, true)),
    )

    return nestedPromises.length > 0 ? Promise.all(nestedPromises) : Promise.resolve([])
  }

  scanElement(WrappedRoot).then(() => {
    console.log("FULL SCAN ROOT DONE")
    render(WrappedRoot, container)
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

Promise.all([
  ensureIntlSupport(window.APP_STATE.ssr.locale),
  ensureReactIntlSupport(window.APP_STATE.ssr.language)
]).then((results) => {
  console.log("Localization is ready! Using Polyfill:", results[0])
  initState(State)
  renderApp(Root)
})
