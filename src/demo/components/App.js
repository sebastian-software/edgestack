import "normalize.css/normalize.css"
import "./Fonts.css"

import React, { PropTypes } from "react"
import Link from "react-router/lib/Link"

const websiteDescription = "A NodeJS V6 Universal React Boilerplate with an Amazing Developer Experience."

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
        script={[
          { src: "https://cdn.polyfill.io/v2/polyfill.min.js", type: "text/javascript" },
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
