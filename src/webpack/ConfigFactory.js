import { statSync } from "fs"
import path from "path"
import webpack from "webpack"

import AssetsPlugin from "assets-webpack-plugin"
import builtinModules from "builtin-modules"
import ExtractTextPlugin from "extract-text-webpack-plugin"

// import BabiliPlugin from "babili-webpack-plugin"
import HardSourceWebpackPlugin from "hard-source-webpack-plugin"

import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer"
import ChunkManifestPlugin from "chunk-manifest-webpack-plugin"

import dotenv from "dotenv"

// Using more modern approach of hashing than "webpack-md5-hash". Somehow the SHA256 version
// ("webpack-sha-hash") does not correctly work based (produces different hashes for same content).
// This is basically a replacement of md5 with the loader-utils implementation which also supports
// shorter generated hashes based on base62 encoding instead of hex.
import WebpackDigestHash from "./plugins/ChunkHash"
import ChunkNames from "./plugins/ChunkNames"

import VerboseProgress from "./plugins/VerboseProgress"

import esModules from "./Modules"

import getPostCSSConfig from "./PostCSSConfig"

const builtInSet = new Set(builtinModules)

const enableHardSource = !process.env.DISABLE_HARDSOURCE


// - "intl" is included in one block with complete data. No reason for bundle everything here.
// - "react-intl" for the same reason as "intl" - contains a ton of locale data
// - "mime-db" database for working with mime types. Naturally pretty large stuff.
// - "helmet" uses some look with require which are not solvable with webpack
// - "express" also uses some dynamic requires
// - "encoding" uses dynamic iconv loading
// - "node-pre-gyp" native code module helper
// - "iltorb" brotli compression wrapper for NodeJS
// - "node-zopfli" native Zopfli implementation
const problematicCommonJS = new Set([ "intl", "react-intl", "mime-db", "helmet", "express", "encoding",
  "node-pre-gyp", "iltorb", "node-zopfli" ])
const CURRENT_WORKING_DIRECTORY = process.cwd()

// @see https://github.com/motdotla/dotenv
dotenv.config()



function removeEmpty(array) {
  return array.filter((entry) => Boolean(entry))
}

function removeEmptyKeys(obj)
{
  var copy = {}
  for (var key in obj)
  {
    if (!(obj[key] == null || obj[key].length === 0))
      copy[key] = obj[key]
  }

  return copy
}

function ifElse(condition) {
  // eslint-disable-next-line no-confusing-arrow
  return (then, otherwise) => (condition ? then : otherwise)
}

function merge()
{
  const funcArgs = Array.prototype.slice.call(arguments) // eslint-disable-line prefer-rest-params

  return Object.assign.apply(
    null,
    removeEmpty([{}].concat(funcArgs))
  )
}

function isLoaderSpecificFile(request) {
  // eslint-disable-next-line max-len
  return Boolean(/\.(eot|woff|woff2|ttf|otf|svg|png|jpg|jpeg|gif|webp|webm|ico|mp4|mp3|ogg|html|pdf|swf|css|scss|sass|sss|less)$/.exec(request))
}

function ifIsFile(filePath) {
  try {
    return statSync(filePath).isFile() ? filePath : ""
  } catch (error) {
    // empty
  }

  return ""
}


