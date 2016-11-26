// This file is just for exporting infrastructure to applications built upon this.
import * as ServerConfig from "./server/config"
export { ServerConfig }

export { generateServer, addFallbackHandler } from "./server/factory"
export { generateMiddleware } from "./server/middleware"
export { default as renderPage } from "./server/renderPage"

export { default as ReactHotLoader } from "./client/ReactHotLoader"
