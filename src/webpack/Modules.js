import fs from "fs"
import path from "path"
import { readJsonSync } from "fs-extra"

const root = "node_modules"
const modules = new Set

const nodePackages = fs.readdirSync(root).filter((dirname) => dirname.charAt(0) !== ".")

nodePackages.forEach(function(pkg)
{
  var json = readJsonSync(path.resolve(root, pkg, "package.json"))
  if (json["jsnext:main"] || json["module"])
    modules.add(pkg)
})

export default modules
