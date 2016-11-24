import express from "express"
import createWebpackHotMiddleware from "webpack-hot-middleware"
import createWebpackMiddleware from "webpack-dev-middleware"

import ListenerManager from "./ListenerManager"
import { createNotification } from "./util"

class HotClient {
  constructor(compiler) {
    this.listenerManager = new ListenerManager(new Promise((resolve, reject) => {

      const app = express()
      this.webpackDevMiddleware = createWebpackMiddleware(compiler, {
        noInfo: true,
        headers: {
          "Access-Control-Allow-Origin": "*"
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

      var listener = app.listen(process.env.CLIENT_DEVSERVER_PORT)
      createNotification({
        title: "Hot Development Client",
        message: `Started successfully (Port: ${process.env.CLIENT_DEVSERVER_PORT})!`
      })

      resolve(listener)
    }))
  }

  dispose(force = false) {
    this.webpackDevMiddleware.close()

    return this.listenerManager ? this.listenerManager.dispose(force) : Promise.resolve()
  }
}

export default HotClient
