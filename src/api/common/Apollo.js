import { ApolloClient, createNetworkInterface, createBatchingNetworkInterface } from "react-apollo"

/**
 *
 *
 */
export function createApolloClient({ headers, initialState = {}, batchRequests = false, trustNetwork = true })
{
  const apolloUri = initialState.ssr && initialState.ssr.apolloUri

  const hasApollo = apolloUri != null
  var client

  if (hasApollo)
  {
    var opts = {
      credentials: trustNetwork ? "include" : "same-origin",

      // transfer request headers to networkInterface so that they're accessible to proxy server
      // Addresses this issue: https://github.com/matthew-andrews/isomorphic-fetch/issues/83
      headers
    }

    var networkInterface

    if (batchRequests)
    {
      networkInterface = createBatchingNetworkInterface({
        uri: apolloUri,
        batchInterval: 10,
        opts
      })
    }
    else
    {
      networkInterface = createNetworkInterface({
        uri: apolloUri,
        opts
      })
    }

    client = new ApolloClient({
      ssrMode: process.env.TARGET === "node",
      addTypename: false,
      queryDeduplication: true,
      networkInterface
    })
  }
  else
  {
    client = new ApolloClient({
      addTypename: false,
      queryDeduplication: true
    })
  }

  return client
}
