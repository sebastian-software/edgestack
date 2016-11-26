import React from "react"
import Helmet from "react-helmet"
import { connect } from "react-redux"

import Button from "./Button"
import Styles from "./About.css"

class About extends React.Component {
  static fetchData(props, context) {
    if (props.updateTime) {
      console.log("Fetching data for <About>...")
      return new Promise((resolve, reject) => {
        console.log(props.updateTime())
        resolve()
      })
    }
  }

  handleClick() {
    alert("Clicked!")
  }

  render() {
    return(
      <article>
        <Helmet title="About" />
        <p>
          <Button onClick={this.handleClick}>Rehydrated Button</Button>
        </p>
        <p className={Styles.intro}>
          Produced with ❤ by <a href="https://github.com/sebastian-software">Sebastian Software</a>
        </p>
      </article>
    )
  }
}

const SET_TIME = "SET_TIME"

function setTime(time) {
  return {
    type: SET_TIME,
    now: time
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    // fill me
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updateTime: () => {
      dispatch(setTime(new Date()))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(About)
