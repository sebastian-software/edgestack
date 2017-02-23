#!/usr/bin/env node
/* eslint-disable */

const appRootDir = require("app-root-dir").get
const { mkdtempSync, writeFileSync } = require("fs")
const path = require("path")
const { tmpdir } = require("os")
const { execSync, fork } = require("child_process")
const { request } = require("http")

const CWD = appRootDir()
const TESTPATH = mkdtempSync(path.join(tmpdir(), "edge-"))
console.log(`Temp path: ${TESTPATH}`)

const SRC_EXEC = {
  cwd: CWD
}
const TARGET_EXEC = {
  cwd: TESTPATH
}

function exec(cmd, options)
{
  console.log("Execute ", cmd)
  return execSync(cmd, options)
}

try
{
  exec("yarn unlink", SRC_EXEC)
}
catch (error)
{
  // ignore unlink failure
}

exec("yarn link", SRC_EXEC)

console.log("Write package.json")
writeFileSync(
  path.join(TESTPATH, "package,json"),
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

exec(`yarn add file:${CWD}`, TARGET_EXEC)
exec("yarn link edgestack", TARGET_EXEC)

exec('node_modules/.bin/edge bootstrap --title="Test" --description="Test" --language="de-DE"', TARGET_EXEC)

exec("yarn install", TARGET_EXEC)
exec("yarn run prod", TARGET_EXEC)

const serverProcess = fork(path.join(TESTPATH, "build", "server", "main.js"), [], {
  cwd: TESTPATH
})
serverProcess.on("exit", (code) =>
{
  if (code)
    process.exit(2)
})

function quitProcess(exitCode)
{
  serverProcess.kill(9)
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

      res.setEncoding('utf8')

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
      })

      quitProcess(0)
    }
  )

  req.on("error", () => {
    quitProcess(1)
  })

  req.end()
}

setTimeout(check, 2000)
