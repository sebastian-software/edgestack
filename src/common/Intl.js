import areIntlLocalesSupported from "intl-locales-supported"

// Chunked polyfill for browsers without Intl support
function intlStart() {
}

function getLanguage() {
  return typeof document !== "undefined" ? document.documentElement.lang : "de_DE" // FIXME
}

console.log("Language:", getLanguage())


let needsPolyfill = false

if (global.Intl) {
  // Determine if the built-in `Intl` has the locale data we need.
  if (!areIntlLocalesSupported([getLanguage().replace("_", "-")])) {
    needsPolyfill = true

    // `Intl` exists, but it doesn't have the data we need, so load the
    // polyfill and patch the constructors we need with the polyfill's.
    import("lean-intl").then((IntlPolyfill) => {
      Intl.NumberFormat = IntlPolyfill.NumberFormat
      Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat
    })
  }
} else {
  needsPolyfill = true

  // No `Intl`, so use and load the polyfill.
  import("lean-intl").then((IntlPolyfill) => {
    global.Intl = IntlPolyfill
  })
}

console.log("Needs Intl Polyfill:", needsPolyfill)
