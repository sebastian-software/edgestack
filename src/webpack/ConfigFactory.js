import { statSync } from "fs"
import path from "path"
import webpack from "webpack"

import AssetsPlugin from "assets-webpack-plugin"
import builtinModules from "builtin-modules"
import ExtractTextPlugin from "extract-text-webpack-plugin"

import Dashboard from "webpack-dashboard/plugin"
import ProgressBar from "progress-bar-webpack-plugin"
import CodeSplitWebpackPlugin from "code-split-component/webpack"

import BabiliPlugin from "babili-webpack-plugin"

/*
// See also:
// https://github.com/google/closure-compiler-js/issues/37
import ClosureCompiler from "google-closure-compiler-js"
const ClosureCompilerPlugin = ClosureCompiler.webpack
*/

import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer"

import dotenv from "dotenv"

// Using more modern approach of hashing than "webpack-md5-hash". Somehow the SHA256 version
// ("webpack-sha-hash") does not correctly work based (produces different hashes for same content).
// This is basically a replacement of md5 with the loader-utils implementation which also supports
// shorter generated hashes based on base62 encoding instead of hex.
import WebpackDigestHash from "./ChunkHash"

// Waiting for Pull-Request being merged:
// https://github.com/diurnalist/chunk-manifest-webpack-plugin/pull/13
import ChunkManifestPlugin from "./ChunkManifestPlugin"

import esModules from "./Modules"

import getPostCSSConfig from "./PostCSSConfig"


const builtInSet = new Set(builtinModules)

// - "helmet" uses some look with require which are not solvable with webpack
// - "express" also uses some dynamic requires
// - "encoding" uses dynamic iconv loading
// - "node-pre-gyp" native code module helper
// - "iltorb" brotli compression wrapper for NodeJS
// - "node-zopfli" native Zopfli implementation
const problematicCommonJS = new Set([ "helmet", "express", "encoding", "node-pre-gyp", "iltorb", "node-zopfli" ])
const CWD = process.cwd()

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
  return Boolean(/\.(eot|woff|woff2|ttf|otf|svg|png|jpg|jpeg|gif|webp|webm|ico|mp4|mp3|ogg|html|pdf|swf|css|scss|sass|sss|less)$/.exec(request))
}

function ifIsFile(filePath) {
  try {
    return statSync(filePath).isFile() ? filePath : ""
  } catch (err) {
    // empty
  }

  return ""
}


function getJsLoader({ isServer, isClient, isProd, isDev })
{
  const nodeBabel = isServer ? {
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
      // It seems to be a good idea to use the minimum required
      // transpiling infrastructure. But unfortunately it does not
      // seem to work for us.
      // Warning: React.createElement: type should not be null, undefined, boolean, or number.
      // Not sure how this is related to React, though.
      // "babel-preset-latest-minimal",

      // exponentiation
      "babel-preset-es2016",

      // async to generators + trailing function commas
      "babel-preset-es2017",

      // JSX, Flow
      "babel-preset-react"
    ],

    plugins:
    [
      // Optimization for lodash imports
      "lodash",

      // Keep transforming template literals as it keeps code smaller for the client
      // (removes multi line formatting which is allowed for literals)
      // This is interesting for all es2015 outputs... e.g. 
      // later for a client build for modern builds, too
      "transform-es2015-template-literals",

      // class { handleClick = () => { } }
      "transform-class-properties",

      // { ...todo, completed: true }
      "transform-object-rest-spread",

      // Polyfills the runtime needed
      [ "transform-runtime", { regenerator: false }],

      // Code Splitting by Routes
      [
        "code-split-component/babel", {
          disabled: isDev,
          role: "server"
        }
      ]
    ]
  } : null

  const clientBabel = isClient ? {
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
      // let, const, destructuring, classes, no modules
      [ "babel-preset-es2015", { modules: false }],

      // exponentiation
      "babel-preset-es2016",

      // async to generators + trailing function commas
      "babel-preset-es2017",

      // JSX, Flow
      "babel-preset-react"
    ],

    plugins:
    [
      // Optimization for lodash imports
      "lodash",

      // class { handleClick = () => { } }
      "transform-class-properties",

      // { ...todo, completed: true }
      "transform-object-rest-spread",

      // Polyfills the runtime needed
      [ "transform-runtime", { regenerator: false }],

      // Code Splitting by Routes
      [
        "code-split-component/babel", {
          disabled: isDev,
          role: "client"
        }
      ]
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
              "transform-react-remove-prop-types"
            ]
          },
          development: {
            plugins: [ "react-hot-loader/babel" ]
          }
        }
      },

      nodeBabel,
      clientBabel
    )
  }]
}


