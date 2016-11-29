export const SET_COUNTER = "counter/SET"
export const INCREMENT_COUNTER = "counter/INCREMENT"
export const DECREMENT_COUNTER = "counter/DECREMENT"

export function getCounter(state) {
  return state.counter.value
}

export function setCounter(value)
{
  return {
    type: SET_COUNTER,
    value: value
  }
}

export function incrementCounter()
{
  return {
    type: INCREMENT_COUNTER
  }
}

export function decrementCounter()
{
  return {
    type: DECREMENT_COUNTER
  }
}

const initialState = {
  value: 0
}

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
