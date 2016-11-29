// eslint-disable filenames/match-exported
import generateServer from "./generateServer"
import generateMiddleware from "./generateMiddleware"
import addFallbackHandler from "./addFallbackHandler"

import App from "../app/App"
import { createApolloClient } from "../app/Data"

export function start()
{
  var ssrData = {
    apolloUri: "http://localhost:9123"
  }

  return new Promise((resolve, reject) =>
  {
    const server = generateServer()

    // Bind our universal react app middleware as the handler for all get requests.
    server.get("*", generateMiddleware(App, createApolloClient, ssrData))

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
