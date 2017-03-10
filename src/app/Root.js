// FIXME: waiting for release of fixed package.json entry. >= 4.1.0
import "sanitize.css/sanitize.css"

import React from "react"
import { Switch, Route } from "react-router-dom"
import { IntlProvider } from "react-intl"
import { connect } from "react-redux"

import { getLocale, getLanguage } from "../common/State"
import createLazyComponent from "../common/createLazyComponent"

// Application specific
import "./Fonts.css"

import messages from "./messages/en.json"

import Header from "./components/Header"
import Navigation from "./components/Navigation"

const HomeView = createLazyComponent({
  load: (language) => {
    return [
      import("./views/Home")
    ]
  }
})

const AboutView = createLazyComponent({
  load: (language) => {
    return [
      import("./views/About"),
      import("./views/messages/About." + language + ".json")
    ]
  }
})

const MissingView = createLazyComponent({
  load: (language) => {
    return [
      import("./views/Missing")
    ]
  }
})

function Root({ children, locale, language, intl }) {
  return (
    <IntlProvider locale={locale} messages={messages}>
      <main>
        <Header/>
        <Navigation/>
        <Switch>
          <Route exact path="/" component={HomeView} />
          <Route path="/about" component={AboutView} />
          <Route component={MissingView}/>
        </Switch>
      </main>
    </IntlProvider>
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

export default connect(mapStateToProps)(Root)
