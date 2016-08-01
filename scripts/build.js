var chalk = require("chalk");
var path = require("path");
var rimrafSync = require("rimraf").sync;
var webpack = require("webpack");

var ConfigFactory = require("../webpack/ConfigFactory");
var util = require("../webpack/util")

const CWD = process.cwd()

const buildFolder = path.resolve(CWD, "build", "client")

// Remove all content but keep the directory so that
// if you're in it, you don't end up in Trash
rimrafSync(buildFolder + '/*');

console.log("Creating an optimized production build for client...")
const clientConfig = ConfigFactory({ target: "client", mode: "production", root: CWD }, {})
webpack(clientConfig).run(function(err, stats)
{
  if (err)
  {
    console.error("Failed to create a production build. Reason:")
    console.error(err.message || err)
    process.exit(1)
  }

  util.logAssets(stats.toJson().assets, buildFolder)
})

console.log("Creating an production build for server...")
const serverConfig = ConfigFactory({ target: "server", mode: "production", root: CWD }, {})
webpack(serverConfig).run(function(err, stats)
{
  if (err)
  {
    console.error("Failed to create a production build. Reason:")
    console.error(err.message || err)
    process.exit(1)
  }
})
