import React from "react"
import { FormattedMessage } from "react-intl"
import PropTypes from "prop-types"

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
  staticContext: PropTypes.object,
  intl: PropTypes.object
}

export default Missing
