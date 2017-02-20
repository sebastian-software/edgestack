// FIXME: waiting for release of fixed package.json entry. >= 4.1.0
import "sanitize.css/sanitize.css"

import React from "react"
import { Switch, Route, NavLink } from "react-router-dom"
import Helmet from "react-helmet"
import { IntlProvider } from "react-intl"
import { connect } from "react-redux"

import { getLocale, getLanguage } from "../common/State"
import AsyncRoute from "../common/AsyncRoute"

// Application specific
import "./Fonts.css"
import Styles from "./Root.css"
import RouterConnector from "../common/RouterConnector"

const websiteTitle = "Edge Stack"
const websiteDescription = "A Universal React Stack with tons of recent technologies like Express, Apollo, React Router v4, " +
  "Code Splitting, React-Intl, NodeJS v6, Webpack v2 + HMR etc. bundled into an easy to use package."

const rootMessages = {
  counter: "Counter: {value, number}"
}

function Error404() {
  return <div>Sorry, that page was not found.</div>
}

function Root({ children, locale, language }) {
  return (
    <IntlProvider locale={locale} messages={rootMessages}>
      <main>
        <Helmet
          titleTemplate={`${websiteTitle} - %s`}
          defaultTitle={websiteTitle}
          meta={[
            { name: "charset", content: "utf-8" },
            { "http-equiv": "X-UA-Compatible", "content": "IE=edge" },
            { name: "viewport", content: "width=device-width, initial-scale=1" },
            { name: "description", content: websiteDescription }
          ]}
        />

        <div>
          <h1 className={Styles.title}>{websiteTitle}</h1>
          <strong>{websiteDescription}</strong>
        </div>
        <div>
          <ul>
            <li><NavLink exact to="/" activeClassName={Styles.activeLink}>Home</NavLink></li>
            <li><NavLink to="/about" activeClassName={Styles.activeLink}>About</NavLink></li>
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
    </IntlProvider>
  )
}

Root.propTypes = {
  children: React.PropTypes.node,
  locale: React.PropTypes.string,
  language: React.PropTypes.string
}

const mapStateToProps = (state, ownProps) => ({
  locale: getLocale(state),
  language: getLanguage(state)
})

export default connect(mapStateToProps)(Root)