function getCssLoaders({ isServer, isClient, isProd, isDev })
{
  // When targetting the server we fake out the style loader as the
  // server can't handle the styles and doesn't care about them either..
  if (isServer)
  {
    return [
      {
        loader: "css-loader/locals",
        query:
        {
          sourceMap: false,
          modules: true,
          localIdentName: isProd ? "[local]-[hash:base62:8]" : "[path][name]-[local]"
        }
      },
      {
        loader: "postcss-loader"
      }
    ]
  }

  if (isClient)
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
        fallbackLoader: "style-loader",
        loader:
        [
          {
            loader: "css-loader",
            query:
            {
              sourceMap: true,
              modules: true,
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
            modules: true,
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
}

const isDebug = true
const isVerbose = true

function ConfigFactory(target, mode, options = {}, root = CWD)
{
  // Output custom options
  if (Object.keys(options).length > 0) {
    console.log("Using options: ", options)
  }

  if (!target || !~[ "client", "server" ].findIndex((valid) => target === valid))
  {
    throw new Error(
      `You must provide a "target" (client|server) to the ConfigFactory.`
    )
  }

  if (!mode || !~[ "development", "production" ].findIndex((valid) => mode === valid))
  {
    throw new Error(
      `You must provide a "mode" (development|production) to the ConfigFactory.`
    )
  }

  process.env.NODE_ENV = options.debug ? "development" : mode
  process.env.BABEL_ENV = mode

  const isDev = mode === "development"
  const isProd = mode === "production"
  const isClient = target === "client"
  const isServer = target === "server"
  const isNode = isServer

  const ifDev = ifElse(isDev)
  const ifProd = ifElse(isProd)
  const ifClient = ifElse(isClient)
  const ifServer = ifElse(isServer)
  const ifNode = ifElse(isNode)
  const ifDevClient = ifElse(isDev && isClient)
  const ifDevServer = ifElse(isDev && isServer)
  const ifProdClient = ifElse(isProd && isClient)
  const ifProdServer = ifElse(isProd && isServer)
  const ifIntegration = ifElse(process.env.CI || false)
  const ifUniversal = ifElse(process.env.DISABLE_SSR)


  const cssLoaders = getCssLoaders({
    isProd,
    isDev,
    isClient,
    isServer
  })

  const jsLoaders = getJsLoader({
    isProd,
    isDev,
    isClient,
    isServer
  })

  const excludeFromTranspilation = [
    /node_modules/,
    path.resolve(root, process.env.CLIENT_BUNDLE_OUTPUT_PATH),
    path.resolve(root, process.env.SERVER_BUNDLE_OUTPUT_PATH)
  ]

  // Just bundle the server files which are from the local project instead
  // of a deep self-contained bundle.
  // See also: https://nolanlawson.com/2016/08/15/the-cost-of-small-modules/
  const useLightServerBundle = options.lightBundle == null ? isDev : options.lightBundle
  if (useLightServerBundle && isServer) {
    console.log("Using light server bundle")
  }

  return {
    // We need to state that we are targetting "node" for our server bundle.
    target: ifNode("node", "web"),

    // We have to set this to be able to use these items when executing a
    // server bundle. Otherwise strangeness happens, like __dirname resolving
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
    // cache: cache,

    // Capture timing information for each module.
    // Analyse tool: http://webpack.github.io/analyse
    profile: false,

    // Report the first error as a hard error instead of tolerating it.
    bail: isProd,

    // Anything listed in externals will not be included in our bundle.
    externals: removeEmpty([
      ifNode(function(context, request, callback)
      {
        var basename = request.split("/")[0]

        // Externalize built-in modules
        if (builtInSet.has(basename))
          return callback(null, "commonjs " + request)

        // Keep care that problematic common-js code is external
        if (problematicCommonJS.has(basename))
          return callback(null, "commonjs " + request)

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
        useLightServerBundle ? callback(null, "commonjs " + request) : callback()
      })
    ]),

    // See also: https://webpack.github.io/docs/configuration.html#devtool
    // and http://webpack.github.io/docs/build-performance.html#sourcemaps
    // All 'module*' and 'cheap' variants do not seem to work with this kind
    // of setup where we have loaders involved. Even simple console messages jump
    // to the wrong location in these cases.
    // devtool: ifProd("source-map", "eval-source-map"),
    devtool: "source-map",

    // Define our entry chunks for our bundle.
    entry: removeEmptyKeys(
    {
      main: removeEmpty([
        ifDevClient("react-hot-loader/patch"),
        ifDevClient(`webpack-hot-middleware/client?reload=true&path=http://localhost:${process.env.CLIENT_DEVSERVER_PORT}/__webpack_hmr`),
        options.entry ? options.entry : ifIsFile(`./src/${target}/index.js`),
      ]),

      vendor: ifProdClient(options.vendor ? options.vendor : ifIsFile(`./src/${target}/vendor.js`))
    }),

    output:
    {
      // The dir in which our bundle should be output.
      path: path.resolve(
        root,
        isClient ? process.env.CLIENT_BUNDLE_OUTPUT_PATH : process.env.SERVER_BUNDLE_OUTPUT_PATH
      ),

      // The filename format for our bundle's entries.
      filename: ifProdClient(

        // We include a hash for client caching purposes. Including a unique
        // has for every build will ensure browsers always fetch our newest
        // bundle.
        "[name]-[chunkhash].js",

        // We want a determinable file name when running our server bundles,
        // as we need to be able to target our server start file from our
        // npm scripts. We don't care about caching on the server anyway.
        // We also want our client development builds to have a determinable
        // name for our hot reloading client bundle server.
        "[name].js"
      ),

      chunkFilename: ifProdClient(
        "chunk-[name]-[chunkhash].js",
        "chunk-[name].js"
      ),

      // Prefixes every line of the source in the bundle with this string.
      sourcePrefix: "",

      // This is the web path under which our webpack bundled output should
      // be considered as being served from.
      publicPath: ifDev(

        // As we run a seperate server for our client and server bundles we
        // need to use an absolute http path for our assets public path.
        `http://localhost:${process.env.CLIENT_DEVSERVER_PORT}${process.env.CLIENT_BUNDLE_HTTP_PATH}`,

        // Otherwise we expect our bundled output to be served from this path.
        process.env.CLIENT_BUNDLE_HTTP_PATH
      ),

      // When in server mode we will output our bundle as a commonjs2 module.
      libraryTarget: ifNode("commonjs2", "var")
    },

    resolve:
    {
      // Enable new module/jsnext:main field for requiring files
      // Defaults: https://webpack.github.io/docs/configuration.html#resolve-packagemains
      mainFields: ifNode(
        [ "module", "jsnext:main", "webpack", "main" ],
        [ "module", "jsnext:main", "webpack", "browser", "web", "browserify", "main" ]
      ),

      // These extensions are tried when resolving a file.
      extensions: [
        ".js",
        ".jsx",
        ".ts",
        ".tsx",
        ".json"
      ]
    },

    plugins: removeEmpty([

      ifProd(new BabiliPlugin({
        comments: false
      })),

      /*
      ifProdClient(new ClosureCompilerPlugin({
        options: {
          compilationLevel: "SIMPLE"
        }
      })),
      */

      // Analyse webpack bundle
      ifProdClient(new BundleAnalyzerPlugin({
        openAnalyzer: false,
        analyzerMode: "static"
      })),

      new CodeSplitWebpackPlugin({
        // The code-split-component doesn't work nicely with hot module reloading,
        // which we use in our development builds, so we will disable it if we
        // are creating a development bundle (which results in synchronous loading
        // behavior on the CodeSplit instances).
        disabled: isDev
      }),

      // Render Dashboard for Client Development + ProgressBar for production builds
      ifIntegration(null, ifDevClient(new Dashboard())),
      ifIntegration(null, ifProd(new ProgressBar())),

      // For server bundle, you also want to use "source-map-support" which automatically sourcemaps
      // stack traces from NodeJS. We need to install it at the top of the generated file, and we
      // can use the BannerPlugin to do this.
      // - `raw`: true tells webpack to prepend the text as it is, not wrapping it in a comment.
      // - `entryOnly`: false adds the text to all generated files, which you might have multiple if using code splitting.
      // Via: http://jlongster.com/Backend-Apps-with-Webpack--Part-I
      ifServer(new webpack.BannerPlugin({
        banner: 'require("source-map-support").install();',
        raw: true,
        entryOnly: false
      })),

      // Extract vendor bundle for keeping larger parts of the application code
      // delivered to users stable during development (improves positive cache hits)
      ifProdClient(new webpack.optimize.CommonsChunkPlugin({
        name: "vendor",
        minChunks: Infinity
      })),

      // More aggressive chunk merging strategy. Even similar chunks are merged if the
      // total size is reduced enough.
      ifProdClient(new webpack.optimize.AggressiveMergingPlugin()),

      // We use this so that our generated [chunkhash]'s are only different if
      // the content for our respective chunks have changed.  This optimises
      // our long term browser caching strategy for our client bundle, avoiding
      // cases where browsers end up having to download all the client chunks
      // even though 1 or 2 may have only changed.
      ifProdClient(new WebpackDigestHash()),

      // Extract chunk hashes into separate file
      ifProdClient(new ChunkManifestPlugin({
        filename: "manifest.json",
        manifestVariable: "CHUNK_MANIFEST"
      })),

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

        "process.env.APP_ROOT": JSON.stringify(path.resolve(root)),

        // All the below items match the config items in our .env file. Go
        // to the .env_example for a description of each key.
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
      // our webpack bundle.  A necessisty for our server rendering process
      // as we need to interogate these files in order to know what JS/CSS
      // we need to inject into our HTML.
      ifClient(
        new AssetsPlugin({
          filename: process.env.CLIENT_BUNDLE_ASSETS_FILENAME,
          path: path.resolve(root, process.env.CLIENT_BUNDLE_OUTPUT_PATH),
          prettyPrint: true
        })
      ),

      // Effectively fake all "file-loader" files with placeholders on server side
      ifNode(new webpack.NormalModuleReplacementPlugin(
        /\.(eot|woff|woff2|ttf|otf|svg|png|jpg|jpeg|gif|webp|webm|mp4|mp3|ogg|html|pdf)$/,
        "node-noop"
      )),

      // We don't want webpack errors to occur during development as it will
      // kill our dev servers.
      ifDev(new webpack.NoErrorsPlugin()),

      // We need this plugin to enable hot module reloading for our dev server.
      ifDevClient(new webpack.HotModuleReplacementPlugin()),

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
            context: CWD
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
            context: CWD
          }
        })
      ),

      // This is a production client so we will extract our CSS into
      // CSS files.
      ifProdClient(
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
      )
    ]),

    module:
    {
      rules: removeEmpty(
      [
        // JavaScript
        {
          test: /\.(js|jsx)$/,
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

        // CSS
        {
          test: /\.css$/,
          loader: cssLoaders
        },

        // JSON
        {
          test: /\.json$/,
          loader: "json-loader"
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
            name: ifProdClient("file-[hash:base62:8].[ext]", "[name].[ext]"),
            emitFile: isClient
          }
        },

        // GraphQL support
        // @see http://dev.apollodata.com/react/webpack.html
        {
          test: /\.(graphql|gql)$/,
          exclude: /node_modules/,
          loader: "graphql-tag/loader"
        }
      ])
    }
  }
}

export default ConfigFactory
