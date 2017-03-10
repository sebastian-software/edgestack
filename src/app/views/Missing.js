import React from "react"
import { injectIntl, FormattedMessage } from "react-intl"
import Styles from "./Missing.css"

function Missing() {
  return <div>Sorry, that page was not found.</div>
}

Missing.propTypes = {
  intl: React.PropTypes.object
}

export default injectIntl(Missing)
