// This grants us source map support, which is handy as our webpack bundling
// for the server will include source maps. Therefore we will have nice stack
// traces again for our server.
import "source-map-support/register"

import express from "express"
import compression from "compression"
import hpp from "hpp"
import helmet from "helmet"

import React from "react"
import { renderToString } from "react-dom/server"

import ClientBundleAssets from "../../build/client/assets.json"
import Button from "../components/Button"

// Create our express based server.
const app = express()

// Don't expose any software information to hackers.
app.disable("x-powered-by")

// Prevent HTTP Parameter pollution.
app.use(hpp())

// Content Security Policy
app.use(helmet.contentSecurityPolicy({
  defaultSrc: [ "'self'" ],
  scriptSrc: [ "'self'" ],
  styleSrc: [ "'self'" ],
  imgSrc: [ "'self'" ],
  connectSrc: [ "'self'", "ws:" ],
  fontSrc: [ "'self'" ],
  objectSrc: [ "'none'" ],
  mediaSrc: [ "'none'" ],
  frameSrc: [ "'none'" ],
}))

app.use(helmet.xssFilter())
app.use(helmet.frameguard("deny"))
app.use(helmet.ieNoOpen())
app.use(helmet.noSniff())

// Response compression.
app.use(compression())

// Configure static serving of our webpack bundled client files.
app.use(process.env.PUBLIC_PATH, express.static(process.env.OUTPUT_PATH))

// Test
app.get('/button/:label', function (request, response)
{
  console.log("ASSETS: ", ClientBundleAssets)

  if (true)
  {

    const html = renderToString( <Button>{request.params.label}</Button> )
    const js = ClientBundleAssets.main.js;
    const css = ClientBundleAssets.main.css;

    var page = `
      <link rel="stylesheet" href="${css}"/>
      ${html}
      <script src="${js}"></script>
    `

    response.status(200).send(page)
  }
  else
  {
    response.status(404).send("Not found")
  }
});

// Create an http listener for our express app.
const listener = app.listen(parseInt(process.env.API_PORT, 10))

// User feedback
console.log(`Running server at port ${process.env.API_PORT}.`)

// We export the listener as it will be handy for our development hot reloader.
export default listener
