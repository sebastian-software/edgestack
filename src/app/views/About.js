import React from "react"
import Helmet from "react-helmet"
import { connect } from "react-redux"
import markdown from "markdown-in-js"
import { IntlProvider, FormattedDate, FormattedMessage, FormattedRelative } from "react-intl"
import { addDays } from "date-fns"

import Styles from "./About.css"
import { getCounter, decrementCounter, incrementCounter, loadCounter } from "../modules/CounterModule"
import { getLanguage } from "../../common/State"

/**
 * @deprecated
 */
function handleOldMethodCall() {
  // nothing to do
}

const localMessages = {

}


class About extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      messages: {}
    }

    /*
    if (props.language) {
      import("./messages/About." + props.language + ".json").then((messages) => {
        this.setState({ messages })
      })
    }
    */
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.language != null) {
      console.log("Loading view specific messages:", nextProps.language)
      import("./messages/About." + nextProps.language + ".json").then((messages) => {
        this.setState({ messages })
      })
    }

  }

  componentDidMount() {
    // Good strategy to load relevant data: wait after rendering
    // so that the user sees the empty state. We can't really wait
    // in render sequence for any data coming in.
    if (this.props.value == null) {
      this.props.load()
    }
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
      <IntlProvider messages={this.state.messages}>
      <article>
        <Helmet title="About" />
        <p>
          <FormattedMessage id="counter" values={{ value: this.props.value }}/>
        </p>
        <p>
          <FormattedMessage id="localTest" values={{ pi: 3.14 }}/>
        </p>
        <p>
          Today: <br/>
          <FormattedDate
            value={Date.now()}
            year="numeric"
            month="long"
            day="numeric"
            weekday="long"
          />
        </p>
        <p>
          Yesterday:<br/>
          <FormattedRelative value={addDays(Date.now(), -1)}/>
        </p>
        <p>
          <button className={Styles.button} onClick={this.props.handleDecrement}>Decrement</button>
          &#160;
          <button className={Styles.button} onClick={this.props.handleIncrement}>Increment</button>
          &#160;
          <button className={Styles.button} onClick={handleOldMethodCall}>Deprecated Test</button>
        </p>
        {this.renderMarkdown()}
        <p className={Styles.intro}>
          <a href="https://github.com/sebastian-software">Produced with ❤ by Sebastian Software</a>
        </p>
      </article>
      </IntlProvider>
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
  language: getLanguage(state),
  value: getCounter(state)
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleIncrement: () => dispatch(incrementCounter()),
  handleDecrement: () => dispatch(decrementCounter()),
  load: () => dispatch(loadCounter())
})

export default connect(mapStateToProps, mapDispatchToProps)(About)
