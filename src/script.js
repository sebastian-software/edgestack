/* eslint-disable no-console */
import chalk from "chalk"
import clearConsole from "react-dev-utils/clearConsole"

import build from "./scripts/build"
import start from "./scripts/start"
import bootstrap from "./scripts/bootstrap"

import packageConfig from "../package.json"

const ARGSPOS_SCRIPT = 2
const ARGSPOS_ARGUMENTS = 3

var script = process.argv[ARGSPOS_SCRIPT]
var args = process.argv.slice(ARGSPOS_ARGUMENTS)

function header()
{
  clearConsole()
  console.log(
    chalk.cyan(`\n${packageConfig.name} ${packageConfig.version}`),
    chalk.gray(`\n${packageConfig.description}`),
    "\n"
  )
}
function help()
{
  console.log(
    "\nSyntax: edge <command>",
    "\n\nCommands:",
    "\n  start      Start development server",
    "\n  build      Create production build",
    "\n  bootstrap  Bootstraps a new edge stack project",
    "\n\nOptions for bootstrap:",
    "\n    [--title <title>]               Title of new application",
    "\n    [--description <description>]   Description of new application",
    "\n    [--language <xx-YY>]            Language of application in format xx-YY",
    "\n    [--overwrite <y/n>]             Overwrite existing source code"
  )
}

header()

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
    console.log(chalk.red("No script name given!"))
    help()
    break

  default:
    console.log(chalk.red(`Unknown script "${script}"!`))
    help()
    break
}
