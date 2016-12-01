import "normalize.css"

import React from "react"
import { Match, Miss, Link } from "react-router"
import Helmet from "react-helmet"
import { CodeSplit } from "code-split-component"
import createLogger from "redux-logger"

import "./Fonts.css"
import Styles from "./App.css"
import { counterReducer } from "./CounterModule"

const websiteDescription = "A Universal Apollo React Boilerplate with an Amazing Developer Experience."
const websiteLanguage = "en-US"
const websiteTitle = "Advanced Boilerplate"

function Error404() {
  return <div>Sorry, that page was not found.</div>
}

function App({ children }) {
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
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
        </ul>
      </div>

      <div>
        <Match
          exactly
          pattern="/"
          render={(routerProps) =>
            <CodeSplit chunkName="home" modules={{ Home: require("./Home") }}>
              { ({ Home }) => Home && <Home {...routerProps} /> }
            </CodeSplit>
          }
        />

        <Match
          pattern="/about"
          render={(routerProps) =>
            <CodeSplit chunkName="about" modules={{ About: require("./About") }}>
              { ({ About }) => About && <About {...routerProps} /> }
            </CodeSplit>
          }
        />

        <Miss component={Error404} />
      </div>
    </main>
  )
}

App.propTypes = {
  children: React.PropTypes.node
}

/**
 * Return list of Redux store enhancers to use
 */
App.getEnhancers = function() {
  return []
}

/**
 * Create mapping of reducers to use for the Redux store
 */
App.getReducers = function() {
  return {
    counter: counterReducer
  }
}

/**
 * Create list of Redux middleware to use.
 */
App.getMiddlewares = function() {
  var middlewares = []

  if (process.env.TARGET === "client") {
    middlewares.push(createLogger({ collapsed: true }))
  }

  return middlewares
}

export default App
