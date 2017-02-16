import React from "react"
import Helmet from "react-helmet"

import Styles from "./Home.css"

import CurrentUser from "../graphql/CurrentUser.gql"
console.log("Loading GraphQL queries works:", CurrentUser.kind === "Document")

import { format } from "date-fns"
console.log("Today:", format(Date.now(), "DD.MM.YYYY"))

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
