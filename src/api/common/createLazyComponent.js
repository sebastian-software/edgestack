import React from "react"
import { connect } from "react-redux"
import { injectIntl, IntlProvider } from "react-intl"
import PropTypes from "prop-types"

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
        loading: LazyLoading
      }
    }

    componentDidMount()
    {
      // This callback is only executed on the client side
      // We have to manually call fetchData there as this is our own infrastructure for
      // loading data and typically not being executed on the client by the normal React render flow.
      if (!LazyPromise) {
        this.fetchData()
      }
    }

    fetchData()
    {
      if (this.state.loading === false && LazyComponent == null)
      {
        // Toggle loading state even when this is not the initating instance
        this.setState(() => ({
          loading: true
        }))
      }

      // Return existing promise from some other initiator... or when called two times in a row.
      if (LazyPromise != null) {
        return LazyPromise
      }

      LazyLoading = true
      LazyPromise = Promise.all(options.load(this.props.language)).then((result) => {
        LazyLoading = false

        // Map component. We have to use the default export, because import() does not
        // do this automatically. We also directly inject the intl object for easy
        // message translation via API.
        LazyComponent = injectIntl(result[0].default)

        // Store the messages of the given language for later access
        LazyMessages = result[1]

        // Stop loading indicator
        this.setState(() => ({
          loading: LazyLoading
        }))

        return true
      })

      return LazyPromise
    }

    render()
    {
      if (!LazyComponent) {
        return null
      }

      const { locale, ...props } = this.props

      var IntlWrappedComponent = (
        <IntlProvider locale={locale} messages={LazyMessages}>
          <LazyComponent {...props} />
        </IntlProvider>
      )

      return IntlWrappedComponent
    }
  }

  LazyComponentWrapper.propTypes =
  {
    children: PropTypes.node,
    locale: PropTypes.string,
    language: PropTypes.string,
    intl: PropTypes.object
  }

  const mapStateToProps = (state, ownProps) => ({
    locale: getLocale(state),
    language: getLanguage(state)
  })

  return connect(mapStateToProps)(LazyComponentWrapper)
}
