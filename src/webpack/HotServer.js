import { resolve } from "path"

import ListenerManager from "./ListenerManager"
import { createNotification } from "./util"

class HotServer {
  constructor(compiler) {
    this.compiler = compiler
    this.listenerManager = null

    const compiledOutputPath = resolve(
      compiler.options.output.path, `${Object.keys(compiler.options.entry)[0]}.js`
    )

    var importedServer
    try
    {
      importedServer = require(compiledOutputPath)
    }
    catch (err)
    {
      createNotification({
        title: "Hot Server",
        message: "Error: Bundle invalid. Check console for error!"
      })

      console.error(err)
    }

    if (importedServer) {
      var listener = importedServer.start()
      createNotification({
        title: "Hot Server",
        message: "Started successfully!"
      })

      this.listenerManager = new ListenerManager(listener)
    }
  }

  dispose(force = false) {
    return this.listenerManager ? this.listenerManager.dispose(force) : Promise.resolve()
  }
}

export default HotServer
