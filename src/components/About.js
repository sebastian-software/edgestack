import React from "react"
import Button from "./Button"
import Markdown from "react-markdown"
import Styles from "./About.css"

function About() {
  return (
    <article>
      <p className={Styles.intro}>
        Produced with ❤️ by <a href="https://github.com/sebastiansoft">Sebastian Software</a>
        <Button onClick={() => alert("clicked")}>Click me</Button>
      </p>
      <Markdown source="# Hello from Markdown"></Markdown>
    </article>
  )
}

export default About
