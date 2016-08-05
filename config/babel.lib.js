module.exports =
{
  // Don't try to find .babelrc because we want to force this configuration.
  babelrc: false,

  // Faster transpiling for minor loose in formatting
  compact: "auto",

  // Keep origin information alive
  sourceMaps: "inline",

  presets:
  [
    require("babel-preset-es2015"),
    require("babel-preset-es2016"),
    require("babel-preset-react"),
    require("babel-preset-stage-1")
  ]
}
