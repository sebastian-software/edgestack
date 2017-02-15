// FIXME: waiting for release of fixed package.json entry. >= 4.1.0
import "sanitize.css/sanitize.css"

import React from "react"
import { Switch, Route, NavLink } from "react-router-dom"
import Helmet from "react-helmet"

import { createAsyncComponent } from "react-async-component"
import areIntlLocalesSupported from "intl-locales-supported"

import RouterConnector from "../common/RouterConnector"

// Application specific
import "./Fonts.css"
import Styles from "./AppContainer.css"

const websiteDescription = "A Universal Apollo React Boilerplate with an Amazing Developer Experience."
const websiteLanguage = "en-US"
const websiteTitle = "Advanced Boilerplate"

const HomeAsync = createAsyncComponent({
  resolve: () => import("./Home")
})

const AboutAsync = createAsyncComponent({
  resolve: () => import("./About")
})

// Chunked polyfill for browsers without Intl support
function intlStart() {
}

function getLanguage() {
  return typeof document !== "undefined" ? document.documentElement.lang : "de_DE" // FIXME
}

// console.log("Language:", getLanguage())


let needsPolyfill = false

if (global.Intl) {
  // Determine if the built-in `Intl` has the locale data we need.
  if (!areIntlLocalesSupported([getLanguage().replace("_", "-")])) {
    needsPolyfill = true

    // `Intl` exists, but it doesn't have the data we need, so load the
    // polyfill and patch the constructors we need with the polyfill's.
    import("lean-intl").then((IntlPolyfill) => {
      Intl.NumberFormat = IntlPolyfill.NumberFormat
      Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat
    })
  }
} else {
  needsPolyfill = true

  // No `Intl`, so use and load the polyfill.
  import("lean-intl").then((IntlPolyfill) => {
    global.Intl = IntlPolyfill
  })
}

// console.log("Needs Intl Polyfill:", needsPolyfill)

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
  )
}

AppContainer.propTypes = {
  children: React.PropTypes.node
}

export default AppContainer
