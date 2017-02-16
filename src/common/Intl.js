import "isomorphic-fetch"
import areIntlLocalesSupported from "intl-locales-supported"

const PREFER_NATIVE = false

function getFullLocale() {
  return typeof document !== "undefined" ? document.documentElement.lang : "de-DE" // FIXME
}

function getLanguage() {
  return getFullLocale().split(/-|_/)[0].toLowerCase()
}


/* eslint-disable prefer-template */
const intlUrl = require("lean-intl/locale-data/json/" + getFullLocale() + ".json")
const reactIntlUrl = require("react-intl/locale-data/" + getLanguage() + ".js")

var nonce

if (process.env.TARGET === "web") {
  nonce = document.querySelector("script[nonce]").getAttribute("nonce")
}

function injectCode({ code, url }) {
  if (process.env.TARGET === "web") {
    return new Promise((resolve, reject) => {
      var result = false
      var injectReference = document.getElementsByTagName("script")[0]
      var scriptElem = document.createElement("script")

      if (url) {
        scriptElem.src = url
      } else if (code) {
        scriptElem.innerText = code
      }

      scriptElem.async = true
      scriptElem.setAttribute("nonce", nonce)

      scriptElem.onload = scriptElem.onreadystatechange = () => {
        if (!result && (!this.readyState || this.readyState === "complete")) {
          result = true
          resolve(true)
        }
      }
      scriptElem.onerror = scriptElem.onabort = reject
      injectReference.parentNode.insertBefore(scriptElem, injectReference)
    })
  } else {
    /* eslint-disable no-new-func */
    new Function(code)()
    return Promise.resolve(true)
  }
}


export function ensureReactIntlSupport() {
  console.log("Loading:", reactIntlUrl)
  return fetch(reactIntlUrl).then((response) => {
    return response.text().then((code) => {
      injectCode({ code })
    })
  })
}

export function ensureIntlSupport() {
  // Determine if the built-in `Intl` has the locale data we need.
  if (PREFER_NATIVE && global.Intl && areIntlLocalesSupported([ getFullLocale() ])) {
    return Promise.resolve(false)
  }

  // TODO: Wenn NodeJS dann meckern wenn i18n daten nicht vorhanden!!!

  console.log("Loading:", intlUrl)

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
