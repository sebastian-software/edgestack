import notifier from "node-notifier"
import colors from "colors"

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
      console.log(colors.yellow(message))
      break

    case "error":
      console.log(colors.bgRed.white(message))
      break

    case "info":
    default:
      console.log(colors.green(message))
  }
}
