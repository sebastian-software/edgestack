import React from "react"
import { Route, withRouter } from "react-router-dom"
import { connect } from "react-redux"

import { getLocale, getLanguage } from "./State"
// import wrapAsync from "./wrapAsync"

class AsyncRoute extends React.Component {
  state = {
    component: null,
    loading: false
  }

  /*
  componentWillMount() {
    if (this.state.component == null && this.state.loading === false) {
      let { locale, language, load, path } = this.props
      console.log("Mount async route component for: ", path)

      // this.setState({
      //   component: () => {return <b>{this.props.path}</b>} //wrapAsync(() => Promise.all(load(language)), locale)
      // })

      this.setState({ loading: true })

      Promise.all(load(language)).then((result) => {
        console.log("Loaded async route for: ", path)
        console.log(result)
      })

    }
  }
  */

  componentWillMount() {
    console.log("AsyncRoute: WillMount:", this.props.path)
    if (process.env.TARGET === "web") {
      this.fetchData()
    }
  }

  fetchData()
  {
    if (this.state.component != null || this.state.loading === true) {
      return
    }

    console.log("AsyncRoute: Fetch:", this.props.path)
  }

  render() {
    console.log("AsyncRoute: Render:", this.props.path)
    return <Route component={this.state.component} {...this.props}/>
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
