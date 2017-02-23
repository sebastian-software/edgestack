/* eslint-disable max-params, no-console */
import fs from "fs-extra"
import pathModule from "path"
import promptModule from "prompt"
import chalk from "chalk"
import { mapKeys } from "lodash"
import findRoot from "find-root"
import walker from "walker"
import minimist from "minimist"

const ROOT = findRoot(require.main.filename)

promptModule.message = chalk.blue("> ")
promptModule.delimiter = chalk.green(" ")

function exists(path)
{
  try
  {
    const stat = fs.statSync(path)
    return Boolean(stat)
  }
  catch (error)
  {
    return error.code !== "ENOENT"
  }
}

function prompt(config) {
  return new Promise((resolve, reject) =>
  {
    promptModule.get(config, (error, results) =>
    {
      if (error)
        return reject(error)

      return resolve(results)
    })
  })
}

async function checkOutputPath(srcPath)
{
  if (exists(srcPath)) {
    const result = await prompt([
      {
        name: "overwrite",
        description: "There seems to be a src folder. Should I overwrite files if needed? (Y/N) ",
        required: true,
        pattern: /^[ynYN]$/,
        message: "Only Y and N is allowed"
      }
    ])
    return [ "y", "Y" ].includes(result.overwrite)
  }

  return true
}

async function askDefaultQuestions()
{
  const promptConfig = [
    {
      name: "title",
      description: "Titel of your web application",
      required: true,
      type: "string",
      default: "Testsite"
    },

    {
      name: "description",
      description: "Short description of your web application",
      required: false,
      default: "",
      type: "string"
    },

    {
      name: "language",
      description: "Language of your web application (e.g. de-DE or en-GB)",
      required: false,
      pattern: /^[a-z]{2}-[A-Z]{2}$/,
      message: "Please provide a language in format xx-YY",
      default: "en-GB"
    }
  ]

  const config = await prompt(promptConfig)
  return mapKeys(config, (value, key) => `ADVANCED-BOILERPLATE-${key.toUpperCase()}`)
}

function copyFile(source, dest, replacementCallback)
{
  return new Promise((resolve, reject) =>
  {
    fs.readFile(source, "utf-8", (readError, data) =>
    {
      if (readError)
        return reject(readError)

      let replacedData = data
      if (replacementCallback)
        replacedData = data.replace(/{{\S+?}}/g, replacementCallback)

      return fs.outputFile(dest, replacedData, (writeError) =>
      {
        if (writeError)
          return reject(writeError)

        return resolve()
      })
    })
  })
}

function writeFile(dest, content)
{
  return new Promise(
    (resolve, reject) => fs.outputFile(dest, content, (writeError) =>
    {
      if (writeError)
        return reject(writeError)

      return resolve()
    })
  )
}

function templateWalker(startPath, targetPath, replacementCallback)
{
  const promisedChanges = []
  return new Promise((resolve, reject) =>
  {
    walker(startPath)
      .on("file", (file, stat) =>
      {
        promisedChanges.push(
          copyFile(file, pathModule.join(targetPath, pathModule.relative(startPath, file)), replacementCallback)
        )
      })
      .on("error", (error, entry) =>
      {
        console.error(chalk.red(`Error ${error} on entry ${entry}`))
      })
      .on("end", async () => {
        await Promise.all(promisedChanges)
        resolve()
      })
  })
}

function createBoilerplate(config, targetSrcPath)
{
  const KEY_INDICATOR_LENGTH = 2

  return templateWalker(pathModule.join(ROOT, "template"), targetSrcPath, (replaceKey) =>
  {
    const key = replaceKey.substring(KEY_INDICATOR_LENGTH, replaceKey.length - KEY_INDICATOR_LENGTH)
    if (key in config)
      return config[key]

    console.log(chalk.red(`Replacement key ${key} not found in config`))
    return key
  })
}

async function createConfigFiles(targetPath)
{
  await Promise.all([
    copyFile(
      pathModule.join(ROOT, ".env.example"),
      pathModule.join(targetPath, ".env")
    ),

    copyFile(
      pathModule.join(ROOT, "public", "favicon.ico"),
      pathModule.join(targetPath, "public", "favicon.ico")
    ),

    writeFile(
      pathModule.join(targetPath, ".gitignore"),
      `
# Environment Configuration
.env

# Build output folders
build/
dist/
lib/
bin/

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed

# Dependency directory
# https://www.npmjs.org/doc/misc/npm-faq.html#should-i-check-my-node_modules-folder-into-git-
node_modules

# Debug log from npm
npm-debug.log

# Cache file from ESLint, Happypack
.eslintcache
.happypack
.hardsource
.recordscache
      `
    )
  ])

  console.log(chalk.green("You might want to change the .env file in current directory"))
}

function patchPackageScripts(targetPath)
{
  const PACKAGE_JSON_FILENAME = pathModule.join(targetPath, "package.json")
  return new Promise((resolve, reject) =>
  {
    fs.readJson(PACKAGE_JSON_FILENAME, (readError, data) =>
    {
      if (readError)
        return reject(readError)

      const newData = {
        scripts: {},
        devDependencies: {},
        browserslist: [ "last 2 versions", "not ie <= 9" ],
        ...data
      }

      newData.scripts.start = "edge start"
      newData.scripts.prod = "cross-env DISABLE_HARDSOURCE=true NODE_ENV=production edge build"
      newData.scripts["prod:start"] = "npm run prod && node build/server/main.js"
      newData.scripts.clean = "rimraf build/client/* build/server/*"

      newData.devDependencies = {
        "cross-env": "^3.1.4",
        "eslint": "^3.16.1",
        "intl": "^1.2.5",
        "isomorphic-fetch": "^2.2.1",
        "react": "^15.4.2",
        "react-dom": "^15.4.2",
        "react-intl": "^2.2.3",
        "readable-code": "^1.3.3",
        "rimraf": "^2.6.0"
      }

      return fs.writeJson(PACKAGE_JSON_FILENAME, newData, (writeError) =>
      {
        if (writeError)
          return reject(writeError)

        return resolve()
      })
    })
  })
}

export default async function bootstrap(args) {
  const argv = minimist(args)
  promptModule.override = argv

  const CURRENT_WORKING_DIR = process.cwd()
  const SRC_PATH = pathModule.join(CURRENT_WORKING_DIR, "src")

  const outputOkay = await checkOutputPath(SRC_PATH)
  if (!outputOkay)
    throw new Error(
      "Cannot savely write bootstrap files as a src " +
      "folder exists. Please make sure existing files are save."
    )

  try
  {
    const config = await askDefaultQuestions()
    await createBoilerplate(config, SRC_PATH)
    await createConfigFiles(CURRENT_WORKING_DIR)
    await patchPackageScripts(CURRENT_WORKING_DIR)
  }
  catch (error)
  {
    console.log(`Aborting. ${error.message}`)
  }
}
