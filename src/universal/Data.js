import thunk from "redux-thunk"
import createSagaMiddleware from "redux-saga"
import createLogger from "redux-logger"
import ApolloClient, { createNetworkInterface } from "apollo-client"
import { createStore, combineReducers, applyMiddleware, compose } from "redux"

export function emptyReducer(previousState = {}, action) {
  return previousState
}

export function getEnhancers() {
  return []
}

export function getReducers() {
  return {
    test: emptyReducer
  }
}

export function getMiddleware() {
  return [
    thunk,
    createSagaMiddleware(),
    createLogger({
      collapsed: true
    })
  ]
}

export function emptyEnhancer(param) {
  return param
}

const devTools = process.env.TARGET === "client" &&
  process.env.NODE_ENV === "development" &&
  window.devToolsExtension ?
    window.devToolsExtension() : emptyEnhancer

export function getApolloUri() {
  return "http://localhost:9222"
}

export function createApolloClient(headers, initialState)
{
  var client = new ApolloClient({
    ssrMode: true,
    networkInterface: createNetworkInterface({
      uri: getApolloUri(),
      opts: {
        credentials: "same-origin",

        // transfer request headers to networkInterface so that they're accessible to proxy server
        // Addresses this issue: https://github.com/matthew-andrews/isomorphic-fetch/issues/83
        headers: headers
      }
    })
  })

  const rootReducer = combineReducers({
    ...getReducers(),
    apollo: client.reducer()
  })

  const enhancers = compose(
    applyMiddleware(
      client.middleware(),
      ...getMiddleware()
    ),
    ...getEnhancers(),
    devTools
  )

  const store = createStore(
    rootReducer,
    initialState,
    enhancers
  )

  // The following is needed so that we can hot reload our App.
  if (process.env.NODE_ENV === "development" && module.hot) {
    // Enable Webpack hot module replacement for reducers. This is so that we
    // don"t lose all of our current application state during hot reloading.
    /*
    module.hot.accept("./Data", () => {
      const nextRootReducer = require("./Data").default // eslint-disable-line global-require
      store.replaceReducer(nextRootReducer)
    })
    */
  }

  return {
    client,
    store
  }
}
