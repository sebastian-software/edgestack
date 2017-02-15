import "isomorphic-fetch"
import areIntlLocalesSupported from "intl-locales-supported"

// TODO: Figure out whether we can use some local mirror from e.g. public path or
// ideally via asset handling with content hashes, etc.
const BASE_URL = "//unpkg.com/lean-intl/locale-data/json/"
const PREFER_NATIVE = false

function getLanguage() {
  return typeof document !== "undefined" ? document.documentElement.lang : "de-DE" // FIXME
}

export function ensureIntlSupport() {
  const language = getLanguage().replace("_", "-")

  // Determine if the built-in `Intl` has the locale data we need.
  if (PREFER_NATIVE && global.Intl && areIntlLocalesSupported([ language ])) {
    return Promise.resolve(false)
  }

  return import("lean-intl").then((IntlPolyfill) => {
    return fetch(BASE_URL + language + ".json").then((response) => {
      return response.json().then((parsed) => {
        IntlPolyfill.__addLocaleData(parsed)

        // `Intl` exists, but it doesn't have the data we need, so load the
        // polyfill and patch the constructors we need with the polyfill's.
        if (global.Intl) {
          Intl.NumberFormat = IntlPolyfill.NumberFormat
          Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat
        } else {
          global.Intl = IntlPolyfill
        }

        return Promise.resolve(true)
      }).catch((error) => {
        console.error("Unable to load locale specific localization data!")
      })
    })
  })
}
