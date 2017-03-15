// This file is just for exporting infrastructure to applications built upon this.

// eslint-disable-next-line import/no-namespace
import * as ServerConfig from "./server/config"
export { ServerConfig }

export { default as createExpressServer } from "./server/createExpressServer"
export { default as createUniversalMiddleware } from "./server/createUniversalMiddleware"
export { default as addFallbackHandler } from "./server/addFallbackHandler"
export { default as renderPage } from "./server/renderPage"
export { createReduxStore, createRootReducer, emptyReducer, emptyMiddleware, emptyEnhancer } from "./common/State"
export { createApolloClient } from "./common/Apollo"

export { default as RouterConnector, routerReducer } from "./common/RouterConnector"

export { enableEnhancedStackTraces, logError } from "./server/debug"
