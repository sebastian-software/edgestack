// This file is just for exporting infrastructure to applications built upon this.
export { createReduxStore, createApolloClient,
  emptyReducer, emptyMiddleware, emptyEnhancer,
  ssrReducer } from "./app/Data"

export { default as ReactHotLoader } from "./client/ReactHotLoader"
import "./client/addServiceWorker"
