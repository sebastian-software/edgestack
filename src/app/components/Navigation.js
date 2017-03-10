import React from "react"
import { injectIntl, FormattedMessage } from "react-intl"
import { NavLink } from "react-router-dom"
import Styles from "./Navigation.css"

function Navigation({ intl }) {
  return (
    <ul className={Styles.list}>
      <li><NavLink exact to="/" activeClassName={Styles.activeLink}>Home</NavLink></li>
      <li><NavLink to="/about" activeClassName={Styles.activeLink}>About</NavLink></li>
      <li><NavLink to="/missing" activeClassName={Styles.activeLink}>Missing</NavLink></li>
    </ul>
  )
}

Navigation.propTypes = {
  intl: React.PropTypes.object
}

export default injectIntl(Navigation)
