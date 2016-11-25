import serialize from "serialize-javascript"
import { readFileSync } from "fs"
import { STATE_IDENTIFIER } from "code-split-component"
import { ABSOLUTE_ASSETSINFO_PATH, ABSOLUTE_CHUNKMANIFEST_PATH } from "./config"

var chunkManifest = "{}"
if (process.env.MODE === "production")
{
  try {
    chunkManifest = readFileSync(ABSOLUTE_CHUNKMANIFEST_PATH, "utf-8")
  } catch (err) {
    console.warn("Could not parse chunkhashes from manifest.json: ", err)
  }
}

const clientAssets = JSON.parse(
  readFileSync(ABSOLUTE_ASSETSINFO_PATH, "utf-8")
)

// Convert the assets json it into an object that contains all the paths to our
// javascript and css files.  Doing this is required as for production
// configurations we add a hash to our filenames, therefore we won't know the
// paths of the output by webpack unless we read them from the assets.json file.
// const chunks = Object.keys(clientAssets).map((key) => clientAssets[key])

function getAssetsForClientChunks(chunks) {
  return chunks.reduce((acc, chunkName) => {
    const chunkAssets = clientAssets[chunkName]
    if (chunkAssets) {
      if (chunkAssets.js) {
        acc.scripts.push(chunkAssets.js)
      }
      if (chunkAssets.css) {
        acc.styles.push(chunkAssets.css)
      }
    }
    return acc
  }, { scripts: [], styles: [] })
}



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
export default function render({ renderedApp, initialState = {}, nonce, helmet, codeSplitState = {} }) {
  // The chunks that we need to fetch the assets (js/css) for and then include
  // said assets as script/style tags within our html.
  const chunksForRender = [
    // We always manually add the main entry chunk for our client bundle. It
    // must always be the first item in the collection.
    "vendor",
    "main"
  ]

  if (codeSplitState) {
    // We add all the chunks that our CodeSplitProvider tracked as being used
    // for this render.  This isn't actually required as the rehydrate function
    // of code-split-component which gets executed in our client bundle will
    // ensure all our required chunks are loaded, but its a nice optimisation as
    // it means the browser can start fetching the required files before it's
    // even finished parsing our client bundle entry script.
    // Having the assets.json file available to us made implementing this
    // feature rather arbitrary.
    codeSplitState.chunks.forEach((chunk) => chunksForRender.push(chunk))
  }

  // Now we get the assets (js/css) for the chunks.
  const assetsForRender = getAssetsForClientChunks(chunksForRender)

  return `<!doctype html>
    <html ${helmet ? helmet.htmlAttributes.toString() : ""}>
      <head>
        ${helmet ? helmet.title.toString() : ""}
        ${helmet ? helmet.meta.toString() : ""}
        ${helmet ? helmet.link.toString() : ""}

        ${styleTags(assetsForRender.styles)}
        ${helmet ? helmet.style.toString() : ""}
      </head>
      <body>
        <div id="app">${renderedApp || ""}</div>

        <script nonce="${nonce}">${
          `APP_STATE=${serialize(initialState)};` +
          `CHUNK_MANIFEST=${chunkManifest};` +
          `${STATE_IDENTIFIER}=${serialize(codeSplitState)};`
        }</script>

        ${scriptTags(assetsForRender.scripts)}
        ${helmet ? helmet.script.toString() : ""}
      </body>
    </html>`
}
