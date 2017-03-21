import React from "react"
import { render } from "react-dom"
import { BrowserRouter, withRouter } from "react-router-dom"
import { ApolloProvider } from "react-apollo"

import RouterConnector from "../common/RouterConnector"

import deepFetch from "./deepFetch"

export default function renderApp(AppRoot, { apolloClient, reduxStore })
{
  const RoutedAppRoot = withRouter(AppRoot)
  const WrappedRoot = (
    <ApolloProvider client={apolloClient} store={reduxStore}>
      <BrowserRouter>
        <RouterConnector>
          <RoutedAppRoot/>
        </RouterConnector>
      </BrowserRouter>
    </ApolloProvider>
  )

  return deepFetch(WrappedRoot)
    .then(() => render(WrappedRoot, document.getElementById("app")))
}
