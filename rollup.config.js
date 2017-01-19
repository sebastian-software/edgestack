import buble from "rollup-plugin-buble"
import json from "rollup-plugin-json"
import builtinModules from "builtin-modules"

// eslint-disable-next-line import/no-commonjs
var pkg = require("./package.json")
var external = Object.keys(pkg.dependencies).concat(builtinModules)

export default {
  entry: "src/script.js",
  dest: "bin/advanced-script.js",
  format: "cjs",
  sourceMap: true,
  external,
  banner: "#!/usr/bin/env node\n",
  plugins: [
    json(),
    buble()
  ]
}
