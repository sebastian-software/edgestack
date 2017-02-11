import { createNotification } from "./util"

export default class HotServerManager
{
  constructor(compiler)
  {
    compiler.plugin("done", (stats) =>
    {
      if (stats.hasErrors())
      {
        createNotification({
          title: "Hot Server Manager",
          level: "error",
          message: "Build failed, check the console for more information.",
          notify: true
        })

        console.log(stats.toString())
        return
      }
    })

    // Lets start the compiler.
    this.watcher = compiler.watch(null, () => undefined)
  }

  dispose()
  {
    this.disposing = true
    this.watcher.close()
  }
}
