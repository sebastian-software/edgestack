import webpack from "webpack"

import { createNotification } from "./util"

import HotNodeServer from "./HotNodeServer"
import HotClientServer from "./HotClientServer"

import ConfigFactory from "./ConfigFactory"

function safeDisposer(server) {
  return server ? server.dispose() : Promise.resolve()
}

const getCompiler = (name) =>
{
  try {
    const webpackConfig = ConfigFactory({
      target: name,
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

export default class HotController
{
  constructor()
  {
    this.hotClientServer = null
    this.hotNodeServer = null

    const clientServerCompiler = getCompiler("client")
    const nodeServerCompiler = getCompiler("node")

    const createClientServer = () =>
    {
      return new Promise((resolve) =>
      {
        const compiler = clientServerCompiler()

        compiler.plugin("done", (stats) =>
        {
          if (!stats.hasErrors()) {
            resolve(compiler)
          }
        })

        this.hotClientServer = new HotClientServer(compiler)
      })
    }

    const createNodeServer = () =>
    {
      return new Promise((resolve) =>
      {
        const compiler = nodeServerCompiler()

        compiler.plugin("done", (stats) =>
        {
          if (!stats.hasErrors()) {
            resolve(compiler)
          }
        })

        this.hotNodeServer = new HotNodeServer(compiler)
      })
    }

    return createClientServer().then(createNodeServer())
  }

  dispose()
  {
    // First the hot client server. Then dispose the hot node server.
    return safeDisposer(this.hotClientServer).then(() => safeDisposer(this.hotNodeServer))
  }
}
