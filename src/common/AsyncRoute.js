import React from "react"
import { Route } from "react-router-dom"
import { connect } from "react-redux"

import { getLocale, getLanguage } from "./State"
import wrapAsync from "./wrapAsync"

class AsyncRoute extends React.Component {
  constructor(props) {
    super(props)

    const { language, load } = props
    this.component = wrapAsync(() => Promise.all(load(language)), language)
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

export default connect((state, ownProps) => ({
  locale: getLocale(state),
  language: getLanguage(state)
}))(AsyncRoute)
