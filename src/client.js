// This file is just for exporting infrastructure to applications built upon this.
export {
  createReduxStore, createRootReducer,
  emptyReducer, emptyMiddleware, emptyEnhancer,
  ssrReducer
} from "./api/common/State"

export { createApolloClient } from "./api/common/Apollo"
export { default as RouterConnector, routerReducer } from "./api/common/RouterConnector"
export { ensureIntlSupport, ensureReactIntlSupport } from "./api/common/Intl"

export { default as deepFetch } from "./api/client/deepFetch"
export { default as renderApp } from "./api/client/renderApp"
