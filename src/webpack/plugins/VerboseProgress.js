import { startsWith } from "lodash"

export default class VerboseProgress {
  constructor(options) {
    this.options = options
  }

  apply(compiler)
  {
    compiler.plugin("compilation", (compilation) =>
    {
      if (compilation.compiler.isChild()) {
        return
      }

      var moduleCounter = 0

      compilation.plugin("build-module", (module) => {
        var ident = module.identifier()
        if (ident) {
          if (startsWith(ident, "ignored") || startsWith(ident, "external")) {
            return
          }
          moduleCounter += 1
          if (moduleCounter % 100 === 0) {
            console.log(`- Building module #${moduleCounter}`)
          }
        }
      })

      compilation.plugin("seal", () => {
        console.log(`- Sealing ${moduleCounter} modules...`)
      })

      compilation.plugin("optimize", () => {
        console.log("- Optimizing modules/chunks/tree...")
      })

      compilation.plugin("optimize-chunk-assets", (chunks, callback) => {
        console.log("- Optimizing assets...")
        callback()
      })
    })

    compiler.plugin("emit", (compilation, callback) => {
      console.log("- Emitting output files...")
      callback()
    })
  }
}
