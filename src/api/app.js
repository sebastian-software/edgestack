import React from "react"
import About from "../components/About"
import Button from "../components/Button"
import { render } from "react-dom"
import { renderToString } from "react-dom/server"

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

function generateHtml(reolve, reject) {
  console.log("CALLED GENERATE...")
  return new Promise(function(resolve, reject)
  {
    var html =
      universalRender(<About></About>, "first") +
      universalRender(<About></About>, "second") +
      universalRender(<Button onClick={handleClick}>Increase</Button>, "third")

    resolve(html)
  });
}

if (process.env.TARGET === "client") {
  generateHtml()
}

export {
  generateHtml
}
