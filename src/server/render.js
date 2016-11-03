import { renderToString } from "react-dom/server"
import serialize from "serialize-javascript"
import Helmet from "react-helmet"
import { readFileSync } from "fs"

import { ABSOLUTE_ASSETSINFO_PATH, ABSOLUTE_CHUNKMANIFEST_PATH } from "./config"

var chunkManifest = "{}"
if (process.env.MODE === "production")
{
  try {
    chunkManifest = readFileSync(ABSOLUTE_CHUNKMANIFEST_PATH, "utf-8")
  } catch (ex) {
    console.warn("Could not parse chunkhashes from manifest.json: ", ex)
  }
}

const clientAssets = JSON.parse(
  readFileSync(ABSOLUTE_ASSETSINFO_PATH, "utf-8")
)

// Convert the assets json it into an object that contains all the paths to our
// javascript and css files.  Doing this is required as for production
// configurations we add a hash to our filenames, therefore we won't know the
// paths of the output by webpack unless we read them from the assets.json file.
const chunks = Object.keys(clientAssets).map((key) => clientAssets[key])
const assets = chunks.reduce((sorted, chunk) =>
{
  if (chunk.js) {
    if (chunk.js.indexOf("/vendor-") !== -1) {
      sorted.scripts.unshift(chunk.js)
    } else {
      sorted.scripts.push(chunk.js)
    }
  }
  if (chunk.css) {
    if (chunk.css.indexOf("/vendor-") !== -1) {
      sorted.styles.unshift(chunk.css)
    } else {
      sorted.styles.push(chunk.css)
    }
  }
  return sorted
}, { scripts: [], styles: [] })


/**
 *
 *
 */
function styleTags(styles) {
  return styles
    .map((style) =>
      `<link href="${style}" media="screen, projection" rel="stylesheet" />`
    )
    .join("\n")
}


/**
 *
 *
 */
function scriptTags(scripts) {
  return scripts
    .map((script) =>
      `<script src="${script}"></script>`
    )
    .join("\n")
}


// We use a service worker configured created by the sw-precache webpack plugin,
// providing us with prefetched caching and offline application support.
// @see https://github.com/goldhand/sw-precache-webpack-plugin
function serviceWorkerScript(nonce) {
  if (process.env.NODE_ENV === "production") {
    return `
      <script nonce="${nonce}">
        (function swRegister() {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js');
          }
        }());
      </script>`
  }

  return ""
}

/**
 * Generates a full HTML page containing the render output of the given react
 * element.
 *
 * @param  rootReactElement
 *   [Optional] The root React element to be rendered on the page.
 * @param  initialState
 *   [Optional] The initial state for the redux store which will be used by the
 *   client to mount the redux store into the desired state.
 *
 * @return The full HTML page in the form of a React element.
 */
export default function render({ app, initialState, nonce }) {
  const appString = app ? renderToString(app) : null

  // We run 'react-helmet' after our renderToString call so that we can fish
  // out all the attributes which need to be attached to our page.
  // React Helmet allows us to control our page header contents via our
  // components.
  const helmet = app ? Helmet.rewind() : null

  return `<!doctype html>
    <html ${helmet ? helmet.htmlAttributes.toString() : ""}>
      <head>
        ${helmet ? helmet.title.toString() : ""}
        ${helmet ? helmet.meta.toString() : ""}
        ${helmet ? helmet.link.toString() : ""}

        ${styleTags(assets.styles)}
        ${helmet ? helmet.style.toString() : ""}

        ${serviceWorkerScript(nonce)}
      </head>
      <body>
        <div id="app">${appString || ""}</div>

        <script nonce="${nonce}">${
          (initialState ? `window.APP_STATE=${serialize(initialState)};` : "") +
          `window.CHUNK_MANIFEST=${chunkManifest};`
        }</script>

        ${scriptTags(assets.scripts)}
        ${helmet ? helmet.script.toString() : ""}
      </body>
    </html>`
}
