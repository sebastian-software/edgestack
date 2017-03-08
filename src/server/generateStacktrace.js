import fs from "fs"
import chalk from "chalk"
import { wrapCallSite } from "source-map-support"
import { startsWith } from "lodash"
import appRootDir from "app-root-dir"

const LINES_AROUND_STACK_POSITION = 5

function readFile(filename)
{
  return new Promise((resolve, reject) =>
  {
    fs.readFile(filename, "utf8", (error, data) =>
    {
      if (error)
        return reject(error)

      return resolve(data)
    })
  })
}

function padding(characters)
{
  let result = ""
  while (result.length < characters)
    result += " "

  return result
}

function getSourceContent({
  filename,
  line,
  col,
  errorMessage,
  stackTrace
})
{
  return readFile(filename).then((wholeFileContent) => {
    const result = [
      chalk.cyan(`Error in file ${filename} (${line}:${col})\n`)
    ]
    const nullLine = line - 1
    const fileContent = wholeFileContent.split("\n")
    const startLine = Math.max(nullLine - LINES_AROUND_STACK_POSITION, 0)
    const endLine = Math.min(nullLine + LINES_AROUND_STACK_POSITION, fileContent.length)

    for (let counter = startLine; counter < nullLine; counter++)
    {
      result.push(chalk.gray(fileContent[counter]))
    }
    result.push(chalk.red(fileContent[nullLine]))
    result.push(chalk.cyan(`${padding(col - 1)}^--- Error: ${errorMessage}`))
    for (let counter = nullLine + 1; counter < endLine; counter++)
    {
      result.push(chalk.gray(fileContent[counter]))
    }

    result.push()
    result.push(stackTrace)

    return result.join("\n")
  })
}

function frameToString(frame, rootDir)
{
  const wrappedFrame = wrapCallSite(frame)

  const name = wrappedFrame.getFunctionName() || `${wrappedFrame.getTypeName()}.<anonymous>`
  const sourceFilePointer = wrappedFrame.getFileName()
  const generatedFile = frame.getFileName()
  const lineNumber = wrappedFrame.getLineNumber()
  const columnNumber = wrappedFrame.getColumnNumber()
  const isCompiled = sourceFilePointer !== generatedFile
  let sourceFile = generatedFile

  if (isCompiled)
    sourceFile = `.${sourceFilePointer.split(":")[1]}`

  const toParsed = () => ({
    name,
    generatedFile,
    sourceFile,
    lineNumber,
    columnNumber,
    isCompiled
  })

  if (isCompiled && !startsWith(sourceFile, "./webpack/bootstrap"))
  {
    const color = chalk.red
    const output = [
      `${color(name)} `,
      chalk.dim("("),
      color(`${sourceFile}:${lineNumber}:${columnNumber}`),
      chalk.dim(`)`)
    ].join("")

    return {
      ...wrappedFrame,
      toString: () => output,
      toParsed
    }
  }

  return {
    ...wrappedFrame,
    toParsed,
    toString: () => chalk.dim(wrappedFrame.toString().replace(rootDir, "."))
  }
}

function enableWebpackServerStacktrace()
{
  const rootDir = appRootDir.get()
  Error.prepareStackTrace = function prepareStackTrace(error, stack) {
    const wrappedStack = stack.map((frame) => frameToString(frame, rootDir))
    const toString = error + wrappedStack.map((frame) =>
    {
      return `\n    at ${frame}`
    }).join("")

    return {
      toString: () => toString,
      rawStack: () => wrappedStack
    }
  }
}

enableWebpackServerStacktrace()

export default async function generateStacktrace(error)
{
  if (!error || !error.stack || !error.stack.rawStack)
    return error

  const parsedStackRoot = error.stack.rawStack()[0].toParsed()

  return await getSourceContent({
    filename: parsedStackRoot.sourceFile,
    line: parsedStackRoot.lineNumber,
    col: parsedStackRoot.columnNumber,
    errorMessage: error.message,
    stackTrace: error.stack
  })
}
