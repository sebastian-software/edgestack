import React from "react"
import { render } from "react-dom"
import { BrowserRouter, withRouter } from "react-router-dom"
import { ApolloProvider } from "react-apollo"
import { IntlProvider } from "react-intl"

import RouterConnector from "../common/RouterConnector"
import deepFetch from "../common/deepFetch"

export default function renderApp(AppRoot, { apolloClient, reduxStore, messages })
{
  const RoutedAppRoot = withRouter(AppRoot)
  const locale = window.APP_STATE.ssr.locale

  /*
  const language = window.APP_STATE.ssr.language

  import("file-loader?name=react-intl-[hash:base62:8].[ext]!react-intl/locale-data/" + language + ".js").then((result) => {
    // TODO: Find a possibility to inject these in the HTML on server side

    // Use file-loader on server-side to generate URL...
  })
  */

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

  render(WrappedRoot, document.getElementById("app"))

  // return deepFetch(WrappedRoot)
  //  .then(() => render(WrappedRoot, document.getElementById("app")))
}
