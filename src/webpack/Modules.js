import { readdirSync } from "fs"
import { resolve } from "path"
import { readJsonSync } from "fs-extra"

const root = "node_modules"
const modules = new Set()

const nodePackages = readdirSync(root).filter((dirname) => dirname.charAt(0) !== ".")

nodePackages.forEach((pkg) =>
{
  var json = readJsonSync(resolve(root, pkg, "package.json"))
  if (json.module || json.style || json["jsnext:main"])
    modules.add(pkg)
})

export default modules
