import React from "react"
import { renderToString } from "react-dom/server"
import { ServerRouter, createServerRenderContext } from "react-router"
import { CodeSplitProvider, createRenderContext } from "code-split-component"
import Helmet from "react-helmet"
import { Provider } from "react-redux"
import { renderToStringWithData } from "react-apollo/server"
import { ApolloProvider } from "react-apollo"

import renderPage from "./renderPage"


// SSR is disabled so we will just return an empty html page and will
// rely on the client to populate the initial react application state.
function renderLight({ request, response, nonce }) {
  /* eslint-disable no-magic-numbers */
  try {
    const html = renderPage({
      nonce
    })
    response.status(200).send(html)
  } catch (err) {
    response.status(500).send(`Error during rendering: ${err}!: ${err.stack}`)
  }
}

function renderFull({ request, response, nonce, App, apolloClient, store }) {
  // First create a context for <ServerRouter>, which will allow us to
  // query for the results of the render.
  const routingContext = createServerRenderContext()

  // We also create a context for our <CodeSplitProvider> which will allow us
  // to query which chunks/modules were used during the render process.
  const codeSplitContext = createRenderContext()

  console.log("Server: Rendering app with data...")

  // Create the application react element.
  renderToStringWithData(
    <CodeSplitProvider context={codeSplitContext}>
      <ServerRouter location={request.url} context={routingContext}>
        <ApolloProvider client={apolloClient}>
          <App />
        </ApolloProvider>
      </ServerRouter>
    </CodeSplitProvider>
  ).then((renderedApp) => {

    console.log("Server: Render complete!")

    const state = store.getState()
    console.log("Server: Rendered state:", state)

    // Render the app to a string.
    const html = renderPage({
      // Provide the full rendered App react element.
      renderedApp,

      // Provide the redux store state, this will be bound to the window.APP_STATE
      // so that we can rehydrate the state on the client.
      initialState: state,

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
export function generateMiddleware(App, createApolloClient)
{
  return function middleware(request, response)
  {
    if (typeof response.locals.nonce !== "string") {
      throw new Error(`A "nonce" value has not been attached to the response`)
    }
    const nonce = response.locals.nonce

    /* eslint-disable no-magic-numbers */
    if (process.env.DISABLE_SSR === true) {
      renderLight({ request, response, nonce })
    } else {
      const { apolloClient, store } = createApolloClient(request.headers)
      renderFull({ request, response, nonce, App, apolloClient, store })
    }
  }
}
