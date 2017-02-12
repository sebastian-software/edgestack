import { resolve } from "path"
import rimraf from "rimraf"
import webpack from "webpack"
import { series } from "async"

import chalk from "chalk"

import ConfigFactory from "../webpack/ConfigFactory"

function niceStattrace(error)
{
  const [ file, message, ...stack ] = error.split("\n")

  return [
    "",
    "",
    `${chalk.cyan(file)}: ${chalk.red(message)}`,
    "",
    ...stack.map((row) => chalk.white(`\t${row}`)),
    "",
    ""
  ].join("\n")
}

/* eslint-disable no-process-exit */
export default function build()
{
  const buildFolderClient = resolve("build", "client")
  const buildFolderServer = resolve("build", "server")

  series([
    function(callback)
    {
      // Remove all content but keep the directory so that
      // if you're in it, you don't end up in Trash
      rimraf(`${buildFolderClient}/*`, callback)
    },
    function(callback)
    {
      // Remove all content but keep the directory so that
      // if you're in it, you don't end up in Trash
      rimraf(`${buildFolderServer}/*`, callback)
    },
    function(callback)
    {
      console.log("Creating a production build for client...")
      webpack(ConfigFactory({ target: "web", mode: "production" })).run((error, stats) =>
      {
        if (error)
        {
          console.error("Failed to create a production build for client:")
          console.error(error.message || error)
          process.exit(1)
        }

        // fixme: remove this snippet when https://github.com/webpack/webpack/issues/2390 is fixed
        if (stats.hasErrors()) {
          console.error("Failed to create a production build for client:")
          stats.toJson("errors-only").errors.forEach((statError) =>
          {
            console.error(niceStattrace(statError))
          })
          process.exit(1)
        }

        callback()
      })
    },
    function(callback)
    {
      console.log("Creating a production build for server...")
      webpack(ConfigFactory({ target: "node", mode: "production" })).run((error, stats) =>
      {
        if (error)
        {
          console.error("Failed to create a production build for server:")
          console.error(error.message || error)
          process.exit(1)
        }

        // fixme: remove this snippet when https://github.com/webpack/webpack/issues/2390 is fixed
        if (stats.hasErrors()) {
          process.exit(1)
        }

        callback()
      })
    }
  ])
}
