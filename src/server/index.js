// eslint-disable filenames/match-exported
import createExpressServer from "./createExpressServer"
import createUniversalMiddleware from "./createUniversalMiddleware"
import addFallbackHandler from "./addFallbackHandler"

import AppContainer from "../app/AppContainer"

export function start()
{
  var ssrData = {
    apolloUri: "http://localhost:9123"
  }

  return new Promise((resolve, reject) =>
  {
    const server = createExpressServer()

    // Bind our universal react app middleware as the handler for all get requests.
    server.get("*", createUniversalMiddleware({ AppContainer, ssrData }))

    // Add default handling for any remaining errors which are not catched by our middleware
    addFallbackHandler(server)

    // Create an http listener for our express app.
    var listener = server.listen(process.env.SERVER_PORT)
    console.log(`Started React Server (Port: ${process.env.SERVER_PORT})`)
    resolve(listener)
  })
}

// Auto start server
start()
