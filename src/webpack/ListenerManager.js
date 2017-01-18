class ListenerManager {
  constructor(server) {
    this.lastConnectionKey = 0
    this.connectionMap = {}
    this.started = false

    server.then((listener) =>
    {
      this.started = true
      this.listener = listener

      // Track all connections to our server so that we can close them when needed.
      this.listener.on("connection", (connection) => {
        // Generate a new key to represent the connection
        const connectionKey = ++this.lastConnectionKey

        // Add the connection to our map.
        this.connectionMap[connectionKey] = connection

        // Remove the connection from our map when it closes.
        connection.on("close", () => {
          delete this.connectionMap[connectionKey]
        })
      })
    })
  }

  killAllConnections() {
    Object.keys(this.connectionMap).forEach((connectionKey) => {
      this.connectionMap[connectionKey].destroy()
    })
  }

  _tryDispose(force = false) {
    return new Promise((resolve, reject) => {
      if (force) {
        // Forcefully close any existing connections.
        this.killAllConnections()
      }

      // Close the listener.
      if (this.listener) {
        this.listener.close((err) => {
          if (err) {
            // reject when server is not open when it is closed
            // see https://nodejs.org/api/net.html#net_server_close_callback
            reject(err)
          }
          // Ensure no straggling connections are left over.
          this.killAllConnections()

          resolve()
        })
      } else {
        resolve()
      }
    })
  }

  dispose(force = false) {
    return this._tryDispose(force)
      .catch(
        // postpone 100ms to retry
        () => new Promise((resolve) => setTimeout(resolve, 100)).then(() => this.dispose(force))
      )
  }
}

export default ListenerManager
