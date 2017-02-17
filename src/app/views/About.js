import React from "react"
import Helmet from "react-helmet"
import { connect } from "react-redux"
import markdown from "markdown-in-js"
import { FormattedDate, FormattedMessage, FormattedRelative } from "react-intl"
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

class About extends React.Component {
  componentDidMount() {
    // Good strategy to load relevant data: wait after rendering
    // so that the user sees the empty state. We can't really wait
    // in render sequence for any data coming in.
    return this.props.value == null ? this.props.load() : null
  }

  fetchData()
  {
    // Load data on all preparation steps e.g. on SSR and also on rehydration on client
    // when intially loading this route.
    return this.props.value == null ? this.props.load() : null
  }

  renderMarkdown() {
    return markdown`Markdown in React is **pretty useful**.`
  }

  render() {
    console.log("- About: render()")
    return (
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
