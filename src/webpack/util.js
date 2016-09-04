import notifier from "node-notifier"

function createNotification(options = {})
{
  notifier.notify({
    title: options.title,
    message: options.message,
    open: options.open,
  })

  console.log(`${options.title}: ${options.message}`)
}

export {
  createNotification
}
