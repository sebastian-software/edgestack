const babel = require("babel-core")
const glob = require("glob")
const fs = require("fs-extra")

const configEs = require("../config/babel.es.js")
const configLib = require("../config/babel.lib.js")

const SRC_FOLDER = "src/"

// ES5 + ES2015 modules folder
const ES_FOLDER = "es/"

// Plain CommonJS ES5
const LIB_FOLDER = "lib/"

glob(SRC_FOLDER + "**/*.{js,jsx,es}", {}, function(err, files)
{
  console.log("Deleting folder " + ES_FOLDER + "...")
  fs.removeSync(ES_FOLDER)

  console.log("Deleting folder " + LIB_FOLDER + "...")
  fs.removeSync(LIB_FOLDER)

  files.forEach((entry) =>
  {
    esFile = ES_FOLDER + entry.slice(SRC_FOLDER.length);
    console.log("Writing file " + esFile + "...")

    const resultEs = babel.transformFileSync(entry, configEs)
    fs.outputFileSync(esFile, resultEs.code)

    libFile = LIB_FOLDER + entry.slice(SRC_FOLDER.length);
    console.log("Writing file " + libFile + "...")

    const resultLib = babel.transformFileSync(entry, configLib)
    fs.outputFileSync(libFile, resultLib.code)
  })
})
