import buble from "rollup-plugin-buble"
import json from "rollup-plugin-json"
import executable from "rollup-plugin-executable"
import builtinModules from "builtin-modules"

// eslint-disable-next-line import/no-commonjs
var packageJson = require("./package.json")
var external = Object.keys(packageJson.dependencies).concat(builtinModules)

export default {
  entry: "src/script.js",
  dest: "bin/advanced-script.js",
  format: "cjs",
  sourceMap: true,
  external,
  banner: "#!/usr/bin/env node\n",
  plugins: [
    json(),
    buble(),
    executable()
  ]
}
