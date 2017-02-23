/* eslint-disable no-console */
import { createExpressServer, createUniversalMiddleware, addFallbackHandler } from "edgestack"

import Root from "../app/Root"
import State from "../app/State"

export function server()
{
  var ssrData = {
  }

  return new Promise((resolve, reject) =>
  {
    const expressServer = createExpressServer()

    // Bind our universal react app middleware as the handler for all get requests.
    expressServer.get("*", createUniversalMiddleware({ Root, State, ssrData }))

    // Add default handling for any remaining errors which are not catched by our middleware
    addFallbackHandler(expressServer)

    // Create an http listener for our express app.
    var listener = expressServer.listen(process.env.SERVER_PORT)
    console.log(`Started React Server (Port: ${process.env.SERVER_PORT})`)
    resolve(listener)
  })
}

// Auto start server
server()
