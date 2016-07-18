class ListenerManager {
  constructor(listener) {
    this.lastConnectionKey = 0
    this.connectionMap = {}
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
  }

  dispose() {
    return new Promise((resolve) => {
      // First we destroy any connections.
      Object.keys(this.connectionMap).forEach((connectionKey) => {
        this.connectionMap[connectionKey].destroy()
      })

      // Then we close the listener.
      if (this.listener) {
        this.listener.close(() => {
          resolve()
        })
      } else {
        resolve()
      }
    })
  }
}