function getJsLoader({ isNode, isWeb, isProd, isDev })
{
  const nodeBabel = isNode ? {
    // Don't try to find .babelrc because we want to force this configuration.
    babelrc: false,

    // Faster transpiling for minor loose in formatting
    compact: true,

    // Keep origin information alive
    sourceMaps: true,

    // Nobody needs the original comments when having source maps
    comments: false,

    presets:
    [
      // Exponentiation
      [ "babel-preset-env", {
        targets: { node: 6.0 }
      }],

      // Flow support
      "babel-preset-flow",

      // React JSX
      "babel-preset-react"
    ],

    plugins:
    [
      // Allow parsing of import()
      "syntax-dynamic-import",

      // Optimization for lodash imports.
      // Auto cherry-picking es2015 imports from path imports.
      "lodash",

      // Keep transforming template literals as it keeps code smaller for the client
      // (removes multi line formatting which is allowed for literals)
      // This is interesting for all es2015 outputs... e.g.
      // later for a client build for modern builds, too
      "transform-es2015-template-literals",

      // class { handleClick = () => { } }
      // https://github.com/tc39/proposal-class-public-fields
      "transform-class-properties",

      // { ...todo, completed: true }
      [ "transform-object-rest-spread", { useBuiltIns: true }],

      // Use helpers, but not polyfills, in a way that omits duplication.
      // For polyfills better use polyfill.io or another more sophisticated solution.
      [ "transform-runtime", {
        regenerator: false,
        polyfill: false,
        useBuiltIns: true,
        useESModules: true
      }]
    ]
  } : null

  const webBabel = isWeb ? {
    // Don't try to find .babelrc because we want to force this configuration.
    babelrc: false,

    // Faster transpiling for minor loose in formatting
    compact: true,

    // Keep origin information alive
    sourceMaps: true,

    // Nobody needs the original comments when having source maps
    comments: false,

    presets:
    [
      // ES2015: let, const, destructuring, classes, no modules
      // ES2016: Exponentiation
      // ES2017: Async to generators + trailing function commas
      [ "babel-preset-env", enableHardSource ? {} : { modules: false } ],

      // Flow support
      "babel-preset-flow",

      // React JSX
      "babel-preset-react"
    ],

    plugins:
    [
      // Allow parsing of import()
      "syntax-dynamic-import",

      // Optimization for lodash imports.
      // Auto cherry-picking es2015 imports from path imports.
      "lodash",

      // class { handleClick = () => { } }
      // https://github.com/tc39/proposal-class-public-fields
      "transform-class-properties",

      // { ...todo, completed: true }
      [ "transform-object-rest-spread", { useBuiltIns: true }],

      // Use helpers, but not polyfills, in a way that omits duplication.
      // For polyfills better use polyfill.io or another more sophisticated solution.
      [ "transform-runtime", {
        regenerator: false,
        polyfill: false,
        useBuiltIns: true,
        useESModules: true
      }]
    ]
  } : null

  return [{
    loader: "babel-loader",
    options: merge(
      {
        // Enable caching for babel transpiles
        cacheDirectory: true,

        env:
        {
          production: {
            comments: false,
            plugins: [
              // Cleanup descriptions for translations from compilation output
              "react-intl",

              // Remove prop types from our code
              "transform-react-remove-prop-types",

              // Replaces the React.createElement function with one that is
              // more optimized for production.
              // NOTE: Symbol needs to be polyfilled.
              "transform-react-inline-elements",

              // Hoists element creation to the top level for subtrees that
              // are fully static, which reduces call to React.createElement
              // and the resulting allocations. More importantly, it tells
              // React that the subtree hasn’t changed so React can completely
              // skip it when reconciling.
              "transform-react-constant-elements"
            ]
          },

          development: {
            plugins: [
              // Adds component stack to warning messages
              "transform-react-jsx-source",

              // Adds __self attribute to JSX which React will use for some warnings
              "transform-react-jsx-self",

              // Add deprecation messages
              "log-deprecated"
            ]
          }
        }
      },

      nodeBabel,
      webBabel
    )
  }]
}


