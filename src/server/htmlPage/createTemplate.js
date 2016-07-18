import serialize from "serialize-javascript"

// :: [String] -> [String]
function cssImports(css) {
  return css
    .map((cssPath) =>
      `<link href="${cssPath}" rel="stylesheet"/>`
    )
    .join("\n")
}

// :: [String] -> [String]
function javascriptImports(javascript) {
  return javascript
    .map((scriptPath) =>
      `<script src="${scriptPath}"></script>`
    )
    .join("\n")
}

// :: Object -> [String]
function metaTags(meta) {
  return Object.keys(meta).map((metaKey) =>
    `<meta name="${metaKey}" content="${meta[metaKey]}" />`
  )
}

// :: Assets -> Content -> String
function createTemplate(assets = {}) {
  const { css = [], js = [] } = assets

  const cssLinks = cssImports(css)
  const jsScripts = jsImports(js)

  return function pageTemplate(content = {}) {
    const { title, meta = {}, initialState = {}, reactRootElement } = content

    return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" >
        <meta httpequiv="X-UA-Compatible" content="IE=edge" >
        <meta httpequiv="Content-Language" content="en" >

        <title>${title}</title>

        ${metaTags(meta)}
        ${cssLinks}
      </head>
      <body>
        <div id="app">${reactRootElement}</div>

        <script>APP_STATE=${serialize(initialState)};</script>
        <script src="https://cdn.polyfill.io/v2/polyfill.min.js"></script>
        ${javascriptScripts}
      </body>
    </html>`
  }
}

export default createTemplate
