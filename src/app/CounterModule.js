export const SET_COUNTER = "counter/SET"
export const INCREMENT_COUNTER = "counter/INCREMENT"
export const DECREMENT_COUNTER = "counter/DECREMENT"

/**
 * Selector for accessing the counter value from inside the global state
 */
export function getCounter(state) {
  return state.counter.value
}

/**
 * Action creator for setting the counter value
 */
export function setCounter(value)
{
  return {
    type: SET_COUNTER,
    value: value
  }
}

/**
 * Action creator for incrementing the counter value
 */
export function incrementCounter()
{
  return {
    type: INCREMENT_COUNTER
  }
}

/**
 * Action creator for decrementing the counter value
 */
export function decrementCounter()
{
  return {
    type: DECREMENT_COUNTER
  }
}

/**
 * This somewhat tries to emulate a asyncronous backend request
 */
function generateServerResponse() {
  console.log("Loading counter...")
  return new Promise((resolve, reject) =>
  {
    setTimeout(() =>
    {
      let value = Math.round(Math.random() * 100)
      console.log("Received counter:", value)
      resolve(value)
    }, 100)
  })
}

/**
 * Async data loading using redux-thunk
 */
export function loadCounter() {
  return (dispatch) => generateServerResponse().then((value) => dispatch(setCounter(value)))
}

const initialState = {
  value: 0
}

/**
 * Reducer for all counter relevant action types
 */
export function counterReducer(previousState = initialState, action)
{
  switch (action.type)
  {
    case SET_COUNTER:
      return { ...previousState, value: action.value }

    case INCREMENT_COUNTER:
      return { ...previousState, value: previousState.value + 1 }

    case DECREMENT_COUNTER:
      return { ...previousState, value: previousState.value - 1 }

    default:
      return previousState
  }
}
