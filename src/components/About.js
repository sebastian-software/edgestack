import React from "react"
import Markdown from "react-markdown"

import Button from "./Button"
import Styles from "./About.css"

const content = `
# Hello from Markdown

This is a paragraph rendered using Markdown.

* First Argument
* Second Argument
* Third Argument
`

function About() {
  return (
    <article>
      <p className={Styles.intro}>
        Produced with ❤️ by <a href="https://github.com/sebastiansoft">Sebastian Software</a>
        <Button onClick={() => alert("clicked")}>Click me</Button>
        <Button onClick={() => alert("clicked")} disabled>Can't click me</Button>
      </p>
      <Markdown source={content}></Markdown>
    </article>
  )
}

export default About
