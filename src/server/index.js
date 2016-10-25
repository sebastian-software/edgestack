import universalMiddleware from "./middleware"
import generateServer from "./factory"

const app = generateServer()

// Bind our universal react app middleware as the handler for all get requests.
app.get("*", universalMiddleware)

// Create an http listener for our express app.
const listener = app.listen(parseInt(process.env.SERVER_PORT, 10))

// We export the listener as it will be handy for our development hot reloader.
export default listener
