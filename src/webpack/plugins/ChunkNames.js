import path from "path"
import { getHashDigest } from "loader-utils"

const WORKING_DIR = process.cwd()
const DEP_BLOCK_NAME = "AsyncDependenciesBlock"
const HASH_TYPE = "sha256"
const DIGEST_TYPE = "base62"
const DIGEST_LENGTH = 4
const SCRIPT_EXTENSIONS = new Set([ ".mjs", ".js", ".jsx", ".ts", ".tsx" ])

function checkConstructorNames(object) {
  const obj = Object.getPrototypeOf(object)
  if (obj) {
    if (obj.constructor.name === DEP_BLOCK_NAME) {
      return true
    } else {
      return checkConstructorNames(obj)
    }
  } else {
    return false
  }
}

function generateChunkName(resource) {
  if (resource == null) {
    return null
  }

  let relative = path.relative(WORKING_DIR, resource)
  const parsedPath = path.parse(relative)

  // Remove typical script extensions as chunks for non
  // media files should not have that in their name
  if (SCRIPT_EXTENSIONS.has(parsedPath.ext)) {
    relative = relative.slice(0, -parsedPath.ext.length)
  }

  // Replace index files with parent folder names
  relative = relative.replace(new RegExp(`${path.sep}index$`), "")

  let hash = getHashDigest(relative, HASH_TYPE, DIGEST_TYPE, DIGEST_LENGTH)
  let base = path.basename(relative)

  return `${base}-${hash}`
}

export default class ChunkNames
{
  // eslint-disable-next-line class-methods-use-this
  apply(compiler)
  {
    /* eslint-disable max-nested-callbacks */
    compiler.plugin("compilation", (compilation) => {
      compilation.plugin("seal", () => {
        compilation.modules.forEach((module) => {
          module.blocks.forEach((block) => {
            if (checkConstructorNames(block)) {
              block.dependencies.forEach((dependency) => {
                if (dependency.module && dependency.module.resource && dependency.block) {
                  const chunkName = generateChunkName(dependency.module.resource)
                  if (chunkName) {
                    dependency.block.chunkName = chunkName
                    dependency.block.name = chunkName
                  }
                }
              })
            }
          })
        })
      })
    })
  }
}
