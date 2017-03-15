// eslint-disable filenames/match-exported
import {
  createExpressServer,
  createUniversalMiddleware,
  addFallbackHandler,
  enableEnhancedStackTraces
} from "../server"

import Root from "../app/Root"
import State from "../app/State"
import Config from "../app/Config.yml"


/*
==================================================================
  SERVER :: APPLICATION BOOTING SEQUENCE
==================================================================
*/

// We want improved stack traces for NodeJS in both development and production
enableEnhancedStackTraces()

// Data to move from server to client
var ssrData = {
  apolloUri: "http://localhost:9123",
  defaultLocale: Config.DEFAULT_LOCALE
}

// Create express server instance
const server = createExpressServer(Config)

// Bind our universal middleware as the handler for all get requests.
server.get("*", createUniversalMiddleware({ Root, State, ssrData }))

// Add default handling for any remaining requests which are not catched by our middleware
addFallbackHandler(server)

// Start listening
server.listen(process.env.SERVER_PORT)
