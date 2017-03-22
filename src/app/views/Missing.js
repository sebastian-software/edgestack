import React from "react"
import { FormattedMessage } from "react-intl"
import { Route } from "react-router-dom"
import Styles from "./Missing.css"

function Missing({ staticContext }) {
  if (staticContext) {
    staticContext.status = 404
  }

  return (
    <div>Sorry, that page was not found.</div>
  )
}

Missing.propTypes = {
  intl: React.PropTypes.object
}

export default Missing
