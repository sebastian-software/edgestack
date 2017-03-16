export {
  createReduxStore, createRootReducer,
  emptyReducer, emptyMiddleware, emptyEnhancer,
  ssrReducer,
  getRegion, getLanguage, getLocale
} from "./common/State"

export { createApolloClient } from "./common/Apollo"
export { default as RouterConnector, routerReducer } from "./common/RouterConnector"
export { ensureIntlSupport, ensureReactIntlSupport } from "./common/Intl"
export { default as createLazyComponent } from "./common/createLazyComponent"
