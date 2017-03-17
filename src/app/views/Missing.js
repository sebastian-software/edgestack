import React from "react"
import { FormattedMessage } from "react-intl"
import Styles from "./Missing.css"

function Missing() {
  return <div>Sorry, that page was not found.</div>
}

Missing.propTypes = {
  intl: React.PropTypes.object
}

export default Missing
