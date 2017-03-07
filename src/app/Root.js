// FIXME: waiting for release of fixed package.json entry. >= 4.1.0
import "sanitize.css/sanitize.css"

import React from "react"
import { Switch, Route, NavLink } from "react-router-dom"
import Helmet from "react-helmet"
import { injectIntl, FormattedMessage } from "react-intl"
import { connect } from "react-redux"

import { getLocale, getLanguage } from "../common/State"
import AsyncRoute from "../common/AsyncRoute"

// Application specific
import "./Fonts.css"
import Styles from "./Root.css"
import RouterConnector from "../common/RouterConnector"

function Error404() {
  return <div>Sorry, that page was not found.</div>
}

function Root({ children, locale, language, intl }) {
  return (
    <main>
      <Route exact path="/" component={() => { console.log("HOME-in-ROOT"); return null }} />
      <Route path="/about" component={() => { console.log("ABOUT-in-ROOT"); return null }} />

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

      <div>
        <h1 className={Styles.title}><FormattedMessage id="app.title"/></h1>
        <strong><FormattedMessage id="app.description"/></strong>
      </div>
      <div>
        <ul>
          <li><NavLink exact to="/" activeClassName={Styles.activeLink}>Home</NavLink></li>
          <li><NavLink to="/about" activeClassName={Styles.activeLink}>About</NavLink></li>
          <li><NavLink to="/missing" activeClassName={Styles.activeLink}>Missing</NavLink></li>
        </ul>
      </div>

      <div>
        <RouterConnector>
          <Switch>
            <AsyncRoute exact path="/"
              load={(lang) => [
                import("./views/Home")
              ]}
            />
            <AsyncRoute path="/about"
              load={(lang) => [
                /* eslint-disable prefer-template */
                import("./views/About"),
                import("./views/messages/About." + lang + ".json")
              ]}
            />
            <Route component={Error404}/>
          </Switch>
        </RouterConnector>
      </div>
    </main>
  )
}

Root.propTypes = {
  children: React.PropTypes.node,
  locale: React.PropTypes.string,
  language: React.PropTypes.string,
  intl: React.PropTypes.object
}

const mapStateToProps = (state, ownProps) => ({
  locale: getLocale(state),
  language: getLanguage(state)
})

export default connect(mapStateToProps)(injectIntl(Root))
