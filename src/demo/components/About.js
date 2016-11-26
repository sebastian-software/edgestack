import React from "react"
import Helmet from "react-helmet"
import { connect } from "react-redux"
import { get } from "lodash"

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
          Executed at: {this.props.time}
        </p>
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




function getTime(state) {
  var time = get(state, "app.time")
  return time ? new Date(time).toISOString() : "Loading..."
}

function setTime(time) {
  return {
    type: SET_TIME,
    now: time
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    time: getTime(state)
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
