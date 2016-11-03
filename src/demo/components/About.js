import React from "react"
import Helmet from "react-helmet"

import Button from "./Button"
import Styles from "./About.css"

function About() {
  return (
    <article>
      <Helmet title="About" />
      <p>
        <Button onClick={() => alert("clicked")}>Rehydrated Button</Button>
      </p>
      <p className={Styles.intro}>
        Produced with ❤️ by <a href="https://github.com/sebastiansoft">Sebastian Software</a>
      </p>
    </article>
  )
}

export default About
