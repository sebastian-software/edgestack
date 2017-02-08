import babel from "rollup-plugin-babel"
import json from "rollup-plugin-json"
import builtinModules from "builtin-modules"

/* eslint-disable import/no-commonjs */
var config = require("./package.json")
var external = Object.keys(config.dependencies).concat(builtinModules)

export default {
  entry: "src/script.js",
  dest: "bin/advanced-script.js",
  format: "cjs",
  sourceMap: true,
  external,
  banner: "#!/usr/bin/env node\n",
  plugins: [
    json(),
    babel({
      // Don't try to find .babelrc because we want to force this configuration.
      babelrc: false,

      // Nobody needs the original comments when having source maps
      comments: false,

      presets:
      [
        [ "env", {
          targets: { node: 6 },
          modules: false
        }]
      ],

      plugins: [
        // { ...todo, completed: true }
        [ "transform-object-rest-spread", { useBuiltIns: true }]
      ]
    })
  ]
}
