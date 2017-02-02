import { startsWith, includes } from "lodash"

export default class VerboseProgressPlugin {
  constructor(options) {
    this.options = options
    this.cwd = process.cwd()
  }

  apply(compiler)
  {
    compiler.plugin("compilation", function(compilation)
    {
      if (compilation.compiler.isChild())
        return

      var moduleCounter = 0
      var activeModules = {}
      var slicePathBy = process.cwd().length + 1

      function now(time) {
        return process.hrtime(time)
      }

      function moduleStart(module) {
        var ident = module.identifier()
        if (ident) {
          if (startsWith(ident, "ignored") || startsWith(ident, "external")) {
            return
          }
          moduleCounter++
          if (moduleCounter % 100 === 0) {
            console.log("- Building module #" + moduleCounter)
          }
          activeModules[ident] = now()
        }
      }

      function moduleDone(module) {
        var ident = module.identifier()
        if (ident) {
          var entry = activeModules[ident];
          if (entry == null) {
            return
          }

          var runtime = Math.round(now(entry)[1] / 1000000)
          if (includes(ident, "!")) {
            var splits = ident.split("!")
            ident = splits.pop()
          }
          var relative = ident.slice(slicePathBy)
          // console.log(`Module ${relative} in ${runtime}ms`)
          if (splits) {
            splits = null
          }
        }
      }

      compilation.plugin("build-module", moduleStart)
      compilation.plugin("failed-module", moduleDone)
      compilation.plugin("succeed-module", moduleDone)

      function log(title) {
        return function() {
          console.log("- " + title)
        }
      }

      compilation.plugin("seal", function() {
        console.log("- Sealing " + moduleCounter + " modules...")
      })
      compilation.plugin("optimize", log("Optimizing modules/chunks/tree..."))
      /*
      compilation.plugin("optimize-modules-basic", log("Basic module optimization"))
      compilation.plugin("optimize-modules", log("Module optimization"))
      compilation.plugin("optimize-modules-advanced", log("Advanced module optimization"))
      compilation.plugin("optimize-chunks-basic", log("Basic chunk optimization"))
      compilation.plugin("optimize-chunks", log("Chunk optimization"))
      compilation.plugin("optimize-chunks-advanced", log("Advanced chunk optimization"))
      compilation.plugin("optimize-tree", function(chunks, modules, callback) {
        console.log("- Module and chunk tree optimization")
        callback()
      })
      compilation.plugin("revive-modules", log("Module reviving"))
      compilation.plugin("optimize-module-order", log("Module order optimization"))
      compilation.plugin("optimize-module-ids", log("Module id optimization"))
      compilation.plugin("revive-chunks", log("Chunk reviving"))
      compilation.plugin("optimize-chunk-order", log("Chunk order optimization"))
      compilation.plugin("optimize-chunk-ids", log("Chunk id optimization"))
      compilation.plugin("before-hash", log("Hashing"))
      compilation.plugin("before-module-assets", log("Module assets processing"))
      compilation.plugin("before-chunk-assets", log("Chunk assets processing"))
      compilation.plugin("additional-chunk-assets", log("Additional chunk assets processing"))
      compilation.plugin("record", log("Recording"))
      compilation.plugin("additional-assets", function(callback) {
        console.log("- Additional asset processing")
        callback()
      })
      */
      compilation.plugin("optimize-chunk-assets", function(chunks, callback) {
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

    compiler.plugin("emit", function(compilation, callback) {
      console.log("- Emitting output files...")
      callback()
    })
  }
}
