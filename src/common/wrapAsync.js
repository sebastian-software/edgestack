import React from "react"
import { IntlProvider } from "react-intl"

export default function wrapAsync(loader, locale)
{
  let View = null
  let messages = null

  class AsyncComponent extends React.Component {
    constructor(props) {
      super(props)

      this.state = {
        loading: false
      }
    }

    componentWillMount() {
      if (process.env.TARGET === "web") {
        return this.fetchData()
      } else {
        console.log("- Async Component: componentWillMount()")
        return null
      }
    }

    fetchData()
    {
      if (View != null) {
        return null
      }

      console.log("- Async Component: fetchData()")

      this.setState({
        loading: true
      })

      return loader().then((result) =>
      {
        View = result[0]
        messages = result[1]

        if (View && View.default) {
          View = View.default
        }

        this.setState({
          loading: false
        })

        console.log("- Async Component: Everything loaded!")
      })
    }

    render() {
      console.log("- Async Component: render():", Boolean(View))

      return View ?
        <IntlProvider locale={locale} messages={messages}>
          <View/>
        </IntlProvider> : null
    }
  }

  return AsyncComponent
}
