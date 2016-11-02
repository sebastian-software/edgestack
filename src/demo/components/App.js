import "normalize.css/normalize.css"
import "./Fonts.css"

import React from "react"
import { Match, Miss, Link } from "react-router"
import Helmet from "react-helmet"
import CodeSplit from "code-split-component";

import styles from "./App.css"

const websiteDescription = "A NodeJS V6 Universal React Boilerplate with an Amazing Developer Experience."
const websiteLanguage = "en-US"
const websiteTitle = "Advanced Boilerplate"

function Error404() {
  return <div>Sorry, that page was not found.</div>;
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
          { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
          { name: 'viewport', content: 'width=device-width, initial-scale=1' },
          { name: "content-language", content: websiteLanguage },
          { name: "description", content: websiteDescription }
        ]}
      />

      <div>
        <h1>{websiteTitle}</h1>
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
          render={routerProps =>
            <CodeSplit module={System.import('./Home')}>
              { Home => Home && <Home {...routerProps} /> }
            </CodeSplit>
          }
        />

        <Match
          pattern="/about"
          render={routerProps =>
            <CodeSplit module={System.import('./About')}>
              { About => About && <About {...routerProps} /> }
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

// The following is needed so that we can hot reload our App.
/*
if (process.env.NODE_ENV === "development" && module.hot) {
  // Any changes to our App will cause a hotload re-render.
  module.hot.accept(
    "./App.js",
    () => renderApp(require("./App.js").default)
  )
}
*/

export default App
