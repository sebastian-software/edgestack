const express = require("express")
const createWebpackHotMiddleware = require("webpack-hot-middleware")
const createWebpackMiddleware = require("webpack-dev-middleware")

const ListenerManager = require("./ListenerManager")
const util = require("./util")

class HotClient {
  constructor(compiler) {
    const app = express()
    this.webpackDevMiddleware = createWebpackMiddleware(compiler, {
      noInfo: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },

      // The path at which the client bundles are served from.  Note: in this
      // case as we are running a seperate dev server the public path should
      // be absolute, i.e. including the "http://..."
      publicPath: compiler.options.output.publicPath,

      // Make it beautiful
      stats: {
        colors: true
      }
    })
    app.use(this.webpackDevMiddleware)
    app.use(createWebpackHotMiddleware(compiler))

    const listener = app.listen(process.env.CLIENT_DEVSERVER_PORT)
    this.listenerManager = new ListenerManager(listener)

    util.createNotification({
      title: "Hot Client",
      message: "Running",
    })
  }

  dispose(force = false) {
    this.webpackDevMiddleware.close()

    return this.listenerManager
      ? this.listenerManager.dispose(force)
      : Promise.resolve()
  }
}

module.exports = HotClient