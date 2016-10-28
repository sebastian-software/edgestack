import React from "react"
import Helmet from "react-helmet"

import Button from "./Button"
import Styles from "./About.css"

function About() {
  return (
    <article>
      <Helmet title="About" />
      <p className={Styles.intro}>
        Produced with ❤️ by <a href="https://github.com/sebastiansoft">Sebastian Software</a>
        <Button onClick={() => alert("clicked")}>Click me</Button>
        <Button onClick={() => alert("clicked")} disabled>Can't click me</Button>
      </p>
    </article>
  )
}

export default About
