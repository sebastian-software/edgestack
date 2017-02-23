#!/usr/bin/env node
/* eslint-disable */

const appRootDir = require("app-root-dir").get
const { mkdtempSync, writeFileSync } = require("fs")
const path = require("path")
const { tmpdir, platform } = require("os")
const { execSync, fork } = require("child_process")
const { request } = require("http")
const chalk = require("chalk")

function log(message)
{
  console.log(chalk.cyan(`+ ${message}`))
}

const CWD = appRootDir()
log(`Source path: ${CWD}`)
const TESTPATH = mkdtempSync(path.join(tmpdir(), "edge-"))
log(`Temp path:   ${TESTPATH}`)

const SRC_EXEC = {
  cwd: CWD
}
const TARGET_EXEC = {
  cwd: TESTPATH
}

function exec(cmd, options)
{
  log(`Execute: ${cmd}`)
  options.stdio = "inherit"
  return execSync(cmd, options)
}

if (platform() !== "win32")
{
  try
  {
    exec("yarn unlink", SRC_EXEC)
  }
  catch (error)
  {
    // ignore unlink failure
  }

  exec("yarn link", SRC_EXEC)
}

log(`Write package.json to ${TESTPATH}`)
writeFileSync(
  path.join(TESTPATH, "package.json"),
  JSON.stringify({
    "name":"test",
    "version":"1.0.0",
    "devDependencies": {
      "cross-env": "^3.1.4"
    },
    "scripts": {
      "prod":"cross-env NODE_ENV=production edge build"
    }
  }, null, 2),
  "utf8"
)

if (platform() !== "win32")
{
  exec(`yarn add file:${CWD}`, TARGET_EXEC)
  exec("yarn link edgestack", TARGET_EXEC)
}
else
  exec(`npm install ${CWD}`, TARGET_EXEC)

const edgeCommand = path.join("node_modules", ".bin", "edge")
exec(`${edgeCommand} bootstrap --title="Test" --description="Test" --language="de-DE"`, TARGET_EXEC)

if (platform() !== "win32")
{
  exec("yarn install", TARGET_EXEC)
  exec("yarn run prod", TARGET_EXEC)
}
else {
  exec("npm install", TARGET_EXEC)
  exec("npm run prod", TARGET_EXEC)
}

const serverProcess = fork(path.join(TESTPATH, "build", "server", "main.js"), [], {
  cwd: TESTPATH,
  stdio: "inherit"
})
serverProcess.on("exit", (code) =>
{
  if (code)
    process.exit(2)
})

function quitProcess(exitCode)
{
  log(`Output path: ${TESTPATH}`)
  log(`Exit code:   ${exitCode}`)
  serverProcess.kill("SIGKILL")
  process.exit(exitCode)
}

function check()
{
  const options = {
    hostname: 'localhost',
    port: 1339,
    path: '/',
    method: 'GET'
  }

  const req = request(
    options,
    (res) => {
      if (res.statusCode !== 200)
        quitProcess(1)

      const chunks = []
      res.on("data", (chunk) =>
      {
        chunks.push(chunk)
      })
      res.on('end', () =>
      {
        console.log(
          Buffer.concat(chunks).toString("utf8")
        )

        quitProcess(0)
      })
      res.on('error', () =>
      {
        quitProcess(3)
      })
    }
  )

  req.on("error", () => {
    quitProcess(1)
  })

  req.end()
}

setTimeout(check, 2000)
