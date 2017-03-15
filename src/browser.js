// This file is just for exporting infrastructure to applications built upon this.
export {
  createReduxStore, createRootReducer,
  emptyReducer, emptyMiddleware, emptyEnhancer,
  ssrReducer
} from "./common/State"

export { createApolloClient } from "./common/Apollo"

export { default as RouterConnector, routerReducer } from "./common/RouterConnector"

export { default as deepFetch } from "./common/deepFetch"
