import React from "react"
import { Route, withRouter } from "react-router-dom"
import { connect } from "react-redux"

import { getLocale, getLanguage } from "./State"
import wrapAsync from "./wrapAsync"

class AsyncRoute extends React.Component {
  constructor(props) {
    super(props)

    const { locale, language, load } = props

    console.log("INIT ASYNC ROUTE: ", props.path)

    this.component = wrapAsync(() => Promise.all(load(language)), locale)
  }

  render() {
    return <Route component={this.component} {...this.props}/>
  }
}

AsyncRoute.propTypes = {
  load: React.PropTypes.func,
  locale: React.PropTypes.string,
  language: React.PropTypes.string
}

export default withRouter(connect((state, ownProps) => ({
  locale: getLocale(state),
  language: getLanguage(state)
}))(AsyncRoute))
