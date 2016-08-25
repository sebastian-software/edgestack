import build from "./scripts/build"
import start from "./scripts/start"

var script = process.argv[2];
var args = process.argv.slice(3);

switch (script)
{
  case "build":
    build(args)
    break

  case "start":
    start(args)
    break

  case null:
  case undefined:
    console.log("No script name given!")
    break

  default:
    console.log(`Unknown script "${script}"!`)
    break
}
