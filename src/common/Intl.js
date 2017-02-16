import "isomorphic-fetch"
import areIntlLocalesSupported from "intl-locales-supported"

const PREFER_NATIVE = false

function getLanguage() {
  return typeof document !== "undefined" ? document.documentElement.lang : "de-DE" // FIXME
}

/* eslint-disable prefer-template */
const intlUrl = require("lean-intl/locale-data/json/" + getLanguage() + ".json")

export function ensureIntlSupport() {
  const language = getLanguage().replace("_", "-")

  // Determine if the built-in `Intl` has the locale data we need.
  if (PREFER_NATIVE && global.Intl && areIntlLocalesSupported([ language ])) {
    return Promise.resolve(false)
  }

  // Wenn NodeJS dann meckern wenn i18n daten nicht vorhanden!!!

  return import("lean-intl").then((IntlPolyfill) => {
    return fetch(intlUrl).then((response) => {
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
        console.error("Unable to load locale specific localization data!", error)
      })
    })
  })
}
