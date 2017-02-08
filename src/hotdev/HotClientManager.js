import express from "express"
import createWebpackMiddleware from "webpack-dev-middleware"
import createWebpackHotMiddleware from "webpack-hot-middleware"

import ListenerManager from "./ListenerManager"
import { createNotification } from "./util"

export default class HotClientManager
{
  constructor(compiler)
  {
    console.log("- Creating Hot Client Manager...")

    const httpServer = express()

    const httpPathRegex = /^https?:\/\/(.*):([\d]{1,5})/i
    const httpPath = compiler.options.output.publicPath

    if (!httpPath.startsWith("http") && !httpPathRegex.test(httpPath))
    {
      throw new Error(
        "You must supply an absolute public path to a development build of a web target bundle " +
        "as it will be hosted on a seperate development server to any node target bundles."
      )
    }

    // eslint-disable-next-line no-unused-vars
    const [ _, host, port ] = httpPathRegex.exec(httpPath)

    this.webpackDevMiddleware = createWebpackMiddleware(compiler, {
      quiet: true,
      noInfo: true,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },

      // Ensure that the public path is taken from the compiler webpack config
      // as it will have been created as an absolute path to avoid conflicts
      // with an node servers.
      publicPath: compiler.options.output.publicPath
    })

    httpServer.use(this.webpackDevMiddleware)
    httpServer.use(createWebpackHotMiddleware(compiler))

    const listener = httpServer.listen(port, host)

    this.listenerManager = new ListenerManager(listener, "client")

    compiler.plugin("compile", () =>
    {
      createNotification({
        title: "client",
        level: "info",
        message: "Building new bundle..."
      })
    })

    compiler.plugin("done", (stats) =>
    {
      if (stats.hasErrors())
      {
        createNotification({
          title: "client",
          level: "error",
          message: "Build failed, please check the console for more information.",
          notify: true
        })

        console.error(stats.toString())
      }
      else
      {
        createNotification({
          title: "client",
          level: "info",
          message: "Running with latest changes.",
          notify: true
        })
      }
    })
  }

  dispose()
  {
    this.webpackDevMiddleware.close()

    return this.listenerManager ?
      this.listenerManager.dispose() :
      Promise.resolve()
  }
}
