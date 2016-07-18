/* eslint-disable no-console,global-require,no-underscore-dangle */

// const path = require("path")
// const chokidar = require("chokidar")
// const webpack = require("webpack")

const HotServers = require("./webpack/HotServers")
const servers = new HotServers(__dirname)
servers.start()
