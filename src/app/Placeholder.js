export function emptyReducer(previousState = {}, action) {
  return previousState
}

export function emptyMiddleware(store) {
  return function(next) {
    return function(action) {
      return next(action)
    }
  }
}

export function emptyEnhancer(param) {
  return param
}
