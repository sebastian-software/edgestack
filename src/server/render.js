import { renderToString } from "react-dom/server"
import serialize from "serialize-javascript"
import Helmet from "react-helmet"
import { readFileSync } from "fs"

import assets from "./assets"

import { CLIENT_CHUNKHASHES_MANIFESTJSON_FILEPATH } from "./config"

var ClientChunkManifest = "{}"
if (process.env.MODE === "production")
{
  try{
    ClientChunkManifest = readFileSync(CLIENT_CHUNKHASHES_MANIFESTJSON_FILEPATH, "utf-8")
  } catch(ex) {
    console.warn("Could not parse chunkhashes from manifest.json: ", ex)
  }
}

function styleTags(styles) {
  return styles
    .map(style =>
      `<link href="${style}" media="screen, projection" rel="stylesheet" />`
    )
    .join('\n')
}

function scriptTags(scripts) {
  return scripts
    .map(script =>
      `<script src="${script}"></script>`
    )
    .join('\n')
}

const styles = styleTags(assets.styles)
const scripts = scriptTags(assets.scripts)

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
function render(rootReactElement, initialState) {
  const reactRenderString = rootReactElement
    ? renderToString(rootReactElement)
    : null

  const helmet = rootReactElement
    // We run 'react-helmet' after our renderToString call so that we can fish
    // out all the attributes which need to be attached to our page.
    // React Helmet allows us to control our page header contents via our
    // components.
    // @see https://github.com/nfl/react-helmet
    ? Helmet.rewind()
    // There was no react element, so we just us an empty helmet.
    : null

  return `<!doctype html>
    <html ${helmet ? helmet.htmlAttributes.toString() : ''}>
      <head>
        <meta charset="utf-8" />
        <meta http-equiv="x-ua-compatible" content="ie=edge" />

        ${helmet ? helmet.title.toString() : ""}
        ${helmet ? helmet.meta.toString() : ""}
        ${helmet ? helmet.link.toString() : ""}

        ${styles}
        ${helmet ? helmet.style.toString() : ""}
      </head>
      <body>
        <div id="app">${reactRenderString || ""}</div>

        <script>${
          (initialState
            ? `window.APP_STATE=${serialize(initialState)};`
            : "")
          + `window.CHUNK_MANIFEST=${ClientChunkManifest};`
        }</script>

        ${scripts}
        ${helmet ? helmet.script.toString() : ""}
      </body>
    </html>`
}

export default render
