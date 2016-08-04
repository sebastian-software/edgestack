#!/usr/bin/env node

var spawn = require("cross-spawn");
var script = process.argv[2];
var args = process.argv.slice(3);

switch (script)
{
  case "build":
  case "start":
  case "api":
    var result = spawn.sync(
      "node",
      [ require.resolve(`../scripts/${script}`) ].concat(args),
      { stdio: "inherit" }
    );
    process.exit(result.status);
    break;

  case null:
  case undefined:
    console.log("No script name given!");
    break;

  default:
    console.log(`Unknown script "${script}"!`);
    break;
}
