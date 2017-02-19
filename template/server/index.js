// eslint-disable filenames/match-exported
import { createExpressServer, createUniversalMiddleware, addFallbackHandler } from "advanced-boilerplate"

import Root from "../app/Root"
import State from "../app/State"
import Config from "../app/Config.yml"

export function start()
{
  var ssrData = {
    apolloUri: "http://localhost:9123",
    defaultLocale: Config.DEFAULT_LOCALE
  }

  return new Promise((resolve, reject) =>
  {
    const server = createExpressServer()

    // Bind our universal react app middleware as the handler for all get requests.
    server.get("*", createUniversalMiddleware({ Root, State, ssrData }))

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
