import React from "react"
import { injectIntl, FormattedMessage } from "react-intl"
import Helmet from "react-helmet"
import PropTypes from "prop-types"

import Styles from "./Header.css"

function Header({ intl }) {
  return (
    <header id="site-header">
      <Helmet
        titleTemplate={`${intl.formatMessage({ id: "app.title" })} - %s`}
        defaultTitle={intl.formatMessage({ id: "app.title" })}
        meta={[
          { name: "charset", content: "utf-8" },
          { "http-equiv": "X-UA-Compatible", "content": "IE=edge" },
          { name: "viewport", content: "width=device-width, initial-scale=1" },
          { name: "description", content: intl.formatMessage({ id: "app.description" }) }
        ]}
      />

      <h1 className={Styles.title}><FormattedMessage id="app.title"/></h1>
      <strong><FormattedMessage id="app.description"/></strong>
    </header>
  )
}

Header.propTypes = {
  intl: PropTypes.object
}

export default injectIntl(Header)
