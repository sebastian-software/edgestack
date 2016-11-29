import React from "react"
import Helmet from "react-helmet"
import { connect } from "react-redux"

import Styles from "./About.css"
import { setCounter, getCounter, incrementCounter } from "./CounterModule"

function About(props) {
  return (
    <article>
      <Helmet title="About" />
      <p>
        Counter: {props.value}
      </p>
      <p>
        <button className={Styles.button} onClick={props.increment}>Increment</button>
      </p>
      <p className={Styles.intro}>
        <a href="https://github.com/sebastian-software">Produced with ❤ by Sebastian Software</a>
      </p>
    </article>
  )
}

About.fetchData = function(props, context) {
  if (props.reset) {
    console.log("Fetching initial counter for <About>...")
    return new Promise((resolve, reject) => {
      props.reset(Math.round(Math.random() * 100))
      resolve()
    })
  }

  return Promise.resolve()
}

About.propTypes = {
  value: React.PropTypes.number,
  increment: React.PropTypes.func,
  reset: React.PropTypes.func
}

const mapStateToProps = (state, ownProps) => ({
  value: getCounter(state)
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  increment: () => {
    dispatch(incrementCounter())
  },

  reset: (value) => {
    dispatch(setCounter(value == null ? 0 : value))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(About)
