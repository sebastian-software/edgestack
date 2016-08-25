#!/usr/bin/env node

'use strict';

var path = require("path")
var rimraf = require("rimraf")
var webpack = require("webpack")
var series = require("async/series")

var ConfigFactory = require("../webpack/ConfigFactory")
var util = require("../webpack/util")

function build()
{
  var buildFolderClient = path.resolve("build", "client")
  var buildFolderServer = path.resolve("build", "server")

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
}

var HotServers = require("../webpack/HotServers")

function start()
{
  new HotServers().start()
}

var spawn = require("cross-spawn");
var script = process.argv[2];
var args = process.argv.slice(3);

switch (script)
{
  case "build":
    build()
    break

  case "start":
    start()
    break

  /*
  case "build":
  case "start":
    var result = spawn.sync(
      "node",
      [ require.resolve(`../lib/scripts/${script}`) ].concat(args),
      { stdio: "inherit" }
    );
    process.exit(result.status);
    break;
  */

  case null:
  case undefined:
    console.log("No script name given!");
    break;

  default:
    console.log(("Unknown script \"" + script + "\"!"));
    break;
}