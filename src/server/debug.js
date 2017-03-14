// Override native Promise API with faster and more developerr friendly bluebird
global.Promise = require("bluebird")
Promise.config({ longStackTraces: true })

// Override Promise in Polyfill API
// require("babel-runtime/core-js/promise").default = require("bluebird")

import StackTrace from "stack-trace"
import cleanStack from "clean-stack"
import StackUtils from "stack-utils"
import { wrapCallSite } from "source-map-support"

const filterFunctionNames = [ /__webpack_require__/ ]
const filterSourceFiles = [ /\/webpack\/bootstrap/ ]
const clearFunctionNames = [ /__webpack_exports__/ ]

export function frameToString(frame)
{
  const wrappedFrame = wrapCallSite(frame)
  const generatedFile = frame.getFileName()

  var sourceFile = wrappedFrame.getFileName()
  var functionName = wrappedFrame.getFunctionName()
  var typeName = wrappedFrame.getTypeName()

  // Filter out all raw files which do not have any source mapping
  // This typically removes most of the build related infrastructure
  // which is neither application or framework code.
  const isCompiled = sourceFile !== generatedFile
  if (!isCompiled) {
    return null
  }

  // Filter out specific functions e.g. webpack require wrappers
  if (filterFunctionNames.some((regexp) => regexp.test(functionName))) {
    return null
  }

  // Filter out specific source files e.g. webpack bootstrap implementation
  if (filterSourceFiles.some((regexp) => regexp.test(sourceFile))) {
    return null
  }

  // Retrieve source file locations
  const lineNumber = wrappedFrame.getLineNumber()
  const columnNumber = wrappedFrame.getColumnNumber()

  // Strip out generated filename part from source field
  sourceFile = sourceFile.split(":")[1] || sourceFile
  if (sourceFile.charAt(0) === "/") {
    sourceFile = sourceFile.slice(1)
  }

  // Ignore some cryptic function names which typically are just function calls
  if (clearFunctionNames.some((regexp) => regexp.test(functionName))) {
    functionName = ""
  }

  // Stack frames are displayed in the following format:
  //   at FunctionName (<Fully-qualified name/URL>:<line number>:<column number>)
  // Via: https://docs.microsoft.com/en-us/scripting/javascript/reference/stack-property-error-javascript
  return `at ${functionName || typeName}@${sourceFile}:${lineNumber}:${columnNumber}`
}

export function prepareStackTrace(error, structuredStackTrace)
{
  return structuredStackTrace.map((frame) => frameToString(frame))
    .filter((item) => item != null)
    .join("\n")
}
