/* eslint-disable filenames/match-exported */
import { generateMiddleware } from "./middleware"
import { generateServer, addFallbackHandler } from "./factory"
import App from "../demo/components/App"

const server = generateServer()

// Bind our universal react app middleware as the handler for all get requests.
server.get("*", generateMiddleware(App))

// Add default handling for any remaining errors which are not catched by our middleware
addFallbackHandler(server)

// Create an http listener for our express app.
const listener = server.listen(process.env.SERVER_PORT)

// We export the listener as it will be handy for our development hot reloader.
export default listener
