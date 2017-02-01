import React from "react"
import { renderToString } from "react-dom/server"
import { StaticRouter } from "react-router"
import Helmet from "react-helmet"
import { ApolloProvider, getDataFromTree } from "react-apollo"
import { withAsyncComponents } from "react-async-component"

import renderPage from "./renderPage"
import { createApolloClient, createReduxStore } from "../common/Data"

/**
 * Using Apollo logic to recursively resolve all queries needed for
 * initial rendering. The convention is to use the full JSX tree,
 * traverse it and look for all occurrences of a static `fetchData() => Promise`
 * method which is being executed and waited for.
 *
 * See also:
 * https://www.npmjs.com/package/react-redux-universal-hot-example#server-side-data-fetching
 */
function renderToStringWithData(component) {
  var startLoading = process.hrtime()
  var nanoToMilli = 1000000
  return getDataFromTree(component).then(() => {
    var loadingRuntime = Math.round(process.hrtime(startLoading)[1] / nanoToMilli)

    var startRendering = process.hrtime()
    var result = renderToString(component)
    var renderingRuntime = Math.round(process.hrtime(startRendering)[1] / nanoToMilli)

    console.log(`Server: Loading: ${loadingRuntime}ms Rendering: ${renderingRuntime}ms`)
    return result
  })
}

// SSR is disabled so we will just return an empty html page and will
// rely on the client to populate the initial react application state.
function renderLight({ request, response, nonce, initialState }) {
  /* eslint-disable no-magic-numbers */
  try {
    const html = renderPage({
      // Provide the redux store state, this will be bound to the window.APP_STATE
      // so that we can rehydrate the state on the client.
      initialState,

      // Nonce which allows us to safely declare inline scripts.
      nonce
    })
    response.status(200).send(html)
  } catch (error) {
    response.status(500).send(`Error during rendering: ${error}!: ${error.stack}`)
  }
}

function renderFull({ request, response, nonce, AppContainer, apolloClient, reduxStore }) {
  const routingContext = {}

  console.log("Server: Rendering app with data...")

  var WrappedAppContainer = (
    <StaticRouter location={request.url} context={routingContext}>
      <ApolloProvider client={apolloClient} store={reduxStore}>
        <AppContainer/>
      </ApolloProvider>
    </StaticRouter>
  )

  withAsyncComponents(WrappedAppContainer).then((wrappedResult) =>
  {
    const {
      // The result includes a decorated version of your app
      // that will have the async components initialised for
      // the renderToString call.
      appWithAsyncComponents,

      // This state object represents the async components that
      // were rendered by the server. We will need to send
      // this back to the client, attaching it to the window
      // object so that the client can rehydrate the application
      // to the expected state and avoid React checksum issues.
      state,

      // This is the identifier you should use when attaching
      // the state to the "window" object.
      STATE_IDENTIFIER
    } = wrappedResult

    // Create the application react element.
    renderToStringWithData(
      appWithAsyncComponents
    ).then((renderedApp) => {
      const reduxState = reduxStore.getState()

      // Render the app to a string.
      const html = renderPage({
        // Provide the full rendered App react element.
        renderedApp,

        // Provide the redux store state, this will be bound to the window.APP_STATE
        // so that we can rehydrate the state on the client.
        initialState: reduxState,

        codeSplitState: state,
        STATE_IDENTIFIER,

        // Nonce which allows us to safely declare inline scripts.
        nonce,

        // Running this gets all the helmet properties (e.g. headers/scripts/title etc)
        // that need to be included within our html. It's based on the rendered app.
        // @see https://github.com/nfl/react-helmet
        helmet: Helmet.rewind()
      })

      console.log("Server: Routing Context:", routingContext)
      console.log("Server: Sending Page...")

      /* eslint-disable no-magic-numbers */

      // Check if the render result contains a redirect, if so we need to set
      // the specific status and redirect header and end the response.
      if (routingContext.url) {
        response.status(302).setHeader("Location", routingContext.url)
        response.end()
        return
      }

      // If the renderedResult contains a "missed" match then we set a 404 code.
      // Our App component will handle the rendering of an Error404 view.
      // Otherwise everything is all good and we send a 200 OK status.
      response.status(routingContext.missed ? 404 : 200).send(html)
    }).catch((error) => {
      console.error("Error during producing response:", error)
    })
  }).catch((error) => {
    console.error("Unable to wrap application container:", error)
  })
}

/**
 * An express middleware that is capable of doing React server side rendering.
 */
export default function createUniversalMiddleware({ AppContainer, ssrData, batchRequests = false, trustNetwork = true })
{
  if (AppContainer == null) {
    throw new Error("Universal Middleware: Missing AppContainer")
  }

  return function middleware(request, response)
  {
    if (typeof response.locals.nonce !== "string") {
      throw new Error(`A "nonce" value has not been attached to the response`)
    }
    const nonce = response.locals.nonce

    // Pass object with all Server Side Rendering (SSR) related data to the client
    const initialState = {
      ssr: ssrData
    }

    if (process.env.DISABLE_SSR)
    {
      renderLight({ request, response, nonce, initialState })
    }
    else
    {
      const apolloClient = createApolloClient({
        headers: request.headers,
        initialState,
        batchRequests,
        trustNetwork
      })

      const reduxStore = createReduxStore({
        apolloClient,
        initialState,
        reducers: AppContainer.getReducers(),
        enhancers: AppContainer.getEnhancers(),
        middlewares: AppContainer.getMiddlewares()
      })

      renderFull({ request, response, nonce, AppContainer, apolloClient, reduxStore })
    }
  }
}
