/* eslint-disable filenames/match-exported */
import { generateMiddleware } from "./middleware"
import { generateServer, addFallbackHandler } from "./factory"
import App from "../demo/components/App"
import ApolloClient, { createNetworkInterface } from "apollo-client"


import { createStore, combineReducers, applyMiddleware, compose } from 'redux';




function createApolloClient(headers, initialState)
{
  var client = new ApolloClient({
    ssrMode: true,
    /*
    networkInterface: createNetworkInterface({
      uri: "localhost:9222",
      opts: {
        credentials: "same-origin",

        // transfer request headers to networkInterface so that they're accessible to proxy server
        // Addresses this issue: https://github.com/matthew-andrews/isomorphic-fetch/issues/83
        headers: headers
      }
    })*/
  })

  const rootReducer = combineReducers({
    // todos: todoReducer,
    // users: userReducer,
    apollo: client.reducer()
  })

  const enhancers = compose(
    applyMiddleware(client.middleware()),
    typeof window !== "undefined" && window.devToolsExtension ? window.devToolsExtension() : (f) => f
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
