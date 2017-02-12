// FIXME: waiting for release of fixed package.json entry. >= 4.1.0
import "sanitize.css/sanitize.css"

import React from "react"
import { Switch, Route, NavLink } from "react-router-dom"
import Helmet from "react-helmet"
import createLogger from "redux-logger"
import { createAsyncComponent } from "react-async-component"
import RouterConnector, { routerReducer } from "advanced-boilerplate"

// Application specific
const websiteTitle = "{{ADVANCED-BOILERPLATE-TITLE}}"
const websiteDescription = "{{ADVANCED-BOILERPLATE-DESCRIPTION}}"
const websiteLanguage = "{{ADVANCED-BOILERPLATE-LANGUAGE}}"

const HomeAsync = createAsyncComponent({
  resolve: () => import("./Home")
})

const AboutAsync = createAsyncComponent({
  resolve: () => import("./About")
})

function Error404() {
  return <div>Sorry, that page was not found.</div>
}

function AppContainer({ children }) {
  return (
    <main>
      <Helmet
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
          <li><NavLink to="/" activeClassName={Styles.activeLink}>Home</NavLink></li>
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
    router: routerReducer
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
