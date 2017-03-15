import React from "react"
import { render } from "react-dom"
import { BrowserRouter, withRouter } from "react-router-dom"
import { ApolloProvider } from "react-apollo"

import deepFetch from "../common/deepFetch"
import RouterConnector from "../common/RouterConnector"

export default function renderApp(AppRoot, { apolloClient, reduxStore })
{
  const RoutedAppRoot = withRouter(AppRoot)
  const WrappedRoot = (
    <BrowserRouter>
      <ApolloProvider client={apolloClient} store={reduxStore}>
        <RouterConnector>
          <RoutedAppRoot/>
        </RouterConnector>
      </ApolloProvider>
    </BrowserRouter>
  )

  return deepFetch(WrappedRoot)
    .then(() => render(WrappedRoot, document.getElementById("app")))
}
