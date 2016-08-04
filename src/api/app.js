import React from "react"
import About from "../components/About"
import { render } from "react-dom"

function App() {
  return (
    <About></About>
  )
}

export default App

if (process.env.TARGET === "client")
{
  var root = document.getElementById("root-app")
  render(<App></App>, root);
}
