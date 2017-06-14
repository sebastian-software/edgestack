import { createReduxStore, createRootReducer } from "./State"
import { createApolloClient } from "./Apollo"

test("Create Redux Store - Basic", () => {
  const reducers = {}
  const middlewares = []
  const enhancers = []

  expect(createReduxStore({ reducers, middlewares, enhancers })).toBeDefined()
})

test("Create Redux Store - No Reducers", () => {
  const middlewares = []
  const enhancers = []

  expect(createReduxStore({ middlewares, enhancers })).toBeDefined()
})

test("Create Redux Store - Empty Param", () => {
  expect(createReduxStore({ })).toBeDefined()
})

test("Create Redux Store - No Params", () => {
  expect(createReduxStore()).toBeDefined()
})

test("Create Redux Store - With Apollo", () => {
  const apolloClient = createApolloClient()
  expect(apolloClient).toBeDefined()
  expect(typeof apolloClient).toBe("object")

  const reducers = {}
  const middlewares = []
  const enhancers = []
  const reduxStore = createReduxStore({ reducers, middlewares, enhancers, apolloClient })
  expect(reduxStore).toBeDefined()
  expect(typeof reduxStore).toBe("object")
})

test("Create Redux Store - With Apollo and URL", () => {
  const apolloClient = createApolloClient()
  expect(apolloClient).toBeDefined()
  expect(typeof apolloClient).toBe("object")

  const reducers = {}
  const middlewares = []
  const enhancers = []
  const initialData = { ssr: { apolloUri: "http://my.apollo.uri" } }
  const reduxStore = createReduxStore({ reducers, middlewares, enhancers, initialData, apolloClient })
  expect(reduxStore).toBeDefined()
  expect(typeof reduxStore).toBe("object")
})

test("Create Root Reducer", () => {
  expect(createRootReducer()).toBeDefined()
})

test("Create Root Reducer with one reducer", () => {
  function dummy(prevState) {
    return prevState
  }

  expect(createRootReducer({ dummy })).toBeDefined()
})
