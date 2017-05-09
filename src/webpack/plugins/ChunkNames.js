import path from "path"
import { getHashDigest } from "loader-utils"

const WORKING_DIR = process.cwd()
const HASH_TYPE = "sha256"
const DIGEST_TYPE = "base62"
const DIGEST_LENGTH = 4
const SCRIPT_EXTENSIONS = new Set([ ".mjs", ".js", ".jsx", ".ts", ".tsx" ])
const SKIP_FOLDERS = [ "lib", "dist", "src", "build" ]

function generateChunkName(request, rawRequest) {
  // Strip prefixed loader syntax from Webpack
  let splittedRequest = request.split("!")
  let cleanRequest = splittedRequest[splittedRequest.length - 1]

  // Getting relative path inside working directory
  var relative = path.relative(WORKING_DIR, cleanRequest)

  var isExternal = relative.startsWith("node_modules" + path.sep)
  if (isExternal) {
    // if the module is an DelegatedModule, the rawRequest will be undefined since it does not have this property.
    // However, the userRequest property can supplement rawRequest in this situation
    relative = rawRequest || request
  }

  // Strip useless helper folder structure
  SKIP_FOLDERS.forEach((filter) => {
    relative = relative.replace(new RegExp("(^|/|\\\\)" + filter + "($|/|\\\\)"), (match, group1) => group1)
  })

  // Strip all script file extensions
  var fileExt = path.parse(relative).ext
  if (SCRIPT_EXTENSIONS.has(fileExt)) {
    relative = relative.replace(new RegExp(`${fileExt}$`), "")
  }

  let hash = getHashDigest(cleanRequest, HASH_TYPE, DIGEST_TYPE, DIGEST_LENGTH)
  let base = path.basename(relative)

  let result = `${base}-${hash}`

  return result
}

export default class ChunkNames
{
  apply(compiler)
  {
    compiler.plugin("compilation", (compilation) => {
      compilation.plugin("optimize", () => {
        compilation.chunks.forEach((chunk) => {
          var firstModule = chunk.modules[0]
          if (firstModule) {
            var userRequest = firstModule.userRequest
            var rawRequest = firstModule.rawRequest
            var oldName = chunk.name
            if (userRequest && oldName == null) {
              chunk.name = generateChunkName(userRequest, rawRequest)
            }
          }
        })
      })
    })
  }
}
