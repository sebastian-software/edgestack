import React from "react"
import Helmet from "react-helmet"
import { connect } from "react-redux"
import markdown from "markdown-in-js"
import cookiesjs from "cookiesjs"
import { FormattedMessage } from "react-intl"

// Clipboard handling is only supported on the client
// Logical, but there are code limitations preventing a successful execution on server, too.
if (process.env.TARGET === "web") {
  var Clipboard = require("clipboard")
}

import Styles from "./About.css"
import { getCounter, decrementCounter, incrementCounter, loadCounter } from "./CounterModule"

/**
 * @deprecated
 */
function handleOldMethodCall() {
  // nothing to do
}

class About extends React.Component {
  componentDidMount() {
    // Good strategy to load relevant data: wait after rendering
    // so that the user sees the empty state. We can't really wait
    // in render sequence for any data coming in.
    if (this.props.value == null) {
      this.props.load()
    }

    cookiesjs({ test: 123 })
    new Clipboard("[data-clipboard-target]")
  }

  handleClickCookieLink() {
    /* eslint-disable no-alert */
    alert(cookiesjs("test"))
  }

  renderMarkdown() {
    return markdown`Markdown in React is **pretty useful**.`
  }

  fetchData()
  {
    console.log("Called fetchData()...")

    // Redux' connect() add proxies for static methods, but the top-level HOC
    // does not have our required and connected state/dispatcher props.
    //
    if (this.props.load) {
      return this.props.load()
    }

    return Promise.resolve()
  }

  render() {
    return (
      <article>
        <Helmet title="About" />
        <p>
          <FormattedMessage id="counter" values={{ value: this.props.value }}/>
        </p>
        <p>
          <button className={Styles.button} onClick={this.props.handleDecrement}>Decrement</button>
          &#160;
          <button className={Styles.button} onClick={this.props.handleIncrement}>Increment</button>
          &#160;
          <button className={Styles.buttonSmall} onClick={handleOldMethodCall}>Deprecated Test</button>
          &#160;
          <button className={Styles.buttonSmall} onClick={this.handleClickCookieLink}>Show Cookie</button>
          &#160;
          <input type="text" id="clipboard-source" defaultValue="some random content" />
          <button className={Styles.buttonSmall} data-clipboard-target="#clipboard-source">Copy to Clipboard</button>
        </p>
        {this.renderMarkdown()}
        <p className={Styles.intro}>
          <a href="https://github.com/sebastian-software">Produced with ❤ by Sebastian Software</a>
        </p>
      </article>
    )
  }
}

About.propTypes = {
  value: React.PropTypes.number,
  load: React.PropTypes.func,
  handleIncrement: React.PropTypes.func,
  handleDecrement: React.PropTypes.func
}

const mapStateToProps = (state, ownProps) => ({
  value: getCounter(state)
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleIncrement: () => dispatch(incrementCounter()),
  handleDecrement: () => dispatch(decrementCounter()),
  load: () => dispatch(loadCounter())
})

export default connect(mapStateToProps, mapDispatchToProps)(About)
