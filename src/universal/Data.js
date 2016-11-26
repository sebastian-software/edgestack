import thunk from "redux-thunk"
import createSagaMiddleware from "redux-saga"
import createLogger from "redux-logger"
import ApolloClient, { createNetworkInterface } from "apollo-client"
import { createStore, combineReducers, applyMiddleware, compose } from "redux"

export function emptyReducer(previousState = {}, action) {
  return previousState
}

export function ssrReducer(previousState = {}, action) {
  return previousState
}

export function getEnhancers() {
  return []
}

export function getReducers() {
  return {
    ssr: ssrReducer
  }
}

export function getMiddlewares() {
  return [
    thunk,
    createSagaMiddleware(),
    createLogger({
      collapsed: true
    })
  ]
}

export function emptyMiddleware(store) {
  return function(next) {
    return function(action) {
      return next(action)
    }
  }
}

export function emptyEnhancer(param) {
  return param
}

const devTools = process.env.TARGET === "client" &&
  process.env.NODE_ENV === "development" &&
  window.devToolsExtension ?
    window.devToolsExtension() : emptyEnhancer

export function createApolloClient(headers, initialState)
{
  const apolloUri = initialState.ssr.apolloUri
  console.log("Creating Apollo Client for URL: ", apolloUri)

  const hasApollo = apolloUri != null
  if (hasApollo) {
    var client = new ApolloClient({
      ssrMode: true,
      networkInterface: createNetworkInterface({
        uri: apolloUri,
        opts: {
          credentials: "same-origin",

          // transfer request headers to networkInterface so that they're accessible to proxy server
          // Addresses this issue: https://github.com/matthew-andrews/isomorphic-fetch/issues/83
          headers: headers
        }
      })
    })
  }

  const rootReducer = combineReducers({
    ...getReducers(),
    apollo: hasApollo ? client.reducer() : emptyReducer
  })

  const enhancers = compose(
    applyMiddleware(
      hasApollo ? client.middleware() : emptyMiddleware,
      ...getMiddlewares()
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
