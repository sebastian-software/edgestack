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
    // let, const, destructuring, classes, modules
    "babel-preset-es2015",

    // exponentiation
    "babel-preset-es2016",

    // JSX, Flow
    "babel-preset-react",
  ],

  plugins:
  [
    // function x(a, b, c,) { }
    "syntax-trailing-function-commas",

    // class { handleClick = () => { } }
    "transform-class-properties",

    // { ...todo, completed: true }
    "transform-object-rest-spread",

    // Polyfills the runtime needed
    [ "transform-runtime", {
      regenerator: false
    }]
  ]
}
