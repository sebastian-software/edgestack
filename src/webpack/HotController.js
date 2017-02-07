import { resolve as pathResolve } from "path"
import webpack from "webpack"
import appRootDir from "app-root-dir"

import { createNotification } from "./util"

import HotNodeServer from "./HotNodeServer"
import HotClientServer from "./HotClientServer"

import createVendorDLL from "./createVendorDLL"
import webpackConfigFactory from "./ConfigFactory"
import getConfig from "../../config/get"

const usesDevVendorDLL = (bundleConfig) =>
  bundleConfig.devVendorDLL != null && bundleConfig.devVendorDLL.enabled

const vendorDLLsFailed = (error) =>
{
  createNotification({
    title: "vendorDLL",
    level: "error",
    message: "Unfortunately an error occured whilst trying to build the vendor dll(s) used by " +
      "the development server. Please check the console for more information.",
    notify: true
  })

  if (error) {
    console.error(error)
  }
}

const initializeBundle = (name, bundleConfig) =>
{
  const createCompiler = () =>
  {
    try {
      const webpackConfig = webpackConfigFactory({
        target: name,
        mode: "development"
      })

      /*
      // Install the vendor DLL config for the client bundle if required.
      if (usesDevVendorDLL(bundleConfig))
      {
        // Install the vendor DLL plugin.
        webpackConfig.plugins.push(
          new webpack.DllReferencePlugin({
            manifest: require(
              pathResolve(
                appRootDir.get(),
                bundleConfig.outputPath,
                `${bundleConfig.devVendorDLL.name}.json`,
              ),
            )
          }),
        )
      }
      */

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

  return {
    name,
    bundleConfig,
    createCompiler
  }
}

export default class HotController
{
  constructor()
  {
    this.hotClientServer = null
    this.hotNodeServer = null

    const clientBundle = initializeBundle("client", getConfig("bundles.client"))
    const nodeBundle = initializeBundle("server", getConfig("bundles.server"))

    // First ensure the client dev vendor DLLs is created if needed.
    Promise.resolve(
      usesDevVendorDLL(getConfig("bundles.client")) ?
        createVendorDLL("client", getConfig("bundles.client")) :
        true,
    )

      // Then start the client development server.
      .then(() => new Promise((resolve) =>
      {
        const { createCompiler } = clientBundle
        const compiler = createCompiler()
        compiler.plugin("done", (stats) => {
          if (!stats.hasErrors()) {
            resolve(compiler)
          }
        })
        this.hotClientServer = new HotClientServer(compiler)
      }), vendorDLLsFailed)

      // Then start the node development server(s).
      .then((clientCompiler) => {
        this.hotNodeServer = new HotNodeServer(createCompiler(), clientCompiler)
      })
  }

  dispose()
  {
    const safeDisposer = (server) =>
      (server ? server.dispose() : Promise.resolve())

    // First the hot client server. Then dispose the hot node server.
    return safeDisposer(this.hotClientServer).then(() => safeDisposer(this.hotNodeServer))
  }
}
