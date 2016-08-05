import React from "react"
import { render } from "react-dom"
import { renderToString } from "react-dom/server"

// Universal server-/client-side component rendering engine
export function universalRender(component, targetId)
{
  if (typeof component === "function") {
    component = React.createElement(component)
  }

  if (process.env.TARGET === "client")
    render(component, document.getElementById(targetId))
  else
    return `<div id=${targetId}>${renderToString(component)}</div>`
}

// Promise-based HTML generator / renderer
export function dynamicRender()
{
  return new Promise(function(resolve, reject)
  {
    Promise.all([
      System.import("../components/About").then((module) => universalRender(module.default, "first")),
      System.import("../components/About").then((module) => universalRender(module.default, "second"))
    ]).then(function(result) {
      resolve(result.join(""))
    }).catch(function(err) {
      reject("Unable to render result: ", err)
    })
  });
}

// Automatically execute rendering chain on client for rehydration
if (process.env.TARGET === "client") {
  dynamicRender()
}
