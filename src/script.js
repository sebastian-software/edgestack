var spawn = require("cross-spawn");
var script = process.argv[2];
var args = process.argv.slice(3);

import build from "./scripts/build"
import start from "./scripts/start"

switch (script)
{
  case "build":
    build()
    break

  case "start":
    start()
    break

  /*
  case "build":
  case "start":
    var result = spawn.sync(
      "node",
      [ require.resolve(`../lib/scripts/${script}`) ].concat(args),
      { stdio: "inherit" }
    );
    process.exit(result.status);
    break;
  */

  case null:
  case undefined:
    console.log("No script name given!");
    break;

  default:
    console.log(`Unknown script "${script}"!`);
    break;
}
