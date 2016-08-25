const HotServers = require("../webpack/HotServers")

export default function start()
{
  new HotServers().start()
}
