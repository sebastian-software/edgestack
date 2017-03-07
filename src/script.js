/* eslint no-console: off */
import build from "./scripts/build"
import start from "./scripts/start"
import bootstrap from "./scripts/bootstrap"

const ARGSPOS_SCRIPT = 2
const ARGSPOS_ARGUMENTS = 3

var script = process.argv[ARGSPOS_SCRIPT]
var args = process.argv.slice(ARGSPOS_ARGUMENTS)

switch (script)
{
  case "build":
    build(args)
    break

  case "start":
    start(args)
    break

  case "bootstrap":
    bootstrap(args)
    break

  case null:
  case undefined:
    console.log("No script name given!")
    break

  default:
    console.log(`Unknown script "${script}"!`)
    break
}
