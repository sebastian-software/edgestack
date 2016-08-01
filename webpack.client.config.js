const webpackConfigFactory = require("./webpack/ConfigFactory")

module.exports = function clientConfigFactory(options = {}, args = {}) {
  const { mode = "development" } = options
  const config = webpackConfigFactory({ target: "client", mode, root: __dirname }, args)
  // console.log(config)
  return config
}
