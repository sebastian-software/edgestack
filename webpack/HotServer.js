const path = require("path")

const ListenerManager = require("./ListenerManager")
const util = require("./util")

class HotServer {
  constructor(compiler) {
    this.compiler = compiler
    this.listenerManager = null

    const compiledOutputPath = path.resolve(
      compiler.options.output.path, `${Object.keys(compiler.options.entry)[0]}.js`
    )

    try
    {
      // The server bundle  will automatically start the web server just by
      // requiring it. It returns the http listener too.
      this.listenerManager = new ListenerManager(require(compiledOutputPath).default)

      const url = `http://localhost:${process.env.SERVER_PORT}`

      util.createNotification({
        title: "Server",
        message: `Running on ${url}`,
        open: url,
      })
    }
    catch (err)
    {
      util.createNotification({
        title: "Server",
        message: "Error: Bundle invalid, check console for error",
      })
      console.error(err)
    }
  }

  dispose(force = false) {
    return this.listenerManager
      ? this.listenerManager.dispose(force)
      : Promise.resolve();
  }
}

module.exports = HotServer
