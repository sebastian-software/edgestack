/* eslint-disable filenames/match-exported */
import ApolloClient, { createNetworkInterface } from "apollo-client"
import { createStore, combineReducers, applyMiddleware, compose } from "redux"
import thunk from "redux-thunk"
import createSagaMiddleware from "redux-saga"
import createLogger from "redux-logger"

import { generateMiddleware } from "./middleware"
import { generateServer, addFallbackHandler } from "./factory"
import App from "../demo/components/App"

function emptyReducer(previousState = {}, action) {
  return previousState
}

function getEnhancers() {
  return []
}

function getReducers() {
  return {
    test: emptyReducer
  }
}

function getMiddleware() {
  return [
    thunk,
    createSagaMiddleware(),
    createLogger({
      collapsed: true
    })
  ]
}

function emptyEnhancer(param) {
  return param
}

function getApolloUri() {
  return "http://localhost:9222"
}

const devTools = process.env.TARGET === "client" &&
  process.env.NODE_ENV === "development" &&
  window.devToolsExtension ?
    window.devToolsExtension() : emptyEnhancer


function createApolloClient(headers, initialState)
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

  return {
    client,
    store
  }
}

export function start()
{
  return new Promise((resolve, reject) =>
  {
    const server = generateServer()

    // Bind our universal react app middleware as the handler for all get requests.
    server.get("*", generateMiddleware(App, createApolloClient))

    // Add default handling for any remaining errors which are not catched by our middleware
    addFallbackHandler(server)

    // Create an http listener for our express app.
    var listener = server.listen(process.env.SERVER_PORT)
    console.log(`Started Main Server (Port: ${process.env.SERVER_PORT})`)
    resolve(listener)
  })
}

// Auto start server in production
if (process.env.NODE_ENV === "production") {
  start()
}
