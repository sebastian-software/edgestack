import React from "react"
import { ServerRouter, createServerRenderContext } from "react-router"
import { CodeSplitProvider, createRenderContext } from "code-split-component"
import Helmet from 'react-helmet';

import App from "../demo/components/App"

import render from "./render"

/**
 * An express middleware that is capabable of doing React server side rendering.
 */
export default function universalMiddleware(request, response)
{
  if (typeof response.locals.nonce !== "string") {
    throw new Error('A "nonce" value has not been attached to the response')
  }
  const nonce = response.locals.nonce

  /* eslint-disable no-magic-numbers */
  if (process.env.DISABLE_SSR === true)
  {
    // SSR is disabled so we will just return an empty html page and will
    // rely on the client to populate the initial react application state.
    try {
      const html = render({
        nonce
      })
      response.status(200).send(html)
    } catch (ex) {
      response.status(500).send(`Error during rendering: ${ex}!: ${ex.stack}`)
    }
  }
  else
  {
    // First create a context for <ServerRouter>, which will allow us to
    // query for the results of the render.
    const routingContext = createServerRenderContext()

    // We also create a context for our <CodeSplitProvider> which will allow us
    // to query which chunks/modules were used during the render process.
    const codeSplitContext = createRenderContext()

    // Create the application react element.
    const app = (
      <CodeSplitProvider context={codeSplitContext}>
        <ServerRouter location={request.url} context={routingContext}>
          <App />
        </ServerRouter>
      </CodeSplitProvider>
    )

    // Render the app to a string.
    const html = render({
      // Provide the full app react element.
      app,

      // Nonce for allowing inline scripts.
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
    const renderResult = routingContext.getResult()

    // Check if the render result contains a redirect, if so we need to set
    // the specific status and redirect header and end the response.
    if (renderResult.redirect) {
      response.status(301).setHeader("Location", renderResult.redirect.pathname)
      response.end()
      return
    }

    // If the renderResult contains a "missed" match then we set a 404 code.
    // Our App component will handle the rendering of an Error404 view.
    // Otherwise everything is all good and we send a 200 OK status.
    response.status(renderResult.missed ? 404 : 200).send(html)
  }
}
