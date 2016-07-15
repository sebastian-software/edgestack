import React from "react"
import Button from "./Button"
import Styles from "./About.css"

function About() {
  return (
    <article>
      <p className={Styles.intro}>
        Produced with ❤️ by <a href="https://github.com/sebastiansoft">Sebastian Software</a>
        <Button onClick={() => alert("clicked")}>Click me</Button>
      </p>
    </article>
  )
}

export default About
