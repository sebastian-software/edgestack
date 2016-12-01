import ApolloClient, { createNetworkInterface, createBatchingNetworkInterface } from "apollo-client"
import { createStore, combineReducers, applyMiddleware, compose } from "redux"
import thunk from "redux-thunk"

/**
 *
 *
 */
export function emptyReducer(previousState = {}, action) {
  return previousState
}

/**
 *
 *
 */
export function emptyMiddleware(store) {
  return function(next) {
    return function(action) {
      return next(action)
    }
  }
}

/**
 *
 *
 */
export function emptyEnhancer(param) {
  return param
}


const devTools = process.env.TARGET === "client" &&
  process.env.NODE_ENV === "development" &&
  window.devToolsExtension ?
    window.devToolsExtension() : emptyEnhancer


/**
 *
 *
 */
export function ssrReducer(previousState = {}, action) {
  return previousState
}


/**
 *
 *
 */
export function createReduxStore({ initialState, apolloClient, reducers = {}, middlewares = [], enhancers = [] }) {
  const rootReducer = combineReducers({
    ...reducers,
    ssr: ssrReducer,
    apollo: apolloClient ? apolloClient.reducer() : emptyReducer
  })

  const rootEnhancers = compose(
    applyMiddleware(
      apolloClient ? apolloClient.middleware() : emptyMiddleware,
      thunk,
      ...middlewares
    ),
    ...enhancers,
    devTools
  )

  const store = createStore(
    rootReducer,
    initialState,
    rootEnhancers
  )

  return store
}


/**
 *
 *
 */
export function createApolloClient({ headers, initialState = {}, batchRequests = false, trustNetwork = true })
{
  const apolloUri = initialState.ssr && initialState.ssr.apolloUri
  console.log("Creating Apollo Client for URL: ", apolloUri)

  const hasApollo = apolloUri != null
  if (hasApollo)
  {
    var opts = {
      credentials: trustNetwork ? "include" : "same-origin",

      // transfer request headers to networkInterface so that they're accessible to proxy server
      // Addresses this issue: https://github.com/matthew-andrews/isomorphic-fetch/issues/83
      headers: headers
    }

    if (batchRequests)
    {
      var networkInterface = createBatchingNetworkInterface({
        uri: apolloUri,
        batchInterval: 10,
        opts: opts
      })
    }
    else
    {
      var networkInterface = createNetworkInterface({
        uri: apolloUri,
        opts: opts
      })
    }

    var client = new ApolloClient({
      ssrMode: process.env.TARGET === "server",
      networkInterface: networkInterface
    })
  }
  else
  {
    var client = new ApolloClient()
  }

  return client
}
