import "normalize.css/normalize.css"
import "./Fonts.css"

import React, { PropTypes } from "react"
import Link from "react-router/lib/Link"
import Helmet from "react-helmet"
import { camelCase } from "lodash-es"
import styles from "./App.css"

const websiteDescription = "A NodeJS V6 Universal React Boilerplate with an Amazing Developer Experience."

console.log("ES Modules Supported:", camelCase("hello-world") === "helloWorld")

function App({ children }) {
  return (
    <main>
      <Helmet
        htmlAttributes={{ lang: "en" }}
        titleTemplate="Advanced Boilerplate - %s"
        defaultTitle="Advanced Boilerplate"
        meta={[
          { name: "description", content: websiteDescription },
        ]}
      />

      <div>
        <h1>Advanced Boilerplate</h1>
        <strong>{websiteDescription}</strong>
      </div>
      <div>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
        </ul>
      </div>
      <div>
        {children}
      </div>
    </main>
  )
}

App.propTypes = {
  children: PropTypes.node
}

export default App
