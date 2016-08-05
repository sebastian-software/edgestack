module.exports =
{
  // Don't try to find .babelrc because we want to force this configuration.
  babelrc: false,

  // Keep origin information alive
  sourceMaps: "inline",

  presets:
  [
    require("babel-preset-es2015").buildPreset(null, {"modules": false}),
    require("babel-preset-es2016"),
    require("babel-preset-react"),
    require("babel-preset-stage-1")
  ]
}
