import React from "react"
import About from "../components/About"
import Button from "../components/Button"
import { render } from "react-dom"
import { renderToString } from "react-dom/server"

function App() {
  return (
    <About></About>
  )
}

export default App

/*
System.import("./components/About")
    .then((module) => cb(null, module.default))
    .catch(handleError)
*/

function universalRender(component, target)
{
  if (process.env.TARGET === "client")
    render(component, document.getElementById(target))
  else
    return `<div id=${target}>${renderToString(component)}</div>`
}

var counter = 33;
function handleClick() {
  console.log(counter++)
}

var myApp1 = <App></App>
var myApp2 = <App></App>
var myButton = <Button onClick={handleClick}>Increase</Button>;

var html =
  universalRender(myApp1, "first") +
  universalRender(myApp2, "second") +
  universalRender(myButton, "third")

export {
  html
}
