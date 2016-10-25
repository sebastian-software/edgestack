import express from "express"
// import compression from "compression"
import shrinkRay from "shrink-ray"
import hpp from "hpp"
import helmet from "helmet"

import {
  ABSOLUTE_CLIENT_OUTPUT_PATH,
  ABSOLUTE_PUBLIC_DIR_PATH
} from "./config"

export default function generateServer()
{
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

  // Response compression (plain and fast gzip)
  // app.use(compression())

  // Advanced response compression using a async zopfli/brotli combination
  // https://github.com/aickin/shrink-ray
  app.use(shrinkRay())

  // Configure static serving of our webpack bundled client files.
  app.use(
    process.env.CLIENT_BUNDLE_HTTP_PATH,
    express.static(ABSOLUTE_CLIENT_OUTPUT_PATH, {
      maxAge: process.env.CLIENT_BUNDLE_CACHE_MAXAGE
    })
  )

  // Configure static serving of our "public" root http path static files.
  app.use(express.static(ABSOLUTE_PUBLIC_DIR_PATH))

  return app
}
