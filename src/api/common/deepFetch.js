import reactTreeWalker from "react-tree-walker"

/* eslint-disable no-shadow */
/* eslint-disable max-params */
export default function deepFetch(rootElement)
{
  function visitor(element, instance, context) {
    if (instance && typeof instance.fetchData === "function") {
      return instance.fetchData()
    }

    return true
  }

  return reactTreeWalker(rootElement, visitor)
}
