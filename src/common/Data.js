import { createStore, combineReducers, applyMiddleware, compose } from "redux"
import thunk from "redux-thunk"
import createLogger from "redux-logger"

import { routerReducer } from "./RouterConnector"

const composeEnhancers = (process.env.TARGET === "web" &&
  process.env.NODE_ENV === "development" &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose


/**
 * Placeholder for a non active reducer in Redux
 */
export function emptyReducer(previousState = {}, action) {
  return previousState
}


/**
 * Placeholder for a non active middleware in Redux
 */
export function emptyMiddleware(store) {
  return function(next) {
    return function(action) {
      return next(action)
    }
  }
}


/**
 * Placeholder for a non active enhancer in Redux
 */
export function emptyEnhancer(param) {
  return param
}


/**
 * Dummy reducer for exporting server-side data to the client-side application
 */
export function ssrReducer(previousState = {}, action) {
  return previousState
}


/**
 * Bundles the given reducers into a root reducer for the application
 */
export function createRootReducer(reducers) {
  return combineReducers({
    ...reducers,
    ssr: ssrReducer,
    router: routerReducer
  })
}


/**
 *
 *
 */
export function createReduxStore({ reducers = {}, middlewares = [], enhancers = [], initialState, apolloClient }) {
  const rootReducer = apolloClient ?
    createRootReducer({ ...reducers, apollo: apolloClient.reducer() }) :
    createRootReducer(reducers)

  const rootEnhancers = composeEnhancers(
    applyMiddleware(
      apolloClient ? apolloClient.middleware() : emptyMiddleware,

      // Redux middleware that spits an error on you when you try to mutate
      // your state either inside a dispatch or between dispatches.
      // https://github.com/leoasis/redux-immutable-state-invariant
      process.env.NODE_ENV === "development" ?
        require("redux-immutable-state-invariant")() : emptyMiddleware,

      // Add automatic state change logging for client application
      process.env.TARGET === "web" ?
        createLogger({ collapsed: true }) : emptyMiddleware,

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
