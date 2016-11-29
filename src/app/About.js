import React from "react"
import Helmet from "react-helmet"
import { connect } from "react-redux"

import Styles from "./About.css"
import { setCounter, getCounter, decrementCounter, incrementCounter } from "./CounterModule"

function About(props) {
  return (
    <article>
      <Helmet title="About" />
      <p>
        Counter: {props.value}
      </p>
      <p>
        <button className={Styles.button} onClick={props.handleDecrement}>Decrement</button>
        &#160;
        <button className={Styles.button} onClick={props.handleIncrement}>Increment</button>
      </p>
      <p className={Styles.intro}>
        <a href="https://github.com/sebastian-software">Produced with ❤ by Sebastian Software</a>
      </p>
    </article>
  )
}

About.fetchData = function(props, context)
{
  // Redux' connect() add proxies for static methods, but the top-level HOC
  // does not have our required and connected state/dispatcher props.
  if (props.reset != null)
  {
    console.log("Fetching initial data for <About>...")
    return new Promise((resolve, reject) =>
    {
      // Pseudo async code to simulate API latency
      setTimeout(() => {
        props.reset(Math.round(Math.random() * 100))
        resolve()
      }, 100)
    })
  }

  return Promise.resolve()
}

About.propTypes = {
  value: React.PropTypes.number,
  handleIncrement: React.PropTypes.func,
  handleDecrement: React.PropTypes.func,
  reset: React.PropTypes.func
}

const mapStateToProps = (state, ownProps) => ({
  value: getCounter(state)
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleIncrement: () => {
    dispatch(incrementCounter())
  },

  handleDecrement: () => {
    dispatch(decrementCounter())
  },

  reset: (value) => {
    dispatch(setCounter(value == null ? 0 : value))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(About)
