import serialize from "serialize-javascript"

function cssImports(css)
{
  return css
    .map((cssPath) =>
      `<link href="${cssPath}" rel="stylesheet"/>`
    )
    .join("\n")
}

function jsImports(javascript)
{
  return javascript
    .map((scriptPath) =>
      `<script src="${scriptPath}"></script>`
    )
    .join("\n")
}

function metaTags(meta)
{
  return Object.keys(meta).map((metaKey) =>
    `<meta name="${metaKey}" content="${meta[metaKey]}" />`
  )
}

function createTemplate(assets = {})
{
  const { css = [], js = [] } = assets

  const cssLinks = cssImports(css)
  const jsScripts = jsImports(js)

  return function pageTemplate(content = {}) {
    const { title, lang = "en-US", meta = {}, initialState = {}, reactRootElement } = content

    return `
    <!doctype html>
    <html lang="${lang}">
      <head>
        <meta charset="utf-8" >
        <meta http-equiv="X-UA-Compatible" content="IE=edge" >
        <meta http-equiv="Content-Language" content="${lang}" >

        <title>${title}</title>

        ${metaTags(meta)}
        ${cssLinks}
      </head>
      <body>
        <div id="app">${reactRootElement}</div>

        <script>APP_STATE=${serialize(initialState)};</script>
        ${jsScripts}
      </body>
    </html>`
  }
}

export default createTemplate
