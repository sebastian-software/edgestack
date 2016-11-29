// This file is just for exporting infrastructure to applications built upon this.
import * as ServerConfig from "./server/config"
export { ServerConfig }

export { default as generateServer } from "./server/generateServer"
export { default as addFallbackHandler } from "./server/addFallbackHandler"
export { default as generateMiddleware } from "./server/generateMiddleware"
export { default as renderPage } from "./server/renderPage"
