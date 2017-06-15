/* eslint-disable no-console */
import React from "react"
import { renderToString } from "react-dom/server"
import { StaticRouter } from "react-router"
import Helmet from "react-helmet"
import { ApolloProvider } from "react-apollo"
import { IntlProvider } from "react-intl"

import renderPage from "./renderPage"
import { createReduxStore } from "../common/State"
import { createApolloClient } from "../common/Apollo"
import deepFetch from "../common/deepFetch"

import { ensureIntlSupport, ensureReactIntlSupport } from "../server"

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
  return deepFetch(component).then(() => {
    var result = renderToString(component)
    return result
  })
}

// SSR is disabled so we will just return an empty html page and will
// rely on the client to populate the initial react application state.
function renderLight({ request, response, nonce, initialState, language, region, loadMessages }) {
  /* eslint-disable no-magic-numbers */
  try {
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

    response.status(200).send(html)
  } catch (error) {
    response.status(500).send(`Error during rendering: ${error}!: ${error.stack}`)
  }
}

async function renderFull({ request, response, nonce, Root, apolloClient, reduxStore, language, region, loadMessages }) {
  const routingContext = {}
  const locale = `${language}-${region}`
  const reduxState = reduxStore.getState()
  const ssrData = reduxState.ssr

  const [ intl, reactIntl, messages ] = await Promise.all([
    ensureIntlSupport(locale),
    ensureReactIntlSupport(language),
    loadMessages(language)
  ])

  console.log("Server: Rendering app with data...")
  console.log("Server: Redux State: ", reduxState)

  let WrappedRoot = (
    <IntlProvider locale={locale} messages={messages}>
      <StaticRouter location={request.url} context={routingContext}>
        <ApolloProvider client={apolloClient} store={reduxStore}>
          <Root/>
        </ApolloProvider>
      </StaticRouter>
    </IntlProvider>
  )

  const renderedApp = await renderToStringWithData(WrappedRoot)

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

    // Send detected language and region for HTML tag info
    language,
    region
  })

  // console.log("Server: Routing Context:", routingContext)
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
  response.status(routingContext.status || 200).send(html)
}

/**
 * An express middleware that is capable of doing React server side rendering.
 */
export default function createUniversalMiddleware({ Root, State, ssrData, loadMessages, batchRequests = false, trustNetwork = true })
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
    const locale = `${language}-${region}`

    console.log(
      "Incoming URL:",
      request.originalUrl,
      process.env.DISABLE_SSR ? "[SSR: disabled]" : "[SSR: enabled]",
      `[Locale: ${language}-${region}]`
    )

    // After matching locales with configuration we send the accepted locale
    // back to the client using a simple session cookie
    response.cookie("locale", locale)

    // Pass object with all Server Side Rendering (SSR) related data to the client
    const initialState = {
      ssr: {
        ...ssrData,
        locale,
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
        loadMessages
      })
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
        reducers: State.getReducers(),
        enhancers: State.getEnhancers(),
        middlewares: State.getMiddlewares(),
        apolloClient,
        initialState
      })

      renderFull({
        request,
        response,
        nonce,
        Root,
        apolloClient,
        reduxStore,
        language,
        region,
        loadMessages
      })
    }
  }
}
