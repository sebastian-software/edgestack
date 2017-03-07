/* eslint-disable no-console */
import React from "react"
import { render } from "react-dom"
import { withAsyncComponents } from "react-async-component"

import Root from "../app/Root"
import State from "../app/State"

// eslint-disable-next-line import/no-unresolved
import { createReduxStore, createRootReducer } from "edgestack"

// Get the DOM Element that will host our React application.
const container = document.querySelector("#app")


let reduxStore

function initState(MyState)
{
  reduxStore = createReduxStore({
    reducers: MyState.getReducers(),
    enhancers: MyState.getEnhancers(),
    middlewares: MyState.getMiddlewares(),
    initialState: window.APP_STATE
  })
}

async function renderApp(MyRoot)
{
  var WrappedRoot = (
    <MyRoot/>
  )

  try
  {
    const result = await withAsyncComponents(WrappedRoot)
    const { appWithAsyncComponents } = result
    render(appWithAsyncComponents, container)
  }
  catch (error)
  {
    console.error("Client: Error wrapping application for code splitting:", error)
  }
}

// The following is needed so that we can hot reload our App.
if (process.env.NODE_ENV === "development" && module.hot)
{
  // Accept changes to this file for hot reloading.
  module.hot.accept("./index.js")

  // Any changes to our App will cause a hotload re-render.
  module.hot.accept("../app/Root", () => {
    console.log("- Hot: Rendering root...")
    renderApp(require("../app/Root").default)
  })

  module.hot.accept("../app/State", () => {
    console.log("- Hot: Updating reducers...")
    const nextState = require("../app/State").default
    const nextReducer = createRootReducer(nextState.getReducers())

    reduxStore.replaceReducer(nextReducer)
  })
}

initState(State)
renderApp(Root)
