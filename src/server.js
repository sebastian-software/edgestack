// This file is just for exporting infrastructure to applications built upon this.

export * from "./server/config"

export { default as createExpressServer } from "./server/createExpressServer"
export { default as createUniversalMiddleware } from "./server/createUniversalMiddleware"
export { default as addFallbackHandler } from "./server/addFallbackHandler"
export { default as renderPage } from "./server/renderPage"
export { default as RouterConnector } from "./common/RouterConnector"

export * from "./common/State"
export * from "./common/Apollo"
export * from "./common/Intl"
export * from "./common/RouterConnector"
