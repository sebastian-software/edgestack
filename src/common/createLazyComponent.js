import React from "react"
import { connect } from "react-redux"
import { injectIntl, IntlProvider } from "react-intl"

import { getLocale, getLanguage } from "./State"

export default function createLazyComponent(options)
{
  var LazyLoading = false
  var LazyPromise = null
  var LazyComponent = null
  var LazyMessages = null

  class LazyComponentWrapper extends React.Component {
    constructor(props, context) {
      super(props)

      this.state = {
        loading: LazyLoading,
        component: LazyComponent,
        messages: LazyMessages
      }
    }

    fetchData() {
      if (LazyLoading === true || LazyComponent != null) {
        return LazyPromise
      }

      console.log("LazyComponent: Loading...", options.id)
      this.setState({
        loading: true
      })

      LazyLoading = true
      LazyPromise = Promise.all(options.load(this.props.language)).then((result) => {
        console.log("LazyComponent: Done!", options.id)

        LazyComponent = injectIntl(result[0].default)
        LazyMessages = result[1]
        LazyLoading = false

        this.setState({
          loading: LazyLoading,
          component: LazyComponent,
          messages: LazyMessages
        })
      })

      return LazyPromise
    }

    componentDidMount() {
      if (!LazyPromise) {
        this.fetchData()
      }
    }

    render() {
      if (!LazyComponent) {
        return null
      }

      const { locale, ...props } = this.props

      var WrappedComponent = (
        <IntlProvider locale={locale} messages={LazyMessages}>
          <LazyComponent {...props} />
        </IntlProvider>
      )

      return WrappedComponent
    }
  }

  LazyComponentWrapper.propTypes = {
    children: React.PropTypes.node,
    locale: React.PropTypes.string,
    language: React.PropTypes.string,
    intl: React.PropTypes.object
  }

  const mapStateToProps = (state, ownProps) => ({
    locale: getLocale(state),
    language: getLanguage(state)
  })

  return connect(mapStateToProps)(LazyComponentWrapper)
}
