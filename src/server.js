// This file is just for exporting infrastructure to applications built upon this.

// eslint-disable-next-line import/no-namespace
import * as ServerConfig from "./api/server/config"
export { ServerConfig }

export { default as createExpressServer } from "./api/server/createExpressServer"
export { default as createUniversalMiddleware } from "./api/server/createUniversalMiddleware"
export { default as addFallbackHandler } from "./api/server/addFallbackHandler"
export { default as renderPage } from "./api/server/renderPage"
export { enableEnhancedStackTraces, logError } from "./api/server/debug"

export { createReduxStore, createRootReducer, emptyReducer, emptyMiddleware, emptyEnhancer } from "./api/common/State"
export { createApolloClient } from "./api/common/Apollo"
export { default as RouterConnector, routerReducer } from "./api/common/RouterConnector"
