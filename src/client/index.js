// eslint-disable filenames/match-exported
import React from "react"
import { render } from "react-dom"
import { BrowserRouter, withRouter } from "react-router-dom"
import { ApolloProvider } from "react-apollo"
import reactTreeWalker from "react-tree-walker"

import { ensureIntlSupport, ensureReactIntlSupport } from "../common/Intl"
import RouterConnector from "../common/RouterConnector"

import Root from "../app/Root"
import State from "../app/State"

import { createReduxStore, createRootReducer } from "../common/State"
import { createApolloClient } from "../common/Apollo"

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

function getConfirmation(message, callback) {
  console.log("BrowserRouter getConfirmation():", message)
  callback()
}

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

  reactTreeWalker(rootElement, visitor, context)

  const nestedPromises = schedule.map(({ resolver, element, context }) =>
    resolver.then(() => scanElement(element, context, true)),
  )

  return nestedPromises.length > 0 ? Promise.all(nestedPromises) : Promise.resolve([])
}

function renderApp(MyRoot)
{
  var MyRoutedRoot = withRouter(MyRoot)

  var WrappedRoot = (
    <BrowserRouter getUserConfirmation={getConfirmation}>
      <ApolloProvider client={apolloClient} store={reduxStore}>
        <RouterConnector>
          <MyRoutedRoot/>
        </RouterConnector>
      </ApolloProvider>
    </BrowserRouter>
  )

  return scanElement(WrappedRoot).then(() => {
    return render(WrappedRoot, container)
  })
}

// The following is needed so that we can hot reload our App.
if (process.env.NODE_ENV === "development" && module.hot)
{
  // Accept changes to this file for hot reloading.
  module.hot.accept("./index.js")

  // Any changes to our App will cause a hotload re-render.
  module.hot.accept("../app/Root", () => {
    renderApp(require("../app/Root").default)
  })

  module.hot.accept("../app/State", () => {
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
