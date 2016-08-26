import path from "path"
import rimraf from "rimraf"
import webpack from "webpack"
import series from "async/series"
import gutil from "gulp-util"

import ConfigFactory from "../webpack/ConfigFactory"
import { logAssets } from "../webpack/util"

export default function build()
{
  const buildFolderClient = path.resolve("build", "client")
  const buildFolderServer = path.resolve("build", "server")

  series(
  [
    function(callback)
    {
      // Remove all content but keep the directory so that
      // if you're in it, you don't end up in Trash
      rimraf(buildFolderClient + '/*', callback)
    },
    function(callback)
    {
      // Remove all content but keep the directory so that
      // if you're in it, you don't end up in Trash
      rimraf(buildFolderServer + '/*', callback)
    },
    function(callback)
    {
      console.log("Creating a production build for client...")
      webpack(ConfigFactory("client", "production")).run(function(err, stats)
      {
        if (err)
        {
          console.error("Failed to create a production build for client:")
          console.error(err.message || err)
          process.exit(1)
        }

        console.log("- Done")
        console.log("")

        gutil.log(stats.toString({
          chunks: false, // Makes the build much quieter
          colors: true
        }))        

        logAssets(stats.toJson().assets, buildFolderClient)
        callback()
      })
    },
    function(callback)
    {
      console.log("Creating a production build for server...")
      webpack(ConfigFactory("server", "production")).run(function(err, stats)
      {
        if (err)
        {
          console.error("Failed to create a production build for client:")
          console.error(err.message || err)
          process.exit(1)
        }

        console.log("- Done")
        console.log("")

        gutil.log(stats.toString({
          chunks: false, // Makes the build much quieter
          colors: true
        }))

        callback()
      })
    }
  ])
}
