// eslint-disable filenames/match-exported
import createExpressServer from "./createExpressServer"
import createUniversalMiddleware from "./createUniversalMiddleware"
import addFallbackHandler from "./addFallbackHandler"
import { enableEnhancedStackTraces } from "./debug"

import Root from "../app/Root"
import State from "../app/State"
import Config from "../app/Config.yml"

/* eslint-disable no-console */
export function start()
{
  var ssrData = {
    apolloUri: "http://localhost:9123",
    defaultLocale: Config.DEFAULT_LOCALE
  }

  const server = createExpressServer()

  // Bind our universal react app middleware as the handler for all get requests.
  server.get("*", createUniversalMiddleware({ Root, State, ssrData }))

  // Add default handling for any remaining requests which are not catched by our middleware
  addFallbackHandler(server)

  // Start listening
  server.listen(process.env.SERVER_PORT)

  console.log(`Started React Server (Port: ${process.env.SERVER_PORT})`)
}

// We want improved stack traces for NodeJS in both development and production
enableEnhancedStackTraces()

// Auto start server
start()
