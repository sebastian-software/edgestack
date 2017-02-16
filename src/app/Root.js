// FIXME: waiting for release of fixed package.json entry. >= 4.1.0
import "sanitize.css/sanitize.css"

import React from "react"
import { Switch, Route, NavLink } from "react-router-dom"
import Helmet from "react-helmet"
import { createAsyncComponent } from "react-async-component"
import { IntlProvider } from "react-intl"
import { connect } from "react-redux"
import { getLocale, getLanguage } from "../common/State"

// Application specific
import "./Fonts.css"
import Styles from "./Root.css"
import RouterConnector from "../common/RouterConnector"

const websiteTitle = "Advanced Boilerplate"
const websiteDescription = "A Universal Apollo React Boilerplate with an Amazing Developer Experience."

const HomeAsync = createAsyncComponent({ resolve: () => import("./views/Home") })
const AboutAsync = createAsyncComponent({ resolve: () => import("./views/About") })

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
              <Route exact path="/" component={HomeAsync}/>
              <Route path="/about" component={AboutAsync}/>
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
