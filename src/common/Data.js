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


const composeEnhancers = (process.env.TARGET === "web" &&
  process.env.NODE_ENV === "development" &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose


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

  const rootEnhancers = composeEnhancers(
    applyMiddleware(
      apolloClient ? apolloClient.middleware() : emptyMiddleware,
      process.env.NODE_ENV === "development" ?
        require("redux-immutable-state-invariant")() : emptyMiddleware,
      thunk,
      ...middlewares
    ),
    ...enhancers
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

  const hasApollo = apolloUri != null
  if (hasApollo)
  {
    var opts = {
      credentials: trustNetwork ? "include" : "same-origin",

      // transfer request headers to networkInterface so that they're accessible to proxy server
      // Addresses this issue: https://github.com/matthew-andrews/isomorphic-fetch/issues/83
      headers
    }

    if (batchRequests)
    {
      var networkInterface = createBatchingNetworkInterface({
        uri: apolloUri,
        batchInterval: 10,
        opts
      })
    }
    else
    {
      var networkInterface = createNetworkInterface({
        uri: apolloUri,
        opts
      })
    }

    var client = new ApolloClient({
      ssrMode: process.env.TARGET === "node",
      addTypename: false,
      queryDeduplication: true,
      networkInterface
    })
  }
  else
  {
    var client = new ApolloClient({
      addTypename: false,
      queryDeduplication: true
    })
  }

  return client
}
