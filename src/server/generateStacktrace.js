import fs from "fs"
import chalk from "chalk"
import { wrapCallSite } from "source-map-support"
import { startsWith, repeat } from "lodash"
import appRootDir from "app-root-dir"

const LINES_AROUND_STACK_POSITION = 5
const SHOW_EXTENDED_STACKTRACE = false
const ROOT_DIR = appRootDir.get()

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

function generateMessage({
  filename,
  line,
  column,
  message,
  stackTrace
})
{
  return readFile(filename).then((wholeFileContent) => {
    const result = [
      chalk.red(`Error in file ${filename} (${line}:${column})\n`)
    ]
    const nullLine = line - 1
    const fileContent = wholeFileContent.split("\n")
    const startLine = Math.max(nullLine - LINES_AROUND_STACK_POSITION, 0)
    const endLine = Math.min(nullLine + LINES_AROUND_STACK_POSITION, fileContent.length)

    for (let counter = startLine; counter < nullLine; counter++) {
      result.push(chalk.gray(fileContent[counter]))
    }

    result.push(chalk.blue(fileContent[nullLine]))
    result.push(chalk.red(`${repeat(" ", column - 1)}^ Error: ${message}`))

    for (let counter = nullLine + 1; counter < endLine; counter++) {
      result.push(chalk.gray(fileContent[counter]))
    }

    result.push()
    result.push(stackTrace)

    return result.join("\n")
  })
}

function frameToString(frame)
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
  else if (!SHOW_EXTENDED_STACKTRACE)
    return null

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

  if (!SHOW_EXTENDED_STACKTRACE)
    return null

  return {
    ...wrappedFrame,
    toParsed,
    toString: () => chalk.dim(wrappedFrame.toString().replace(ROOT_DIR, "."))
  }
}

Error.prepareStackTrace = function prepareStackTrace(error, stack)
{
  const wrappedStack = stack.map((frame) => frameToString(frame)).filter((item) => Boolean(item))
  const toString = error + wrappedStack.map((frame) =>
  {
    return `\n  at ${frame}`
  }).join("")

  return {
    toString: () => toString,
    rawStack: () => wrappedStack
  }
}

export default async function generateStacktrace(error)
{
  if (!error || !error.stack || !error.stack.rawStack)
    return error

  const parsedStackRoot = error.stack.rawStack()[0].toParsed()

  return await generateMessage({
    filename: parsedStackRoot.sourceFile,
    line: parsedStackRoot.lineNumber,
    column: parsedStackRoot.columnNumber,
    message: error.message,
    stackTrace: error.stack
  })
}
