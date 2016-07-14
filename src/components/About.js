import React from "react"
import Styles from "./About.css"

function About() {
  return (
    <article>
      <p className={Styles.intro}>
        Produced with ❤️ by <a href="https://github.com/sebastiansoft">Sebastian Software</a>
      </p>
    </article>
  )
}

export default About
