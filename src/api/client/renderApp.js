import React from "react"
import { render } from "react-dom"
import { BrowserRouter, withRouter } from "react-router-dom"
import { ApolloProvider } from "react-apollo"
import { IntlProvider } from "react-intl"

import RouterConnector from "../common/RouterConnector"
import deepFetch from "../common/deepFetch"

export default function renderApp(AppRoot, { apolloClient, reduxStore })
{
  const RoutedAppRoot = withRouter(AppRoot)

  const { locale, messages } = window.APP_STATE.ssr

  const WrappedRoot = (
    <IntlProvider locale={locale} messages={messages}>
      <ApolloProvider client={apolloClient} store={reduxStore}>
        <BrowserRouter>
          <RouterConnector>
            <RoutedAppRoot/>
          </RouterConnector>
        </BrowserRouter>
      </ApolloProvider>
    </IntlProvider>
  )

  return deepFetch(WrappedRoot)
    .then(() => render(WrappedRoot, document.getElementById("app")))
}
