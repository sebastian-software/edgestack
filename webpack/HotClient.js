const express = require("express")
const createWebpackHotMiddleware = require("webpack-hot-middleware")
const createWebpackMiddleware = require("webpack-dev-middleware")

class HotClient {
  constructor(compiler) {
    const app = express()
    this.webpackDevMiddleware = createWebpackMiddleware(compiler, {
      quiet: true,
      noInfo: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },

      // The path at which the client bundles are served from.  Note: in this
      // case as we are running a seperate dev server the public path should
      // be absolute, i.e. including the "http://..."
      publicPath: compiler.options.output.publicPath,
    })
    app.use(this.webpackDevMiddleware)
    app.use(createWebpackHotMiddleware(compiler))

    const listener = app.listen(process.env.CLIENT_DEVSERVER_PORT)
    this.listenerManager = new ListenerManager(listener)

    createNotification({
      title: "Client",
      message: "Running",
    })
  }

  dispose() {
    this.webpackDevMiddleware.close()

    return Promise.all([
      this.listenerManager ? this.listenerManager.dispose() : undefined,
    ])
  }
}
