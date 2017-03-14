import { wrapCallSite } from "source-map-support"

const filterFunctionNames = [ /__webpack_require__/ ]
const filterSourceFiles = [ /\/webpack\/bootstrap/ ]
const clearFunctionNames = [ /__webpack_exports__/ ]
const clearTypeNames = [ /^Object$/ ]


/**
 * Processes a single CallSite entry to filter out build tool related or internal APIs.
 * During this process the method also uses source maps to figure out the original source location.
 * The CallSite API is documented in here: https://github.com/v8/v8/wiki/Stack-Trace-API#customizing-stack-traces
 * @param {CallSite} The current CallSite object to process.
 * @return {String} Stringified CallSite object with usage of source maps to refer source location
 */
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

  // Ignore some cryptic function names which typically are just function calls
  if (clearFunctionNames.some((regexp) => regexp.test(functionName))) {
    functionName = ""
  }

  // Filter out configured type names
  if (clearTypeNames.some((regexp) => regexp.test(typeName))) {
    typeName = ""
  }

  // Strip out generated filename part from source field
  sourceFile = sourceFile.split(":")[1] || sourceFile
  if (sourceFile.charAt(0) === "/") {
    sourceFile = sourceFile.slice(1)
  }

  // Retrieve source file locations
  const lineNumber = wrappedFrame.getLineNumber()
  const columnNumber = wrappedFrame.getColumnNumber()

  // Stack frames are displayed in the following format:
  //   at FunctionName (<Fully-qualified name/URL>:<line number>:<column number>)
  // Via: https://docs.microsoft.com/en-us/scripting/javascript/reference/stack-property-error-javascript
  return `at ${functionName || typeName}@${sourceFile}:${lineNumber}:${columnNumber}`
}


/**
 * Build the stack property for V8 as V8 is documented to use whatever this call returns
 * as the value of the stack property.
 * @param {Error} error the error object
 * @param {CallSite[]} structuredStackTrace a structured representation of the stack
 * @return {String} Generated `stack` property for error object
 */
export function prepareStackTrace(error, structuredStackTrace)
{
  return structuredStackTrace.map((frame) => frameToString(frame))
    .filter((item) => item != null)
    .join("\n")
}


/**
 * Enable enhanced stack traces
 */
export function enableEnhancedStackTraces() {
  // Override native Promise API with faster and more developerr friendly bluebird
  global.Promise = require("bluebird")

  /* eslint-disable no-use-extend-native/no-use-extend-native */
  Promise.config({
    longStackTraces: true
  })

  // Enable by hooking into V8 Stacktrace API integration
  // https://github.com/v8/v8/wiki/Stack-Trace-API
  Error.prepareStackTrace = prepareStackTrace
}
