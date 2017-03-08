import stacktrace from "stack-trace"
import fs from "fs"
import chalk from "chalk"

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
    result.push(chalk.yellow(stackTrace))

    return result.join("\n")
  })
}

export default async function generateStacktrace(error)
{
  if (!error || !error.stack)
    return error

  const parsedStack = stacktrace.parse(error)

  if (parsedStack.length <= 0 || (!parsedStack[0].fileName.includes("webpack:")))
    return error

  return await getSourceContent({
    filename: `.${parsedStack[0].fileName.split("webpack:")[1]}`,
    line: parsedStack[0].lineNumber,
    col: parsedStack[0].columnNumber,
    errorMessage: error.message,
    stackTrace: error.stack
  })
}
