import reactTreeWalker from "react-tree-walker"

/* eslint-disable no-shadow */
/* eslint-disable max-params */
export default function deepFetch(rootElement, context = {}, skipRoot = false)
{
  const schedule = []

  function visitor(element, instance, context)
  {
    if (rootElement === element && skipRoot) {
      return
    }

    if (instance && instance.fetchData)
    {
      var returnValue = instance.fetchData()
      if (returnValue instanceof Promise)
      {
        schedule.push({
          resolver: returnValue,
          element,
          context
        })
      }
    }
  }

  reactTreeWalker(rootElement, visitor, context)

  const nestedPromises = schedule.map(({ resolver, element, context }) =>
    resolver.then(() => deepFetch(element, context, true)),
  )

  return nestedPromises.length > 0 ? Promise.all(nestedPromises) : Promise.resolve([])
}
