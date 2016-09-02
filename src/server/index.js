import universalReactAppMiddleware from "./middleware"
import { SERVER_PORT } from "./config"
import generateServer from "./factory"

const app = generateServer()

// Bind our universal react app middleware as the handler for all get requests.
app.get("*", universalReactAppMiddleware)

// Create an http listener for our express app.
const listener = app.listen(SERVER_PORT)

// We export the listener as it will be handy for our development hot reloader.
export default listener
