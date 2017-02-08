import webpack from "webpack"

import { createNotification } from "./util"

import HotServerManager from "./HotServerManager"
import HotClientManager from "./HotClientManager"

import ConfigFactory from "../webpack/ConfigFactory"

function safeDisposer(server) {
  return server ? server.dispose() : Promise.resolve()
}

/* eslint-disable arrow-body-style */

const getCompilerFactory = (name) =>
{
  return function createCompiler() {
    try {
      const webpackConfig = ConfigFactory({
        target: name === "server" ? "node" : "web",
        mode: "development"
      })

      return webpack(webpackConfig)
    }
    catch (error)
    {
      createNotification({
        title: "development",
        level: "error",
        message: "Webpack config is invalid, please check the console for more information.",
        notify: true
      })

      console.error(error)
      throw error
    }
  }
}

export default class HotController
{
  constructor()
  {
    this.hotClientServer = null
    this.hotNodeServer = null

    const createClientCompiler = getCompilerFactory("client")
    const createServerCompiler = getCompilerFactory("server")

    const createClientManager = () =>
    {
      return new Promise((resolve) =>
      {
        const compiler = createClientCompiler()

        compiler.plugin("done", (stats) =>
        {
          if (!stats.hasErrors()) {
            resolve(compiler)
          }
        })

        this.hotClientServer = new HotClientManager(compiler)
      })
    }

    const createServerManager = () =>
    {
      return new Promise((resolve) =>
      {
        const compiler = createServerCompiler()

        compiler.plugin("done", (stats) =>
        {
          if (!stats.hasErrors()) {
            resolve(compiler)
          }
        })

        this.hotNodeServer = new HotServerManager(compiler)
      })
    }

    return createClientManager().then(createServerManager())
  }

  dispose()
  {
    // First the hot client server. Then dispose the hot node server.
    return safeDisposer(this.hotClientServer).then(() => safeDisposer(this.hotNodeServer)).catch((error) => {
      console.error(error)
    })
  }
}
