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

      util.logAssets(stats.toJson().assets, buildFolderClient)
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
      callback()
    })
  }
])
