import {
  createExpressServer,
  createUniversalMiddleware,
  addFallbackHandler,
  enableEnhancedStackTraces
} from "edgestack"

import Root from "../Root"
import State from "../State"
import Config from "../Config.yml"


/*
==================================================================
  SERVER :: APPLICATION BOOTING SEQUENCE
==================================================================
*/

// We want improved stack traces for NodeJS in both development and production
enableEnhancedStackTraces()

// Data to move from server to client
var ssrData = {
  apolloUri: null,
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
