import fs from "fs"
import path from "path"
import eachOf from "async/eachOf"
import readJson from "read-package-json"

function readDir(dirName)
{
  try
  {
    return fs.readdirSync(dirName)
  }
  catch (e)
  {
    return []
  }
}

const root = "node_modules"
const nodeModules = readDir(root).filter((dirname) => dirname.charAt(0) !== ".")

const modules = {}
eachOf(nodeModules, (pkg, pos, callback) =>
{
  readJson(path.resolve(root, pkg, "package.json"), function(err, json)
  {
    if (err)
    {
      callback()
    }
    else if (json["jsnext:main"] || json["module"])
    {
      modules[pkg] = true
      callback();
    }
    else
    {
      callback();
    }
  })
},
function(err, results) {
  console.log("Packages with ES Modules:", modules)
})

export default modules
