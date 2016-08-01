const webpackConfigFactory = require("./webpack/ConfigFactory")

module.exports = function serverConfigFactory(options = {}, args = {}) {
  const { mode = "development" } = options
  const config = webpackConfigFactory({ target: "server", mode, root: __dirname }, args)
  // console.log(config)
  return config
}