function getCssLoaders({ isNode, isWeb, isProd, isDev }, enableModules = true)
{
  // When targetting the node we fake out the style loader as the
  // node can't handle the styles and doesn't care about them either..
  if (isNode)
  {
    return [
      {
        loader: "css-loader/locals",
        query:
        {
          sourceMap: false,
          modules: enableModules,
          localIdentName: isProd ? "[local]-[hash:base62:8]" : "[path][name]-[local]"
        }
      },
      {
        loader: "postcss-loader"
      }
    ]
  }

  if (isWeb)
  {
    // For a production client build we use the ExtractTextPlugin which
    // will extract our CSS into CSS files. The plugin needs to be
    // registered within the plugins section too.
    if (isProd)
    {
      // First: the loader(s) that should be used when the css is not extracted
      // Second: the loader(s) that should be used for converting the resource to a css exporting module
      // Note: Unfortunately it seems like it does not support the new query syntax of webpack v2
      // See also: https://github.com/webpack/extract-text-webpack-plugin/issues/196
      return ExtractTextPlugin.extract({
        allChunks: true,
        fallback: "style-loader",
        use:
        [
          {
            loader: "css-loader",
            query:
            {
              sourceMap: true,
              modules: enableModules,
              localIdentName: "[local]-[hash:base62:8]",
              minimize: false,
              import: false
            }
          },
          {
            loader: "postcss-loader"
          }
        ]
      })
    }
    else
    {
      // For a development client we will use a straight style & css loader
      // along with source maps. This combo gives us a better development
      // experience.
      return [
        {
          loader: "style-loader"
        },
        {
          loader: "css-loader",
          query:
          {
            sourceMap: true,
            modules: enableModules,
            localIdentName: "[path][name]-[local]",
            minimize: false,
            import: false
          }
        },
        {
          loader: "postcss-loader"
        }
      ]
    }
  }

  return []
}

const isDebug = true
const isVerbose = true

const cache = {
  "web-production": {},
  "web-development": {},
  "node-production": {},
  "node-development": {}
}

