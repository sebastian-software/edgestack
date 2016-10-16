import React from "react"
import Helmet from "react-helmet"

import Styles from "./Home.css"

function Home() {
  return (
    <article>
      <Helmet title="Home" />
      <div className={Styles.preloader}></div>
      <p>
        Home Component
      </p>
    </article>
  )
}

export default Home
