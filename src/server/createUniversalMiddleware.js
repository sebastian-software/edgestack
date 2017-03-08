import React from "react"
import { renderToString } from "react-dom/server"
import { StaticRouter } from "react-router"
import Helmet from "react-helmet"
import { ApolloProvider, getDataFromTree } from "react-apollo"
import { IntlProvider } from "react-intl"

import Measure from "./Measure"
import renderPage from "./renderPage"
import { createReduxStore } from "../common/State"
import { createApolloClient } from "../common/Apollo"

/**
 * Using Apollo logic to recursively resolve all queries needed for
 * initial rendering. The convention is to use the full JSX tree,
 * traverse it and look for all occurrences of a static `fetchData() => Promise`
 * method which is being executed and waited for.
 *
 * See also:
 * https://www.npmjs.com/package/react-redux-universal-hot-example#server-side-data-fetching
 */
function renderToStringWithData(component, measure) {
  measure.start("loading-data")
  return getDataFromTree(component).then(() => {
    measure.stop("loading-data")

    measure.start("render-react")
    var result = renderToString(component)
    measure.stop("render-react")

    return result
  })
}

// SSR is disabled so we will just return an empty html page and will
// rely on the client to populate the initial react application state.
function renderLight({ request, response, nonce, initialState, language, region, measure }) {
  /* eslint-disable no-magic-numbers */
  try {
    measure.start("render-page")
    const html = renderPage({
      // Provide the redux store state, this will be bound to the window.APP_STATE
      // so that we can rehydrate the state on the client.
      initialState,

      // Nonce which allows us to safely declare inline scripts.
      nonce,

      // Send detected language and region for HTML tag info
      language,
      region
    })
    measure.stop("render-page")

    response.status(200).send(html)

    // Print measure results
    measure.print()
  } catch (error) {
    response.status(500).send(`Error during rendering: ${error}!: ${error.stack}`)
  }
}

function renderFull({ request, response, nonce, Root, apolloClient, reduxStore, language, region, measure }) {
  const routingContext = {}

  console.log("Server: Rendering app with data...")

  var WrappedRoot = (
    <StaticRouter location={request.url} context={routingContext}>
      <ApolloProvider client={apolloClient} store={reduxStore}>
        <Root/>
      </ApolloProvider>
    </StaticRouter>
  )

  // Create the application react element.
  renderToStringWithData(
    WrappedRoot,
    measure
  ).then((renderedApp) => {
    const reduxState = reduxStore.getState()

    // Render the app to a string.
    measure.start("render-page")
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

      // Send detected language and region for HTML tag info
      language,
      region
    })
    measure.stop("render-page")

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

    // Print measure results
    // measure.print()
  }).catch((error) => {
    console.error("Server: Error during producing response:", error)
  })
}

/**
 * An express middleware that is capable of doing React server side rendering.
 */
export default function createUniversalMiddleware({ Root, State, ssrData, batchRequests = false, trustNetwork = true })
{
  if (Root == null) {
    throw new Error("Server: Universal Middleware: Missing Root!")
  }

  if (State == null) {
    throw new Error("Server: Universal Middleware: Missing State!")
  }

  return function middleware(request, response)
  {
    if (typeof response.locals.nonce !== "string") {
      throw new TypeError(`Server: A "nonce" value has not been attached to the response`)
    }
    const nonce = response.locals.nonce

    if (!request.locale) {
      throw new Error("Cannot correctly deal with locale configuration!")
    }

    const { language, region } = request.locale

    console.log(
      "Incoming URL:",
      request.originalUrl,
      process.env.DISABLE_SSR ? "[SSR: disabled]" : "[SSR: enabled]",
      `[Locale: ${language}-${region}]`
    )
    let measure = new Measure()

    // After matching locales with configuration we send the accepted locale
    // back to the client using a simple session cookie
    response.cookie("locale", `${language}-${region}`)

    // Pass object with all Server Side Rendering (SSR) related data to the client
    const initialState = {
      ssr: {
        ...ssrData,
        locale: `${language}-${region}`,
        language,
        region
      }
    }

    if (process.env.DISABLE_SSR)
    {
      renderLight({
        request,
        response,
        nonce,
        initialState,
        language,
        region,
        measure
      })
    }
    else
    {
      measure.start("create-apollo")
      const apolloClient = createApolloClient({
        headers: request.headers,
        initialState,
        batchRequests,
        trustNetwork
      })
      measure.stop("create-apollo")

      measure.start("create-redux")
      const reduxStore = createReduxStore({
        reducers: State.getReducers(),
        enhancers: State.getEnhancers(),
        middlewares: State.getMiddlewares(),
        apolloClient,
        initialState
      })
      measure.stop("create-redux")

      renderFull({
        request,
        response,
        nonce,
        Root,
        apolloClient,
        reduxStore,
        language,
        region,
        measure
      })
    }
  }
}
