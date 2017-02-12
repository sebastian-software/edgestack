import { startsWith, includes } from "lodash"

// const NanoToMilli = 1000000

export default class VerboseProgress {
  constructor(options) {
    this.options = options
    this.cwd = process.cwd()
  }

  // eslint-disable-next-line class-methods-use-this
  apply(compiler)
  {
    compiler.plugin("compilation", (compilation) => {
      if (compilation.compiler.isChild())
        return

      var moduleCounter = 0
      var activeModules = {}

      // var slicePathBy = process.cwd().length + 1

      function getTimeStamp(time) {
        return process.hrtime(time)
      }

      function moduleStart(module) {
        var ident = module.identifier()
        if (ident) {
          if (startsWith(ident, "ignored") || startsWith(ident, "external")) {
            return
          }
          moduleCounter += 1
          if (moduleCounter % 100 === 0) {
            console.log(`- Building module #${moduleCounter}`)
          }
          activeModules[ident] = getTimeStamp()
        }
      }

      function moduleDone(module) {
        var ident = module.identifier()
        if (ident) {
          var entry = activeModules[ident]
          if (entry == null) {
            return
          }

          if (includes(ident, "!")) {
            var splits = ident.split("!")
            ident = splits.pop()
          }

          // var runtime = Math.round(getTimeStamp(entry)[1] / NanoToMilli)
          // // var relative = ident.slice(slicePathBy)
          // console.log(`Module ${relative} in ${runtime}ms`)

          if (splits) {
            splits = null
          }
        }
      }

      compilation.plugin("build-module", moduleStart)
      compilation.plugin("failed-module", moduleDone)
      compilation.plugin("succeed-module", moduleDone)

      function logging(title) {
        return function() {
          console.log(`- ${title}`)
        }
      }

      compilation.plugin("seal", () => {
        console.log(`- Sealing ${moduleCounter} modules...`)
      })
      compilation.plugin("optimize", logging("Optimizing modules/chunks/tree..."))

      /*
      compilation.plugin("optimize-modules-basic", logging("Basic module optimization"))
      compilation.plugin("optimize-modules", logging("Module optimization"))
      compilation.plugin("optimize-modules-advanced", logging("Advanced module optimization"))
      compilation.plugin("optimize-chunks-basic", logging("Basic chunk optimization"))
      compilation.plugin("optimize-chunks", logging("Chunk optimization"))
      compilation.plugin("optimize-chunks-advanced", logging("Advanced chunk optimization"))
      compilation.plugin("optimize-tree", function(chunks, modules, callback) {
        console.log("- Module and chunk tree optimization")
        callback()
      })
      compilation.plugin("revive-modules", logging("Module reviving"))
      compilation.plugin("optimize-module-order", logging("Module order optimization"))
      compilation.plugin("optimize-module-ids", logging("Module id optimization"))
      compilation.plugin("revive-chunks", logging("Chunk reviving"))
      compilation.plugin("optimize-chunk-order", logging("Chunk order optimization"))
      compilation.plugin("optimize-chunk-ids", logging("Chunk id optimization"))
      compilation.plugin("before-hash", logging("Hashing"))
      compilation.plugin("before-module-assets", logging("Module assets processing"))
      compilation.plugin("before-chunk-assets", logging("Chunk assets processing"))
      compilation.plugin("additional-chunk-assets", logging("Additional chunk assets processing"))
      compilation.plugin("record", logging("Recording"))
      compilation.plugin("additional-assets", function(callback) {
        console.log("- Additional asset processing")
        callback()
      })
      */
      compilation.plugin("optimize-chunk-assets", (chunks, callback) => {
        console.log("- Optimizing assets...")
        callback()
      })

      /*
      compilation.plugin("optimize-assets", function(assets, callback) {
        console.log("- Optimizing assets...")
        callback()
      })
      */
    })

    compiler.plugin("emit", (compilation, callback) => {
      console.log("- Emitting output files...")
      callback()
    })
  }
}
