// Core Styles
import "sanitize.css"
import "./Fonts.css"
import Styles from "./Root.css"

import React from "react"
import { Switch, Route } from "react-router-dom"
import { IntlProvider } from "react-intl"
import { connect } from "react-redux"

import { getLocale, getLanguage, createLazyComponent } from "../api/common"

import messages from "./messages/en.json"

import Header from "app/components/Header"
import Navigation from "app/components/Navigation"

const HomeView = createLazyComponent({
  load: (language) => {
    return [
      import("./views/Home"),
      import("./views/Home." + language + ".json")
    ]
  }
})

const AboutView = createLazyComponent({
  load: (language) => {
    return [
      import("./views/About"),
      import("./views/About." + language + ".json")
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
      <div className={Styles.container}>
        <Header/>
        <Navigation/>
        <Switch>
          <Route exact path="/" component={HomeView} />
          <Route path="/about" component={AboutView} />
          <Route component={MissingView}/>
        </Switch>
      </div>
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
