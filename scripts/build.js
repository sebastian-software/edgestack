var chalk = require("chalk")
var path = require("path")
var rimraf = require("rimraf")
var webpack = require("webpack")
var series = require("async/series")

var ConfigFactory = require("../webpack/ConfigFactory")
var util = require("../webpack/util")

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
    console.log("Creating an optimized production build for client...")
    const clientConfig = ConfigFactory({ target: "client", mode: "production" }, {})
    webpack(clientConfig).run(function(err, stats)
    {
      if (err)
      {
        console.error("Failed to create a production build. Reason:")
        console.error(err.message || err)
        process.exit(1)
      }

      util.logAssets(stats.toJson().assets, buildFolderClient)
      callback()
    })
  },
  function(callback)
  {
    console.log("Creating an production build for server...")
    const serverConfig = ConfigFactory({ target: "server", mode: "production" }, {})
    webpack(serverConfig).run(function(err, stats)
    {
      if (err)
      {
        console.error("Failed to create a production build. Reason:")
        console.error(err.message || err)
        process.exit(1)
      }

      callback()
    })
  }
])
