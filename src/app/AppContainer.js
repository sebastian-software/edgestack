// FIXME: waiting for release of fixed package.json entry. >= 4.1.0
import "sanitize.css/sanitize.css"

import React from "react"
import { Match, Miss, Link } from "react-router"
import Helmet from "react-helmet"
import createLogger from "redux-logger"
import { createAsyncComponent } from "react-async-component"

import RouterConnector, { routerReducer } from "../common/RouterConnector"

// Application specific
import "./Fonts.css"
import Styles from "./AppContainer.css"
import { counterReducer } from "./CounterModule"

const websiteDescription = "A Universal Apollo React Boilerplate with an Amazing Developer Experience."
const websiteLanguage = "en-US"
const websiteTitle = "Advanced Boilerplate"

const HomeAsync = createAsyncComponent({
  resolve: () => System.import("./Home")
})

const AboutAsync = createAsyncComponent({
  resolve: () => System.import("./About")
})

function Error404() {
  return <div>Sorry, that page was not found.</div>
}

function AppContainer({ children }) {
  return (
    <main>
      <Helmet
        htmlAttributes={{
          lang: websiteLanguage
        }}
        titleTemplate={`${websiteTitle} - %s`}
        defaultTitle={websiteTitle}
        meta={[
          { name: "charset", content: "utf-8" },
          { "http-equiv": "X-UA-Compatible", "content": "IE=edge" },
          { name: "viewport", content: "width=device-width, initial-scale=1" },
          { name: "content-language", content: websiteLanguage },
          { name: "description", content: websiteDescription }
        ]}
      />

      <div>
        <h1 className={Styles.title}>{websiteTitle}</h1>
        <strong>{websiteDescription}</strong>
      </div>
      <div>
        <ul>
          <li><Link to="/" activeOnlyWhenExact={true} activeClassName={Styles.activeLink}>Home</Link></li>
          <li><Link to="/about" activeOnlyWhenExact={true} activeClassName={Styles.activeLink}>About</Link></li>
        </ul>
      </div>

      <div>
        <RouterConnector>
          <Match exactly pattern="/" component={HomeAsync}/>
          <Match pattern="/about" component={AboutAsync}/>
          <Miss component={Error404}/>
        </RouterConnector>
      </div>
    </main>
  )
}

AppContainer.propTypes = {
  children: React.PropTypes.node
}

/**
 * Return list of Redux store enhancers to use
 */
AppContainer.getEnhancers = function() {
  return []
}

/**
 * Create mapping of reducers to use for the Redux store
 */
AppContainer.getReducers = function() {
  return {
    router: routerReducer,
    counter: counterReducer
  }
}

/**
 * Create list of Redux middleware to use.
 */
AppContainer.getMiddlewares = function() {
  var middlewares = []

  if (process.env.TARGET === "web") {
    middlewares.push(createLogger({ collapsed: true }))
  }

  return middlewares
}

export default AppContainer
