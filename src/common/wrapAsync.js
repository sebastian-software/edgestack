import React from "react"
import { IntlProvider } from "react-intl"

export default function wrapAsync(loader, language)
{
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
      if (this.constructor.childView) {
        return
      }

      console.log("- Async Component: fetchData()")

      this.setState({ loading: true })

      return loader().then((result) =>
      {
        let [ View, messages ] = result

        if (View && View.default) {
          View = View.default
        }

        this.constructor.messages = messages
        this.constructor.childView = View

        this.setState({ loading: false })

        console.log("- Async Component: Everything loaded!")
      })
    }

    render() {
      var View = this.constructor.childView
      var messages = this.constructor.messages
      console.log("- Async Component: render():", Boolean(View))

      return View ?
        <IntlProvider messages={messages}>
          <View/>
        </IntlProvider>
      : null
    }
  }

  return AsyncComponent
}
