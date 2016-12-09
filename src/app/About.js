import React from "react"
import Helmet from "react-helmet"
import { connect } from "react-redux"
import markdown from "markdown-in-js"

import Styles from "./About.css"
import { getCounter, decrementCounter, incrementCounter, loadCounter } from "./CounterModule"

/**
 * @deprecated
 */
function oldMethod() {}

class About extends React.Component {
  componentWillMount() {
    if (this.props.value == null) {
      this.props.load()
    }
  }

  renderMarkdown() {
    return markdown`Markdown in React is **pretty useful**.`
  }

  render() {
    return (
      <article>
        <Helmet title="About" />
        <p>
          Counter: {this.props.value}
        </p>
        <p>
          <button className={Styles.button} onClick={this.props.handleDecrement}>Decrement</button>
          &#160;
          <button className={Styles.button} onClick={this.props.handleIncrement}>Increment</button>
          &#160;
          <button className={Styles.button} onClick={oldMethod}>Deprecated Test</button>
        </p>
        <p>
          {this.renderMarkdown()}
        </p>
        <p className={Styles.intro}>
          <a href="https://github.com/sebastian-software">Produced with ❤ by Sebastian Software</a>
        </p>
      </article>
    )
  }
}

About.fetchData = function(props, context)
{
  // Redux' connect() add proxies for static methods, but the top-level HOC
  // does not have our required and connected state/dispatcher props.
  if (props.load) {
    return props.load()
  }

  return Promise.resolve()
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
