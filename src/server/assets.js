// This file resolves the assets available from our client bundle.

import fs from "fs"
import { ABSOLUTE_ASSETSINFO_PATH } from "./config"

const ClientBundleAssets = JSON.parse(
  fs.readFileSync(ABSOLUTE_ASSETSINFO_PATH, "utf8")
)

// Convert the assets json it into an object that contains all the paths to our
// javascript and css files.  Doing this is required as for production
// configurations we add a hash to our filenames, therefore we won't know the
// paths of the output by webpack unless we read them from the assets.json file.
const chunks = Object.keys(ClientBundleAssets).map((key) => ClientBundleAssets[key])
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

export default assets
