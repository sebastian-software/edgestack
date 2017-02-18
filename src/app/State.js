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
      counter: counterReducer
    }
  },

  /**
   * Create list of Redux middleware to use.
   */
  getMiddlewares() {
    return []
  }
}
