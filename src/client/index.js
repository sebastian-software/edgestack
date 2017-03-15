// eslint-disable filenames/match-exported

// import { ensureIntlSupport, ensureReactIntlSupport } from "../common/Intl"
// import { createReduxStore, createRootReducer } from "../common/State"
// import { createApolloClient } from "../common/Apollo"

import {
  ensureIntlSupport, ensureReactIntlSupport,
  createReduxStore, createRootReducer,
  createApolloClient,
  renderApp
} from "../client"

// import renderApp from "./renderApp"

import Root from "../app/Root"
import State from "../app/State"



/*
==================================================================
  CLIENT :: APPLICATION ENTRY POINT
==================================================================
*/

let apolloClient
let reduxStore

Promise.all([
  ensureIntlSupport(window.APP_STATE.ssr.locale),
  ensureReactIntlSupport(window.APP_STATE.ssr.language)
])
  .then((results) =>
  {
    apolloClient = createApolloClient({
      initialState: window.APP_STATE
    })

    reduxStore = createReduxStore({
      reducers: State.getReducers(),
      enhancers: State.getEnhancers(),
      middlewares: State.getMiddlewares(),
      initialState: window.APP_STATE,
      apolloClient
    })

    renderApp(Root, { apolloClient, reduxStore })
  })



/*
==================================================================
  CLIENT :: APPLICATION HOT LOADING
==================================================================
*/

// The following is needed so that we can hot reload our App.
if (process.env.NODE_ENV === "development" && module.hot)
{
  // Accept changes to this file for hot reloading.
  module.hot.accept("./index")

  // Any changes to our App will cause a hotload re-render.
  module.hot.accept("../app/Root", () =>
  {
    const nextRoot = require("../app/Root").default
    renderApp(nextRoot, { apolloClient, reduxStore })
  })

  module.hot.accept("../app/State", () =>
  {
    const nextState = require("../app/State").default
    const nextRootReducer = createRootReducer(nextState.getReducers())

    reduxStore.replaceReducer(nextRootReducer)
  })
}
