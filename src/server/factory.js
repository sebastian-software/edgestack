import express from "express"
import shrinkRay from "shrink-ray"
import uuid from 'node-uuid';
import hpp from "hpp"
import helmet from "helmet"
import { resolve } from "path"

import {
  ABSOLUTE_CLIENT_OUTPUT_PATH,
  ABSOLUTE_PUBLIC_PATH
} from "./config"

export function addFallbackHandler(app) {
  // Handle 404 errors.
  // Note: the react application middleware hands 404 paths, but it is good to
  // have this backup for paths not handled by the universal middleware. For
  // example you may bind a /api path to express.
  app.use((req, res, next) => {
    // eslint-disable-line no-unused-vars,max-len
    res.status(404).send('Sorry, that resource was not found.');
  });

  // Handle all other errors (i.e. 500).
  // Note: You must provide specify all 4 parameters on this callback function
  // even if they aren't used, otherwise it won't be used.
  app.use((err, req, res, next) => {
    // eslint-disable-line no-unused-vars,max-len
    if (err) {
      console.log(err);
      console.log(err.stack);
    }
    res.status(500).send('Sorry, an unexpected error occurred.');
  });
}

export default function generateServer()
{
  // Create our express based server.
  const app = express()

  // Attach a unique "nonce" to every response.  This allows use to declare
  // inline scripts as being safe for execution against our content security policy.
  // @see https://helmetjs.github.io/docs/csp/
  app.use((req, res, next) => {
    res.locals.nonce = uuid.v4(); // eslint-disable-line no-param-reassign
    next();
  });

  // Don't expose any software information to hackers.
  app.disable("x-powered-by")

  // Prevent HTTP Parameter pollution.
  app.use(hpp())

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
      defaultSrc: ["'self'"],

      scriptSrc:
      [
        // Allow scripts hosted from our application.
        "'self'",

        // Allow scripts from cdn.polyfill.io so that we can import the polyfill.
        // 'cdn.polyfill.io',

        // Note: We will execution of any inline scripts that have the following
        // nonce identifier attached to them.
        // This is useful for guarding your application whilst allowing an inline
        // script to do data store rehydration (redux/mobx/apollo) for example.
        // @see https://helmetjs.github.io/docs/csp/
        (req, res) => `'nonce-${res.locals.nonce}'`,

        // FIXME: Required for eval-source-maps (devtool in webpack)
        "'unsafe-eval'"
      ],

      styleSrc: ["'self'", "'unsafe-inline'", 'blob:'],
      imgSrc: ["'self'", 'data:'],

      // Note: Setting this to stricter than * breaks the service worker. :(
      // I can't figure out how to get around this, so if you know of a safer
      // implementation that is kinder to service workers please let me know.
      connectSrc: ['*'], // ["'self'", 'ws:'],

      fontSrc: ["'self'"],
      objectSrc: [],
      mediaSrc: [],
      childSrc: ["'self'"]
    }
  };

  if (process.env.NODE_ENV === 'development') {
    // When in development mode we need to add our secondary express server that
    // is used to host our client bundle to our csp config.
    Object.keys(cspConfig.directives).forEach((directive) =>
      cspConfig.directives[directive].push(`localhost:${process.env.CLIENT_DEVSERVER_PORT}`)
    )
  }

  app.use(helmet.contentSecurityPolicy(cspConfig));

  // The xssFilter middleware sets the X-XSS-Protection header to prevent
  // reflected XSS attacks.
  // @see https://helmetjs.github.io/docs/xss-filter/
  app.use(helmet.xssFilter());

  // Frameguard mitigates clickjacking attacks by setting the X-Frame-Options header.
  // @see https://helmetjs.github.io/docs/frameguard/
  app.use(helmet.frameguard('deny'));

  // Sets the X-Download-Options to prevent Internet Explorer from executing
  // downloads in your site’s context.
  // @see https://helmetjs.github.io/docs/ienoopen/
  app.use(helmet.ieNoOpen());

  // Don’t Sniff Mimetype middleware, noSniff, helps prevent browsers from trying
  // to guess (“sniff”) the MIME type, which can have security implications. It
  // does this by setting the X-Content-Type-Options header to nosniff.
  // @see https://helmetjs.github.io/docs/dont-sniff-mimetype/
  app.use(helmet.noSniff());

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
  app.use(express.static(ABSOLUTE_PUBLIC_PATH))

  // When in production mode, bind our service worker folder so that it can
  // be served.
  // Note: the service worker needs to be available at the http root of your
  // application for the offline support to work.
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(resolve(process.env.ABSOLUTE_CLIENT_OUTPUT_PATH, './serviceWorker')))
  }

  return app
}
