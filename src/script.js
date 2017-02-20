import build from "./scripts/build"
import start from "./scripts/start"
import bootstrap from "./scripts/bootstrap"

const SCRIPT_NAME_POS = 2
const SCRIPT_ARGS_POS = 3

var script = process.argv[SCRIPT_NAME_POS]
var args = process.argv.slice(SCRIPT_ARGS_POS)

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
