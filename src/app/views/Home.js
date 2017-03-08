import React from "react"
import Helmet from "react-helmet"

import Styles from "./Home.css"

import Tweets from "../graphql/Tweets.gql"
console.log("Loading GraphQL queries works:", Tweets.kind === "Document")

import { format } from "date-fns"
console.log("Today:", format(Date.now(), "DD.MM.YYYY"))

function Home({ intl }) {
  return (
    <article>
      <Helmet title={intl.formatMessage({ id: "title" })}/>
      <div className={Styles.preloader} />
      <p>
        Home Component
      </p>
    </article>
  )
}

Home.propTypes = {
  intl: React.PropTypes.object
}

export default Home
