// FIXME: waiting for release of fixed package.json entry. >= 4.1.0
import "sanitize.css/sanitize.css"

import React from "react"
import { Switch, Route, NavLink } from "react-router-dom"
import Helmet from "react-helmet"
import { IntlProvider } from "react-intl"
import { connect } from "react-redux"
import { getLocale, getLanguage, RouterConnector } from "advanced-boilerplate"

// Application specific
import "./Fonts.css"
import Styles from "./Root.css"

const websiteTitle = "Advanced Boilerplate"
const websiteDescription = "A Universal Apollo React Boilerplate with an Amazing Developer Experience."

function wrapAsync(loader, language)
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

AsyncRoute = connect((state, ownProps) => ({
  locale: getLocale(state),
  language: getLanguage(state)
}))(AsyncRoute)






const rootMessages = {
  counter: "Counter: {value, number}"
}

function Error404() {
  return <div>Sorry, that page was not found.</div>
}

function Root({ children, locale, language }) {
  return (
    <IntlProvider locale={locale} messages={rootMessages}>
      <main>
        <Helmet
          titleTemplate={`${websiteTitle} - %s`}
          defaultTitle={websiteTitle}
          meta={[
            { name: "charset", content: "utf-8" },
            { "http-equiv": "X-UA-Compatible", "content": "IE=edge" },
            { name: "viewport", content: "width=device-width, initial-scale=1" },
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
              <AsyncRoute exact path="/" load={(language) => [ import("./views/Home") ]}/>
              <AsyncRoute path="/about" load={(language) => [ import("./views/About"), import("./views/messages/About." + language + ".json") ]}/>
              <Route component={Error404}/>
            </Switch>
          </RouterConnector>
        </div>
      </main>
    </IntlProvider>
  )
}

Root.propTypes = {
  children: React.PropTypes.node,
  locale: React.PropTypes.string,
  language: React.PropTypes.string
}

const mapStateToProps = (state, ownProps) => ({
  locale: getLocale(state),
  language: getLanguage(state)
})

export default connect(mapStateToProps)(Root)
