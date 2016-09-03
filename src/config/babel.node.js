export default
{
  // Don't try to find .babelrc because we want to force this configuration.
  babelrc: false,

  // Faster transpiling for minor loose in formatting
  compact: true,

  // Keep origin information alive
  sourceMaps: true,

  // Nobody needs the original comments when having source maps
  comments: false,

  presets:
  [
    // exponentiation
    "babel-preset-es2016",

    // async to generators + trailing function commas
    "babel-preset-es2017",

    // JSX, Flow
    "babel-preset-react"
  ],

  plugins:
  [
    // Optimization for lodash imports
    "lodash",

    // just the parts from es2015 preset which are required for supporting
    // transform-object-rest-spread" support (which always must be transpiled)
    "transform-es2015-spread",
    "transform-es2015-destructuring",

    // class { handleClick = () => { } }
    "transform-class-properties",

    // { ...todo, completed: true }
    "transform-object-rest-spread",

    // Polyfills the runtime needed
    [ "transform-runtime", { regenerator: false } ]
  ]
}
