import React from "react"
import { renderToString } from "react-dom/server"
import { ServerRouter, createServerRenderContext } from "react-router"
import { CodeSplitProvider, createRenderContext } from "code-split-component"
import Helmet from "react-helmet"
import { Provider } from "react-redux"
import { getDataFromTree } from "react-apollo/server"
import { ApolloProvider } from "react-apollo"

import renderPage from "./renderPage"
import { createApolloClient, createReduxStore } from "../app/Data"

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
  return getDataFromTree(component).then(() => {
    return renderToString(component)
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
  } catch (err) {
    response.status(500).send(`Error during rendering: ${err}!: ${err.stack}`)
  }
}

function renderFull({ request, response, nonce, App, apolloClient, reduxStore }) {
  // First create a context for <ServerRouter>, which will allow us to
  // query for the results of the render.
  const routingContext = createServerRenderContext()

  // We also create a context for our <CodeSplitProvider> which will allow us
  // to query which chunks/modules were used during the render process.
  const codeSplitContext = createRenderContext()

  console.log("Server: Rendering app with data...")

  // Create the application react element.
  console.time("Server: Page Rendering")
  renderToStringWithData(
    <CodeSplitProvider context={codeSplitContext}>
      <ServerRouter location={request.url} context={routingContext}>
        <ApolloProvider client={apolloClient} store={reduxStore}>
          <App />
        </ApolloProvider>
      </ServerRouter>
    </CodeSplitProvider>
  ).then((renderedApp) => {

    console.timeEnd("Server: Page Rendering")

    const reduxState = reduxStore.getState()
    console.log("Server: Rendered state:", reduxState)

    // Render the app to a string.
    const html = renderPage({
      // Provide the full rendered App react element.
      renderedApp,

      // Provide the redux store state, this will be bound to the window.APP_STATE
      // so that we can rehydrate the state on the client.
      initialState: reduxState,

      // Nonce which allows us to safely declare inline scripts.
      nonce,

      // Running this gets all the helmet properties (e.g. headers/scripts/title etc)
      // that need to be included within our html. It's based on the rendered app.
      // @see https://github.com/nfl/react-helmet
      helmet: Helmet.rewind(),

      // We provide our code split state so that it can be included within the
      // html, and then the client bundle can use this data to know which chunks/
      // modules need to be rehydrated prior to the application being rendered.
      codeSplitState: codeSplitContext.getState()
    })

    // Get the render result from the server render context.
    const renderedResult = routingContext.getResult()

    console.log("Server: Sending page...")

    /* eslint-disable no-magic-numbers */

    // Check if the render result contains a redirect, if so we need to set
    // the specific status and redirect header and end the response.
    if (renderedResult.redirect) {
      response.status(301).setHeader("Location", renderedResult.redirect.pathname)
      response.end()
      return
    }

    // If the renderedResult contains a "missed" match then we set a 404 code.
    // Our App component will handle the rendering of an Error404 view.
    // Otherwise everything is all good and we send a 200 OK status.
    response.status(renderedResult.missed ? 404 : 200).send(html)
  })
}

/**
 * An express middleware that is capable of doing React server side rendering.
 */
export default function createUniversalMiddleware({ App, ssrData, batchRequests = false, trustNetwork = true })
{
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
        initialState: initialState,
        batchRequests: batchRequests,
        trustNetwork: trustNetwork
      })

      const reduxStore = createReduxStore({
        apolloClient: apolloClient,
        initialState : initialState,
        reducers: App.getReducers(),
        enhancers: App.getEnhancers(),
        middlewares: App.getMiddlewares()
      })

      renderFull({ request, response, nonce, App, apolloClient, reduxStore })
    }
  }
}
