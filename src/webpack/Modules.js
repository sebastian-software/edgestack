import { readdirSync } from "fs"
import { resolve } from "path"
import { readJsonSync } from "fs-extra"

const root = "node_modules"
const Modules = new Set()

const nodePackages = readdirSync(root).filter((dirname) => dirname.charAt(0) !== ".")

nodePackages.forEach((packageName) =>
{
  try {
    var json = readJsonSync(resolve(root, packageName, "package.json"))
  } catch (error) {
    return
  }

  if (json.module || json.style || json["jsnext:main"])
    Modules.add(packageName)
})

export default Modules
