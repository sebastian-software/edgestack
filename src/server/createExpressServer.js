import express from "express"
import shrinkRay from "shrink-ray"
import uuid from "uuid"
import parameterProtection from "hpp"
import helmet from "helmet"
import PrettyError from "pretty-error"
import favicon from "serve-favicon"
import createLocaleMiddleware from "express-locale"
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"

import {
  ABSOLUTE_CLIENT_OUTPUT_PATH,
  ABSOLUTE_PUBLIC_PATH
} from "./config"

import Config from "../app/Config.yml"

const pretty = new PrettyError()

// this will skip events.js and http.js and similar core node files
pretty.skipNodeFiles()

// this will skip all the trace lines about express` core and sub-modules
pretty.skipPackage("express")

export default function createExpressServer()
{
  // Create our express based server.
  const server = express()

  // Create new middleware to serve a favicon from the given path to a favicon file.
  server.use(favicon(`${ABSOLUTE_PUBLIC_PATH}/favicon.ico`))

  // Attach a unique "nonce" to every response. This allows use to declare
  // inline scripts as being safe for execution against our content security policy.
  // @see https://helmetjs.github.io/docs/csp/
  server.use((request, response, next) => {
    response.locals.nonce = uuid() // eslint-disable-line no-param-reassign
    next()
  })

  // and use it for our app's error handler:
  server.use((error, request, response, next) => { // eslint-disable-line max-params
    console.log(pretty.render(error))
    next()
  })

  // Don't expose any software information to hackers.
  server.disable("x-powered-by")

  // Prevent HTTP Parameter pollution.
  server.use(parameterProtection())

  // Content Security Policy (CSP)
  //
  // If you are unfamiliar with CSPs then I highly recommend that you do some
  // reading on the subject:
  //  - https://content-security-policy.com/
  //  - https://developers.google.com/web/fundamentals/security/csp/
  //  - https://developer.mozilla.org/en/docs/Web/Security/CSP
  //  - https://helmetjs.github.io/docs/csp/
  //
  // If you are relying on scripts/styles/assets from other servers (internal or
  // external to your company) then you will need to explicitly configure the
  // CSP below to allow for this.  For example you can see I have had to add
  // the polyfill.io CDN in order to allow us to use the polyfill script.
  // It can be a pain to manage these, but it's a really great habit to get in
  // to.
  //
  // You may find CSPs annoying at first, but it is a great habit to build.
  // The CSP configuration is an optional item for helmet, however you should
  // not remove it without making a serious consideration that you do not require
  // the added security.
  const cspConfig = {
    directives: {
      defaultSrc: [ "'self'" ],

      scriptSrc:
      [
        // Allow scripts hosted from our application.
        "'self'",

        // Note: We will execution of any inline scripts that have the following
        // nonce identifier attached to them.
        // This is useful for guarding your application whilst allowing an inline
        // script to do data store rehydration (redux/mobx/apollo) for example.
        // @see https://helmetjs.github.io/docs/csp/
        (request, response) => `'nonce-${response.locals.nonce}'`,

        // FIXME: Required for eval-source-maps (devtool in webpack)
        process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""
      ].filter((value) => value !== ""),

      styleSrc: [ "'self'", "'unsafe-inline'", "blob:" ],
      imgSrc: [ "'self'", "data:" ],
      fontSrc: [ "'self'", "data:" ],

      // Note: Setting this to stricter than * breaks the service worker. :(
      // I can't figure out how to get around this, so if you know of a safer
      // implementation that is kinder to service workers please let me know.
      // ["'self'", 'ws:'],
      connectSrc: [ "*" ],

      // objectSrc: [ "'none'" ],
      // mediaSrc: [ "'none'" ],

      childSrc: [ "'self'" ]
    }
  }

  if (process.env.NODE_ENV === "development") {
    // When in development mode we need to add our secondary express server that
    // is used to host our client bundle to our csp config.
    Object.keys(cspConfig.directives).forEach((directive) =>
      cspConfig.directives[directive].push(`localhost:${process.env.CLIENT_DEVSERVER_PORT}`)
    )
  }

  server.use(helmet.contentSecurityPolicy(cspConfig))

  // The xssFilter middleware sets the X-XSS-Protection header to prevent
  // reflected XSS attacks.
  // @see https://helmetjs.github.io/docs/xss-filter/
  server.use(helmet.xssFilter())

  // Frameguard mitigates clickjacking attacks by setting the X-Frame-Options header.
  // @see https://helmetjs.github.io/docs/frameguard/
  server.use(helmet.frameguard("deny"))

  // Sets the X-Download-Options to prevent Internet Explorer from executing
  // downloads in your site’s context.
  // @see https://helmetjs.github.io/docs/ienoopen/
  server.use(helmet.ieNoOpen())

  // Don’t Sniff Mimetype middleware, noSniff, helps prevent browsers from trying
  // to guess (“sniff”) the MIME type, which can have security implications. It
  // does this by setting the X-Content-Type-Options header to nosniff.
  // @see https://helmetjs.github.io/docs/dont-sniff-mimetype/
  server.use(helmet.noSniff())

  // Parse cookies via standard express tooling
  server.use(cookieParser())

  // Detect client locale and match it with configuration
  server.use(createLocaleMiddleware({
    priority: [ "query", "cookie", "accept-language", "default" ],
    default: Config.DEFAULT_LOCALE.replace(/-/, "_"),
    allowed: Config.ALLOWED_LOCALES.map((entry) => entry.replace(/-/, "_"))
  }))

  // Parse application/x-www-form-urlencoded
  server.use(bodyParser.urlencoded({ extended: false }))

  // Parse application/json
  server.use(bodyParser.json())

  // Advanced response compression using a async zopfli/brotli combination
  // https://github.com/aickin/shrink-ray
  server.use(shrinkRay())

  // Configure static serving of our webpack bundled client files.
  server.use(
    process.env.CLIENT_BUNDLE_HTTP_PATH,
    express.static(ABSOLUTE_CLIENT_OUTPUT_PATH, {
      maxAge: process.env.CLIENT_BUNDLE_CACHE_MAXAGE
    })
  )

  // Configure static serving of our "public" root http path static files.
  server.use(express.static(ABSOLUTE_PUBLIC_PATH))

  return server
}
