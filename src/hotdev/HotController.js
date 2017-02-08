import webpack from "webpack"
import chalk from "chalk"

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
  return function createCompiler(label)
  {
    try {
      console.log(`${label} Generating Webpack Config...`)
      const webpackConfig = ConfigFactory({
        target: name === "server" ? "node" : "web",
        mode: "development"
      })

      console.log(`${label} Initiating Webpack...`)
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
      const label = chalk.blue("- Client Manager:")
      console.log(`${label} Preparing...`)

      return new Promise((resolve) =>
      {
        const compiler = createClientCompiler(label)

        compiler.plugin("done", (stats) =>
        {
          console.log(`${label} Done`)
          if (!stats.hasErrors()) {
            resolve(compiler)
          }
        })

        this.hotClientServer = new HotClientManager(compiler)
      }).catch((error) => {
        console.error(`${label} Error`, error)
      })
    }

    const createServerManager = () =>
    {
      const label = chalk.magenta("- Server Manager:")
      console.log(`${label} Preparing...`)

      return new Promise((resolve) =>
      {
        const compiler = createServerCompiler(label)

        compiler.plugin("done", (stats) =>
        {
          console.log(`${label} Done`)
          if (!stats.hasErrors()) {
            resolve(compiler)
          }
        })

        this.hotNodeServer = new HotServerManager(compiler)
      }).catch((error) => {
        console.error(`${label} Error:`, error)
      })
    }

    createClientManager().then(() => createServerManager()).catch((error) => {
      console.error("Error during build:", error)
    })
  }

  dispose()
  {
    // First the hot client server. Then dispose the hot node server.
    return safeDisposer(this.hotClientServer).then(() => safeDisposer(this.hotNodeServer)).catch((error) => {
      console.error(error)
    })
  }
}