// eslint-disable-next-line max-statements, complexity
function ConfigFactory({ target, mode, root = CURRENT_WORKING_DIRECTORY, ...options })
{
  // console.log("ConfigFactory:", target, mode, root, options)

  // Output custom options
  if (Object.keys(options).length > 0) {
    console.log("- Webpack: Using options: ", options)
  }

  if (!target || ![ "web", "node" ].includes(target)) {
    throw new Error('You must provide a "target" (web|node) to the ConfigFactory.')
  }

  if (!mode || ![ "development", "production" ].includes(mode)) {
    throw new Error('You must provide a "mode" (development|production) to the ConfigFactory.')
  }

  if (process.env.CLIENT_BUNDLE_OUTPUT_PATH === undefined)
  {
    throw new Error(
      `No .env file found. Please provide one to your project's root. ` +
      `You can use ./node_modules/edgestack/.env.example as template`
    )
  }

  process.env.NODE_ENV = options.debug ? "development" : mode
  process.env.BABEL_ENV = mode

  const isDev = mode === "development"
  const isProd = mode === "production"
  const isWeb = target === "web"
  const isNode = target === "node"

  const ifDev = ifElse(isDev)
  const ifProd = ifElse(isProd)
  const ifWeb = ifElse(isWeb)
  const ifNode = ifElse(isNode)
  const ifDevWeb = ifElse(isDev && isWeb)

  /*
  const ifDevNode = ifElse(isDev && isNode)
  */

  const ifProdWeb = ifElse(isProd && isWeb)

  /*
  const ifProdNode = ifElse(isProd && isNode)
  const ifIntegration = ifElse(process.env.CI || false)
  const ifUniversal = ifElse(process.env.DISABLE_SSR)
  */


  const folder = isWeb ? "client" : "server"

  const cssLoadersWithoutModules = getCssLoaders({
    isProd,
    isDev,
    isWeb,
    isNode
  }, false)

  const cssLoadersWithModules = getCssLoaders({
    isProd,
    isDev,
    isWeb,
    isNode
  }, true)

  const jsLoaders = getJsLoader({
    isProd,
    isDev,
    isWeb,
    isNode
  })

  const excludeFromTranspilation = [
    /node_modules/,
    path.resolve(root, process.env.CLIENT_BUNDLE_OUTPUT_PATH),
    path.resolve(root, process.env.SERVER_BUNDLE_OUTPUT_PATH)
  ]

  // Just bundle the NodeJS files which are from the local project instead
  // of a deep self-contained bundle.
  // See also: https://nolanlawson.com/2016/08/15/the-cost-of-small-modules/
  const useLightNodeBundle = options.lightBundle == null ? isDev : options.lightBundle

  // if (useLightNodeBundle && isNode) {
  //   console.log("- Webpack: Using light node bundle")
  // }

  // Loader-Utils are changing their API:
  // https://github.com/webpack/loader-utils/issues/56
  // Currently affected: BabelLoader, CSSLoader + FileLoader
  // process.traceDeprecation = true

  return {
    // We need to inform Webpack about our build target
    target,

    // We have to set this to be able to use these items when executing a
    // node bundle. Otherwise strangeness happens, like __dirname resolving
    // to '/'. There is no effect on our client bundle.
    node: {
      __dirname: true,
      __filename: true
    },

    // What information should be printed to the console
    stats: {
      colors: true,
      reasons: isDebug,
      hash: isVerbose,
      version: isVerbose,
      timings: true,
      chunks: isVerbose,
      chunkModules: isVerbose,
      cached: isVerbose,
      cachedAssets: isVerbose
    },

    // This is not the file cache, but the runtime cache.
    // The reference is used to speed-up rebuilds in one execution e.g. via watcher
    // Note: But is has to share the same configuration as the cache is not config aware.
    cache: cache[`${target}-${mode}`],

    // Capture timing information for each module.
    // Analyse tool: http://webpack.github.io/analyse
    profile: isProd,

    // Report the first error as a hard error instead of tolerating it.
    bail: isProd,

    // Anything listed in externals will not be included in our bundle.
    externals: removeEmpty([
      ifNode((context, request, callback) =>
      {
        var basename = request.split("/")[0]

        // Externalize built-in modules
        if (builtInSet.has(basename))
          return callback(null, `commonjs ${request}`)

        // Keep care that problematic common-js code is external
        if (problematicCommonJS.has(basename))
          return callback(null, `commonjs ${request}`)

        // Ignore inline files
        if (basename.charAt(0) === ".")
          return callback()

        // But inline all es2015 modules
        if (esModules.has(basename))
          return callback()

        // Inline all files which are dependend on Webpack loaders e.g. CSS, images, etc.
        if (isLoaderSpecificFile(request))
          return callback()

        // In all other cases follow the user given preference
        return useLightNodeBundle ? callback(null, `commonjs ${request}`) : callback()
      })
    ]),

    // See also: https://webpack.github.io/docs/configuration.html#devtool
    // and http://webpack.github.io/docs/build-performance.html#sourcemaps
    // All "module*" and "cheap" variants do not seem to work with this kind
    // of setup where we have loaders involved. Even simple console messages jump
    // to the wrong location in these cases.
    devtool: "source-map",

    // New performance hints. Only active for production build.
    performance: isProd && isWeb ? {
      hints: "warning"
    } : false,

    // Define our entry chunks for our bundle.
    entry: removeEmptyKeys(
      {
        main: removeEmpty([
          ifDevWeb(`webpack-hot-middleware/client?overlay=true&path=http://localhost:${process.env.CLIENT_DEVSERVER_PORT}/__webpack_hmr`),
          options.entry ? options.entry : ifIsFile(`./src/${folder}/index.js`)
        ]),

        vendor: ifProdWeb(options.vendor ? options.vendor : ifIsFile(`./src/${folder}/vendor.js`))
      }
    ),

    output:
    {
      // The dir in which our bundle should be output.
      path: path.resolve(
        root,
        isWeb ? process.env.CLIENT_BUNDLE_OUTPUT_PATH : process.env.SERVER_BUNDLE_OUTPUT_PATH
      ),

      // The filename format for our bundle's entries.
      filename: ifProdWeb(

        // We include a hash for client caching purposes. Including a unique
        // has for every build will ensure browsers always fetch our newest
        // bundle.
        "[name]-[chunkhash].js",

        // We want a determinable file name when running our NodeJS bundles,
        // as we need to be able to target our NodeJS start file from our
        // npm scripts. We don't care about caching on the NodeJS anyway.
        // We also want our client development builds to have a determinable
        // name for our hot reloading client bundle NodeJS.
        "[name].js"
      ),

      chunkFilename: ifProdWeb(
        "chunk-[name]-[chunkhash].js",
        "chunk-[name].js"
      ),

      // This is the web path under which our webpack bundled output should
      // be considered as being served from.
      publicPath: ifDev(

        // As we run a seperate NodeJS for our client and NodeJS bundles we
        // need to use an absolute http path for our assets public path.
        `http://localhost:${process.env.CLIENT_DEVSERVER_PORT}${process.env.CLIENT_BUNDLE_HTTP_PATH}`,

        // Otherwise we expect our bundled output to be served from this path.
        process.env.CLIENT_BUNDLE_HTTP_PATH
      ),

      // When in NodeJS mode we will output our bundle as a commonjs2 module.
      libraryTarget: ifNode("commonjs2", "var")
    },

    resolve:
    {
      // Enable new module/jsnext:main field for requiring files
      // Defaults: https://webpack.github.io/docs/configuration.html#resolve-packagemains
      mainFields: ifNode(
        enableHardSource ?
          [ "main" ] :
          [ "module", "jsnext:main", "main" ],
        enableHardSource ?
          [ "web", "browser", "style", "main" ] :
          [ "web", "browser", "style", "module", "jsnext:main", "main" ]
      ),

      // These extensions are tried when resolving a file.
      extensions: [
        ".mjs",
        ".js",
        ".jsx",
        ".ts",
        ".tsx",
        ".css",
        ".sss",
        ".json"
      ]
    },

    plugins: removeEmpty([
      // Improve source caching in Webpack v2.
      // Therefor we disable it in production and only use it to speed up development rebuilds.
      //
      //
      enableHardSource ? new HardSourceWebpackPlugin({
        // Either an absolute path or relative to output.path.
        cacheDirectory: path.resolve(root, ".hardsource", `${target}-${mode}`),

        // Either an absolute path or relative to output.path. Sets webpack's
        // recordsPath if not already set.
        recordsPath: path.resolve(root, ".hardsource", `${target}-${mode}`, "records.json"),

        // Optional field. This field determines when to throw away the whole
        // cache if for example npm modules were updated.
        environmentHash: {
          root,
          directories: [ "node_modules" ],
          files: [ "package.json", "yarn.lock", ".env" ]
        }
      }) : null,

      // There is now actual benefit in using multiple chunks for possibly long living
      // NodeJS applications. We can bundle everrything and that way improve startup time.
      // ifNode(new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })),

      // Adds options to all of our loaders.
      ifDev(
        new webpack.LoaderOptionsPlugin({
          // Indicates to our loaders that they should minify their output
          // if they have the capability to do so.
          minimize: false,

          // Indicates to our loaders that they should enter into debug mode
          // should they support it.
          debug: true,

          // Pass options for PostCSS
          options: {
            postcss: getPostCSSConfig({}),
            context: CURRENT_WORKING_DIRECTORY
          }
        })
      ),

      // Adds options to all of our loaders.
      ifProd(
        new webpack.LoaderOptionsPlugin({
          // Indicates to our loaders that they should minify their output
          // if they have the capability to do so.
          minimize: true,

          // Indicates to our loaders that they should enter into debug mode
          // should they support it.
          debug: false,

          // Pass options for PostCSS
          options: {
            postcss: getPostCSSConfig({}),
            context: CURRENT_WORKING_DIRECTORY
          }
        })
      ),

      new VerboseProgress(),

      /*
      ifProd(new BabiliPlugin({
        comments: false,
        babili: {
          minified: true,
          comments: false,
          plugins: [
            "minify-dead-code-elimination",
            "minify-mangle-names",
            "minify-simplify"
          ]
        }
      })),
      */

      // For NodeJS bundle, you also want to use "source-map-support" which automatically sourcemaps
      // stack traces from NodeJS. We need to install it at the top of the generated file, and we
      // can use the BannerPlugin to do this.
      // - `raw`: true tells webpack to prepend the text as it is, not wrapping it in a comment.
      // - `entryOnly`: false adds the text to all generated files, which you might have multiple if using code splitting.
      // Via: http://jlongster.com/Backend-Apps-with-Webpack--Part-I
      // ifNode(new webpack.BannerPlugin({
      //   banner: 'require("source-map-support").install();',
      //   raw: true,
      //   entryOnly: false
      // })),

      // Extract vendor bundle for keeping larger parts of the application code
      // delivered to users stable during development (improves positive cache hits)
      ifProdWeb(new webpack.optimize.CommonsChunkPlugin({
        name: "vendor",
        minChunks: Infinity
      })),

      // Additional helper for non mentioned vendor like common modules
      // Docs: Look through all normal [aka lazy loaded] chunks, and if you find the same module that
      // appears across 3 or more chunks, then separate it out into a separate async commons chunk.
      // Via: https://medium.com/webpack/webpack-bits-getting-the-most-out-of-the-commonschunkplugin-ab389e5f318
      ifProdWeb(new webpack.optimize.CommonsChunkPlugin({
        async: true,
        children: true,
        name: "common"
      })),

      // More aggressive chunk merging strategy. Even similar chunks are merged if the
      // total size is reduced enough.
      ifProdWeb(new webpack.optimize.AggressiveMergingPlugin()),

      //
      new ChunkNames(),

      // We use this so that our generated [chunkhash]'s are only different if
      // the content for our respective chunks have changed.  This optimises
      // our long term browser caching strategy for our client bundle, avoiding
      // cases where browsers end up having to download all the client chunks
      // even though 1 or 2 may have only changed.
      ifProdWeb(new WebpackDigestHash()),

      // Extract chunk hashes into separate file
      ifProdWeb(new ChunkManifestPlugin({
        filename: "manifest.json",
        manifestVariable: "CHUNK_MANIFEST"
      })),

      // HTTP2 Optimization
      // See also: https://medium.com/webpack/webpack-http-2-7083ec3f3ce6#.d66ve28x0
      /*
      new webpack.optimize.AggressiveSplittingPlugin({
        minSize: 20000,
        maxSize: 40000
      }),
      */

      // Each key passed into DefinePlugin is an identifier.
      // The values for each key will be inlined into the code replacing any
      // instances of the keys that are found.
      // If the value is a string it will be used as a code fragment.
      // If the value isn’t a string, it will be stringified (including functions).
      // If the value is an object all keys are removeEmpty the same way.
      // If you prefix typeof to the key, it’s only removeEmpty for typeof calls.
      new webpack.DefinePlugin({
        "process.env.TARGET": JSON.stringify(target),
        "process.env.MODE": JSON.stringify(mode),

        // NOTE: The NODE_ENV key is especially important for production
        // builds as React relies on process.env.NODE_ENV for optimizations.
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),

        // All the below items match the config items in our .env file. Go
        // to the .env.example for a description of each key.
        "process.env.SERVER_PORT": process.env.SERVER_PORT,
        "process.env.CLIENT_DEVSERVER_PORT": process.env.CLIENT_DEVSERVER_PORT,

        "process.env.DISABLE_SSR": process.env.DISABLE_SSR,

        "process.env.SERVER_BUNDLE_OUTPUT_PATH": JSON.stringify(process.env.SERVER_BUNDLE_OUTPUT_PATH),
        "process.env.CLIENT_BUNDLE_OUTPUT_PATH": JSON.stringify(process.env.CLIENT_BUNDLE_OUTPUT_PATH),
        "process.env.CLIENT_PUBLIC_PATH": JSON.stringify(process.env.CLIENT_PUBLIC_PATH),

        "process.env.CLIENT_BUNDLE_ASSETS_FILENAME": JSON.stringify(process.env.CLIENT_BUNDLE_ASSETS_FILENAME),
        "process.env.CLIENT_BUNDLE_CHUNK_MANIFEST_FILENAME": JSON.stringify(process.env.CLIENT_BUNDLE_CHUNK_MANIFEST_FILENAME),

        "process.env.CLIENT_BUNDLE_HTTP_PATH": JSON.stringify(process.env.CLIENT_BUNDLE_HTTP_PATH),
        "process.env.CLIENT_BUNDLE_CACHE_MAXAGE": JSON.stringify(process.env.CLIENT_BUNDLE_CACHE_MAXAGE)
      }),

      // Generates a JSON file containing a map of all the output files for
      // our webpack bundle. A necessisty for our NodeJS rendering process
      // as we need to interogate these files in order to know what JS/CSS
      // we need to inject into our HTML.
      ifWeb(
        new AssetsPlugin({
          filename: process.env.CLIENT_BUNDLE_ASSETS_FILENAME,
          path: path.resolve(root, process.env.CLIENT_BUNDLE_OUTPUT_PATH),
          prettyPrint: true
        })
      ),

      // We don't want webpack errors to occur during development as it will
      // kill our development NodeJS instances.
      ifDev(new webpack.NoEmitOnErrorsPlugin()),

      // We need this plugin to enable hot module reloading for our dev NodeJS.
      ifDevWeb(new webpack.HotModuleReplacementPlugin()),

      // This is a production client so we will extract our CSS into
      // CSS files.
      ifProdWeb(
        new ExtractTextPlugin({
          filename: "[name]-[contenthash:base62:8].css",

          // FIXME: Work on some alternative approach for ExtractText to produce multiple
          // external CSS files.
          //
          // Possibly fork: https://github.com/webpack/extract-text-webpack-plugin
          // The current allChunks flag extract all styles from all chunks into one CSS file.
          // Without this flag all non entry chunks are keeping their CSS inline in the JS bundle.
          //
          // Idea: Split into multiple chunk oriented CSS files + load the CSS files during
          // from inside the JS file e.g. via calling some external API to load stylesheets.
          allChunks: true
        })
      ),

      // Warns you when multiple versions of the same package exist in a build.
      // https://github.com/darrenscerri/duplicate-package-checker-webpack-plugin
      // new DuplicateCheckerPlugin(),

      // Analyse webpack bundle
      ifProdWeb(new BundleAnalyzerPlugin({
        openAnalyzer: false,
        analyzerMode: "static",
        logLevel: "error"
      }))
    ]),

    module:
    {
      rules: removeEmpty(
        [
          // Special handling locale data
          {
            test: /locale-data(\/|\\).*\.(js|json)$/,
            loader: "file-loader",
            options: {
              name: ifProdWeb("locale/[name]-[hash:base62:8].[ext]", "locale-[name].[ext]"),
              emitFile: isWeb
            }
          },

          // JavaScript
          {
            test: /\.(mjs|js|jsx)$/,
            loaders: jsLoaders,
            exclude: excludeFromTranspilation
          },

          // Typescript
          // https://github.com/s-panferov/awesome-typescript-loader
          {
            test: /\.(ts|tsx)$/,
            loader: "awesome-typescript-loader",
            exclude: excludeFromTranspilation
          },

          // Markdown Container MDX Format
          // See also: http://jamesknelson.com/introducing-mdxc/
          {
            test: /\.mdx?$/,
            use: jsLoaders.concat([
              "mdx-loader"
            ])
          },

          // CSS
          {
            test: /\.(css|sss)$/,
            loader: cssLoadersWithModules,
            exclude: [ /prismjs/ ]
          },

          // Plain CSS
          {
            test: /\.(css|sss)$/,
            loader: cssLoadersWithoutModules,
            include: [ /prismjs/ ]
          },

          // JSON
          {
            test: /\.json$/,
            loader: "json-loader",
            exclude: [
              /locale-data/
            ]
          },

          // YAML
          {
            test: /\.(yml|yaml)$/,
            loaders: [ "json-loader", "yaml-loader" ]
          },

          // References to images, fonts, movies, music, etc.
          {
            test: /\.(eot|woff|woff2|ttf|otf|svg|png|jpg|jpeg|jp2|jpx|jxr|gif|webp|mp4|mp3|ogg|pdf|html)$/,
            loader: "file-loader",
            options: {
              name: ifProdWeb("file-[hash:base62:8].[ext]", "[name].[ext]"),
              emitFile: isWeb
            }
          },

          // GraphQL support
          // @see http://dev.apollodata.com/react/webpack.html
          {
            test: /\.(graphql|gql)$/,
            loader: "graphql-tag/loader",
            exclude: excludeFromTranspilation
          }
        ]
      )
    }
  }
}

export default ConfigFactory
