import { resolve } from "path"
import webpack from "webpack"
import chokidar from "chokidar"

import HotClient from "./HotClient"
import HotServer from "./HotServer"
import ConfigFactory from "./ConfigFactory"
import { createNotification } from "./util"

const CWD = process.cwd()

class HotServers
{
  constructor(root = CWD)
  {
    this.root = root

    // Bind our functions to avoid any scope/closure issues.
    this.start = this.start.bind(this)
    this.restart = this.restart.bind(this)

    this._configureHotClient = this._configureHotClient.bind(this)
    this._configureHotServer = this._configureHotServer.bind(this)

    this.clientBundle = null
    this.clientCompiler = null
    this.serverBundle = null
    this.serverCompiler = null

    // If we receive a kill cmd then we will first try to dispose our listeners.
    process.on("SIGTERM", () => this.dispose().then(() => process.exit(0)))
  }

  start()
  {
    try
    {
      console.log("Compiling client...")
      this.clientCompiler = webpack(ConfigFactory("client", "development"))

      console.log("Compiling server...")
      this.serverCompiler = webpack(ConfigFactory("server", "development"))
    }
    catch (err) {
      createNotification({
        title: "Webpack",
        message: "Config invalid, check console for error"
      })
      console.error(err)
      return
    }

    this._configureHotClient()
    this._configureHotServer()
  }


  dispose()
  {
    // We want to forcefully close our servers (passing true) which will hard
    // kill any existing connections.  We don't care about them running as we
    // need to restart both the client and server bundles.
    const safeDisposeClient = () =>
      (this.clientBundle ? this.clientBundle.dispose(true) : Promise.resolve())
    const safeDisposeServer = () =>
      (this.serverBundle ? this.serverBundle.dispose(true) : Promise.resolve())

    return safeDisposeClient().then(safeDisposeServer)
  }

  restart() {
    const clearWebpackConfigsCache = () => {
      Object.keys(require.cache).forEach((modulePath) => {
        if (~modulePath.indexOf("webpack")) {
          delete require.cache[modulePath]
        }
      })
    }

    this.dispose()
      .then(clearWebpackConfigsCache)
      .then(this.start, (err) => console.log(err))
      .catch((err) => console.log(err))
  }

  _configureHotClient() {
    this.clientCompiler.plugin("done", (stats) => {
      if (stats.hasErrors()) {
        createNotification({
          title: "Client",
          message: "Build failed, check console for error"
        })
        console.log(stats.toString())
      }
    })

    this.clientBundle = new HotClient(this.clientCompiler)
  }

  _configureHotServer() {
    const compileHotServer = () => {
      const runCompiler = () => this.serverCompiler.run(() => undefined)

      // Shut down any existing running server if necessary before starting the
      // compile, else just compile.
      if (this.serverBundle) {
        this.serverBundle.dispose(true).then(runCompiler)
      } else {
        runCompiler()
      }
    }

    this.clientCompiler.plugin("done", (stats) => {
      if (!stats.hasErrors()) {
        compileHotServer()
      }
    })

    this.serverCompiler.plugin("done", (stats) => {
      if (stats.hasErrors()) {
        createNotification({
          title: "Server",
          message: "Build failed, check console for error"
        })
        console.log(stats.toString())
        return
      }

      // Make sure our newly built server bundles aren't in the module cache.
      Object.keys(require.cache).forEach((modulePath) => {
        if (~modulePath.indexOf(this.serverCompiler.options.output.path)) {
          delete require.cache[modulePath]
        }
      })

      this.serverBundle = new HotServer(this.serverCompiler)
    })

    // Now we will configure `chokidar` to watch our server specific source folder.
    // Any changes will cause a rebuild of the server bundle.
    this.watcher = chokidar.watch([ resolve(this.root, "./src/server") ])
    this.watcher.on("ready", () => {
      this.watcher
        .on("add", compileHotServer)
        .on("addDir", compileHotServer)
        .on("change", compileHotServer)
        .on("unlink", compileHotServer)
        .on("unlinkDir", compileHotServer)
    })
  }
}

export default HotServers
