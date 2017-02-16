import createLogger from "redux-logger"

import { routerReducer } from "../common/RouterConnector"
import { counterReducer } from "./modules/CounterModule"

export default {
  /**
   * Return list of Redux store enhancers to use
   */
  getEnhancers() {
    return []
  },

  /**
   * Create mapping of reducers to use for the Redux store
   */
  getReducers() {
    return {
      router: routerReducer,
      counter: counterReducer
    }
  },

  /**
   * Create list of Redux middleware to use.
   */
  getMiddlewares() {
    var middlewares = []

    if (process.env.TARGET === "web") {
      middlewares.push(createLogger({ collapsed: true }))
    }

    return middlewares
  }
}
