import webpack from "webpack"
import { spawn } from "child_process"
import appRootDir from "app-root-dir"
import path from "path"

import { createNotification } from "./util"

import HotServerManager from "./HotServerManager"
import HotClientManager from "./HotClientManager"

import ConfigFactory from "../webpack/ConfigFactory"
import StatusPlugin from "../webpack/plugins/Status"

function safeDisposer(manager) {
  return manager ? manager.dispose() : Promise.resolve()
}

/* eslint-disable arrow-body-style, no-console */

function createCompiler({ name, start, done })
{
  try {
    const webpackConfig = ConfigFactory({
      target: name === "server" ? "node" : "web",
      mode: "development"
    })

    // Offering a special status handling until Webpack offers a proper `done()` callback
    // See also: https://github.com/webpack/webpack/issues/4243
    webpackConfig.plugins.push(new StatusPlugin({ name, start, done }))

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
    this.hotClientManager = null
    this.hotServerManager = null

    this.clientIsBuilding = false
    this.serverIsBuilding = false

    this.timeout = 0

    const createClientManager = () =>
    {
      return new Promise((resolve) =>
      {
        const compiler = createCompiler({
          name: "client",
          start: () => {
            this.clientIsBuilding = true
            createNotification({
              title: "Hot Client",
              level: "info",
              message: "Building new bundle..."
            })
          },
          done: () =>
          {
            this.clientIsBuilding = false
            createNotification({
              title: "Hot Client",
              level: "info",
              message: "Bundle is ready.",
              notify: true
            })
            resolve(compiler)
          }
        })

        this.hotClientCompiler = compiler
        this.hotClientManager = new HotClientManager(compiler)
      })
    }

    const createServerManager = () =>
    {
      return new Promise((resolve) =>
      {
        const compiler = createCompiler({
          name: "server",
          start: () => {
            this.serverIsBuilding = true
            createNotification({
              title: "Hot Server",
              level: "info",
              message: "Building new bundle..."
            })
          },
          done: () => {
            this.serverIsBuilding = false
            createNotification({
              title: "Hot Server",
              level: "info",
              message: "Bundle is ready.",
              notify: true
            })

            this.tryStartServer()
            resolve(compiler)
          }
        })

        this.compiledServer = path.resolve(
          appRootDir.get(),
          compiler.options.output.path,
          `${Object.keys(compiler.options.entry)[0]}.js`,
        )

        this.hotServerCompiler = compiler
        this.hotServerManager = new HotServerManager(compiler, this.hotClientCompiler)
      })
    }

    createClientManager().then(createServerManager).catch((error) => {
      console.error("Error during build:", error)
    })
  }

  tryStartServer = () =>
  {
    if (this.clientIsBuilding) {
      if (this.serverTryTimeout) {
        clearTimeout(this.serverTryTimeout)
      }
      this.serverTryTimeout = setTimeout(this.tryStartServer, this.timeout)
      this.timeout += 100
      return
    }

    this.startServer()
    this.timeout = 0
  }

  startServer = () =>
  {
    if (this.server) {
      this.server.kill()
      this.server = null
      createNotification({
        title: "Hot Server",
        level: "info",
        message: "Restarting server..."
      })
    }

    const newServer = spawn("node", [ "--inspect", this.compiledServer, "--colors" ], {
      stdio: [ process.stdin, process.stdout, "pipe" ]
    })

    createNotification({
      title: "Hot Server",
      level: "info",
      message: "Server running with latest changes.",
      notify: true
    })

    newServer.stderr.on("data", (data) => {
      createNotification({
        title: "Hot Server",
        level: "error",
        message: "Error in server execution, check the console for more info."
      })
      process.stderr.write("\n")
      process.stderr.write(data)
      process.stderr.write("\n")
    })

    this.server = newServer
  }

  dispose()
  {
    // First the hot client server. Then dispose the hot node server.
    return safeDisposer(this.hotClientManager).then(() => safeDisposer(this.hotServerManager)).catch((error) => {
      console.error(error)
    })
  }
}
