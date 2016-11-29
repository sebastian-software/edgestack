import React from "react"
import Helmet from "react-helmet"

import Styles from "./Home.css"

import CurrentUser from "./CurrentUser.gql"
console.log("Loading GraphQL queries works:", CurrentUser.kind === "Document")

import Config from "./Config.yml"
console.log("Loading YAML works:", Config.colors.main != null)

function Home() {
  return (
    <article>
      <Helmet title="Home" />
      <div className={Styles.preloader} />
      <p>
        Home Component
      </p>
    </article>
  )
}

export default Home
