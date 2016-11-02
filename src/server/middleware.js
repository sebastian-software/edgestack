import React from "react"
import RouterContext from "react-router/lib/RouterContext"
import createMemoryHistory from "react-router/lib/createMemoryHistory"
import match from "react-router/lib/match"

import render from "./render"

/**
 * An express middleware that is capabable of doing React server side rendering.
 */
export default function universalMiddleware(request, response)
{
  /* eslint-disable no-magic-numbers */
  if (process.env.DISABLE_SSR === true)
  {
    // SSR is disabled so we will just return an empty html page and will
    // rely on the client to populate the initial react application state.
    try{
      const html = render()
      response.status(200).send(html)
    } catch(ex) {
      response.status(500).send(`Error during rendering: ${ex}!`)
    }
  }
  else
  {
    const history = createMemoryHistory(request.originalUrl)

    // Server side handling of react-router.
    // Read more about this here:
    // https://github.com/reactjs/react-router/blob/master/docs/guides/ServerRendering.md
    match({ routes, history }, (error, redirectLocation, renderProps) =>
    {
      if (error)
      {
        response.status(500).send(error.message)
      }
      else if (redirectLocation)
      {
        response.redirect(302, redirectLocation.pathname + redirectLocation.search)
      }
      else if (renderProps)
      {
        // Testing for data recovery
        var data = { dummy: true }

        // You can check renderProps.components or renderProps.routes for
        // your "not found" component or route respectively, and send a 404 as
        // below, if you're using a catch-all route.

        try {
          const html = render(<RouterContext {...renderProps} />, data)
          response.status(200).send(html)
        } catch(ex) {
          response.status(500).send(`Error during rendering: ${ex}!`)
        }
      }
      else
      {
        response.status(404).send("Not found")
      }
    })
  }
}
