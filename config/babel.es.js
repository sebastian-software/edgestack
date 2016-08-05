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
    [ "babel-preset-es2015", { modules: false } ],
    "babel-preset-es2016",
    "babel-preset-react",
    "babel-preset-stage-1"
  ]
}
