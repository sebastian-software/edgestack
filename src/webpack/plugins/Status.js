export default class StatusPlugin
{
  constructor({ name, start, done })
  {
    this.name = name

    this.start = start
    this.done = done

    this.watcher = null
    this.running = false
  }

  checkDone = () => {
    // console.log(">>> STATUS: Build is ready:", this.name)
    this.running = false
    this.done()
  }

  apply(compiler)
  {
    compiler.plugin("done", (stats) => {
      if (!stats.hasErrors()) {
        this.watcher = setTimeout(this.checkDone, 0)
      }
    })

    compiler.plugin("compile", (stats) => {
      if (this.watcher) {
        clearTimeout(this.watcher)
      }

      if (!this.running) {
        // console.log(">>> STATUS: Compiling:", this.name)
        this.running = true
        this.start()
      }
    })
  }
}
