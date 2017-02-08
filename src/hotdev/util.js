import notifier from "node-notifier"
import chalk from "chalk"

export function createNotification(options)
{
  const title = `${options.title.toUpperCase()}`

  if (options.notify) {
    notifier.notify({
      title,
      message: options.message
    })
  }

  const level = options.level || "info"
  const message = `==> ${title} -> ${options.message}`

  switch (level) {
    case "warn":
      console.log(chalk.yellow(message))
      break

    case "error":
      console.log(chalk.bgRed.white(message))
      break

    case "info":
    default:
      console.log(chalk.green(message))
  }
}
