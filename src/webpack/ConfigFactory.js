import path from "path"
import webpack from "webpack"
import AssetsPlugin from "assets-webpack-plugin"
import nodeExternals from "webpack-node-externals"
import builtinModules from "builtin-modules"
import ExtractTextPlugin from "extract-text-webpack-plugin"
import WebpackShaHash from "webpack-sha-hash"
import dotenv from "dotenv"

import esModules from "./Modules"


import BabelConfigClient from "../config/babel.es.js"
import BabelConfigNode from "../config/babel.node.js"

import PostCSSConfig from "./PostCSSConfig"


const builtInSet = new Set(builtinModules)
const problematicCommonJS = new Set(["helmet"])
const CWD = process.cwd()

// @see https://github.com/motdotla/dotenv
dotenv.config({ silent: true })

function removeEmpty(array)
{
  return array.filter((entry) => !!entry)
}

function ifElse(condition)
{
  return (then, otherwise) => (condition ? then : otherwise)
}

function merge()
{
  const funcArgs = Array.prototype.slice.call(arguments) // eslint-disable-line prefer-rest-params

  return Object.assign.apply(
    null,
    removeEmpty([ {} ].concat(funcArgs))
  )
}

function ConfigFactory(target, mode, options = {}, root = CWD)
{
  // Output custom options
  if (Object.keys(options).length > 0) {
    console.log("Using options: ", options)
  }

  if (!target || !~[ "client", "server" ].findIndex((valid) => target === valid))
  {
    throw new Error(
      'You must provide a "target" (client|server) to the ConfigFactory.'
    )
  }

  if (!mode || !~[ "development", "production" ].findIndex((valid) => mode === valid))
  {
    throw new Error(
      'You must provide a "mode" (development|production) to the ConfigFactory.'
    )
  }

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

  return {
    // We need to state that we are targetting "node" for our server bundle.
    target: ifNode("node", "web"),

    stats: "errors-only",

    // We have to set this to be able to use these items when executing a
    // server bundle. Otherwise strangeness happens, like __dirname resolving
    // to '/'. There is no effect on our client bundle.
    node: {
      __dirname: true,
      __filename: true
    },

    cache: !(isDev && isServer),

    // Anything listed in externals will not be included in our bundle.
    externals: removeEmpty(
    [
      // We don't want our node_modules to be bundled with our server package,
      // prefering them to be resolved via native node module system. Therefore
      // we use the `webpack-node-externals` library to help us generate an
      // externals config that will ignore all node_modules.
      // For ignoring all files which should be bundled e.g. which is true for
      // all files being loader-specific (Webpack dependend). This includes
      // files like CSS files, static files, dynamically generated files, etc.
      /*
      ifNode(nodeExternals({
        whitelist: [
          /\.(eot|woff|woff2|ttf|otf)$/,
          /\.(svg|png|jpg|jpeg|gif|webp|ico)$/,
          /\.(mp4|mp3|ogg|pdf|swf)$/,
          /\.(css|scss|sass|sss|less)$/
        ]
      })),
      */

      ifNode(function(context, request, callback)
      {
        var basename = request.split("/")[0]

        // Externalize built-in modules
        if (builtInSet.has(basename))
          return callback(null, "commonjs " + request)

        // Ignore inline files
        if (basename.charAt(0) === ".")
          return callback()

        // But inline all es2015 modules
        if (esModules[basename])
          return callback()

        // Keep care that problematic common-js code is external
        if (problematicCommonJS.has(basename))
          return callback(null, "commonjs " + request)

        callback()
      })
    ]),

    // See also: https://webpack.github.io/docs/configuration.html#devtool
    //
    // We want to be able to get nice stack traces when running our server
    // bundle. To fully support this we'll also need to configure the
    // `node-source-map-support` module to execute at the start of the server
    // bundle. This module will allow the node to make use of the
    // source maps.
    //
    // We also want to be able to link to the source in Chrome dev tools
    devtool: "source-map",

    // Define our entry chunks for our bundle.
    entry: merge(
    {
      main: removeEmpty([
        ifDevClient("react-hot-loader/patch"),
        ifDevClient(`webpack-hot-middleware/client?reload=true&path=http://localhost:${process.env.CLIENT_DEVSERVER_PORT}/__webpack_hmr`),
        options.entry ? options.entry : `./src/${target}/index.js`,
      ]),
    }),

    output:
    {
      // The dir in which our bundle should be output.
      path: path.resolve(
        root,
        isClient
          ? process.env.CLIENT_BUNDLE_OUTPUT_PATH
          : process.env.SERVER_BUNDLE_OUTPUT_PATH
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
      libraryTarget: ifNode("commonjs2", "var"),
    },

    resolve:
    {
      // Enable new module/jsnext:main field for requiring files
      mainFields: ifNode(
        [ "module", "jsnext:main", "main" ],
        [ "module", "jsnext:main", "browser", "main" ]
      ),

      // These extensions are tried when resolving a file.
      extensions: [
        ".js",
        ".jsx",
        ".es5",
        ".es6",
        ".es7",
        ".es",
        ".json",
        ".css"
      ]
    },

    plugins: removeEmpty([
      // We use this so that our generated [chunkhash]'s are only different if
      // the content for our respective chunks have changed.  This optimises
      // our long term browser caching strategy for our client bundle, avoiding
      // cases where browsers end up having to download all the client chunks
      // even though 1 or 2 may have only changed.
      ifClient(new WebpackShaHash()),

      // Each key passed into DefinePlugin is an identifier.
      // The values for each key will be inlined into the code replacing any
      // instances of the keys that are found.
      // If the value is a string it will be used as a code fragment.
      // If the value isn’t a string, it will be stringified (including functions).
      // If the value is an object all keys are removeEmpty the same way.
      // If you prefix typeof to the key, it’s only removeEmpty for typeof calls.
      new webpack.DefinePlugin(
      {
          "process.env.TARGET": JSON.stringify(target),

          // NOTE: The NODE_ENV key is especially important for production
          // builds as React relies on process.env.NODE_ENV for optimizations.
          "process.env.NODE_ENV": options.debug ? JSON.stringify("development") : JSON.stringify(mode),

          // NOTE: The NODE_ENV key is especially important for production
          // builds as React relies on process.env.NODE_ENV for optimizations.
          "process.env.NODE_ENV": JSON.stringify(mode),

          "process.env.APP_ROOT": JSON.stringify(path.resolve(root)),

          // All the below items match the config items in our .env file. Go
          // to the .env_example for a description of each key.
          "process.env.SERVER_PORT": JSON.stringify(process.env.SERVER_PORT),
          "process.env.CLIENT_DEVSERVER_PORT": JSON.stringify(process.env.CLIENT_DEVSERVER_PORT),

          "process.env.DISABLE_SSR": process.env.DISABLE_SSR,

          "process.env.SERVER_BUNDLE_OUTPUT_PATH": JSON.stringify(process.env.SERVER_BUNDLE_OUTPUT_PATH),
          "process.env.CLIENT_BUNDLE_OUTPUT_PATH": JSON.stringify(process.env.CLIENT_BUNDLE_OUTPUT_PATH),
          "process.env.CLIENT_BUNDLE_ASSETS_FILENAME": JSON.stringify(process.env.CLIENT_BUNDLE_ASSETS_FILENAME),
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
        })
      ),

      // Assign the module and chunk ids by occurrence count. Ids that are
      // used often get lower (shorter) ids. This make ids predictable.
      // This is a requirement for permanant caching on servers.
      ifProdClient(new webpack.optimize.OccurrenceOrderPlugin(true)),

      // Effectively fake all "file-loader" files with placeholders on server side
      ifNode(new webpack.NormalModuleReplacementPlugin(/\.(eot|woff|woff2|ttf|otf|svg|png|jpg|jpeg|gif|webp|mp4|mp3|ogg|pdf)$/, "node-noop")),

      // We don't want webpack errors to occur during development as it will
      // kill our dev servers.
      ifDev(new webpack.NoErrorsPlugin()),

      // We need this plugin to enable hot module reloading for our dev server.
      ifDevClient(new webpack.HotModuleReplacementPlugin()),

      // Ensure only 1 file is output for the development bundles. This makes it
      // much easer for us to clear the module cache when reloading the server +
      // it helps with making hot module reloading more reliable.
      ifDev(new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })),

      // Adds options to all of our loaders.
      ifProdClient(
        new webpack.LoaderOptionsPlugin({
          // Indicates to our loaders that they should minify their output
          // if they have the capability to do so.
          minimize: true,

          // Indicates to our loaders that they should enter into debug mode
          // should they support it.
          debug: false
        })
      ),

      // JS Minification.
      ifProdClient(
        new webpack.optimize.UglifyJsPlugin({
          comments: false,
          compress: {
            screw_ie8: true,
            warnings: false
          }
        })
      ),

      // This is a production client so we will extract our CSS into
      // CSS files.
      ifProdClient(
        new ExtractTextPlugin({
          filename: "[name]-[chunkhash].css",
          allChunks: true
        })
      ),
    ]),

    postcss: function() {
      return PostCSSConfig
    },

    module:
    {
      loaders:
      [
        // Javascript
        {
          test: /\.jsx?$/,
          loader: "babel-loader",
          exclude:
          [
            /node_modules/,
            path.resolve(root, process.env.CLIENT_BUNDLE_OUTPUT_PATH),
            path.resolve(root, process.env.SERVER_BUNDLE_OUTPUT_PATH)
          ],
          query: merge(
            // Babel-Loader specific settings
            {
              // Enable caching for babel transpiles
              cacheDirectory: true,

              env:
              {
                development: {
                  plugins: [ "react-hot-loader/babel" ],
                }
              }
            },

            ifNode(BabelConfigNode),
            ifClient(BabelConfigClient)
          )
        },

        // JSON
        {
          test: /\.json$/,
          loader: "json-loader"
        },

        // Font file references etc.
        {
          test: /\.(eot|woff|woff2|ttf|otf|svg|png|jpg|jpeg|jp2|jpx|jxr|gif|webp|mp4|mp3|ogg|pdf)$/,
          loader: "file-loader",
          query: {
            name: "file-[hash:base62:6].[ext]"
          }
        },

        // CSS
        merge(
          {
            test: /\.css$/
          },

          // When targetting the server we fake out the style loader as the
          // server can't handle the styles and doesn't care about them either..
          ifNode(
            {
              loaders:
              [
                {
                  loader: "css-loader/locals",
                  query:
                  {
                    sourceMap: false,
                    modules: true,
                    localIdentName: "[local]-[hash:base62:6]",
                    minimize: false
                  }
                },
                {
                  loader: "postcss-loader"
                }
              ]
            }),

          // For a production client build we use the ExtractTextPlugin which
          // will extract our CSS into CSS files. The plugin needs to be
          // registered within the plugins section too.
          ifProdClient(
          {
            // First: the loader(s) that should be used when the css is not extracted
            // Second: the loader(s) that should be used for converting the resource to a css exporting module
            // Note: Unfortunately it seems like it does not support the new query syntax of webpack v2
            // See also: https://github.com/webpack/extract-text-webpack-plugin/issues/196
            loader: ExtractTextPlugin.extract({
              fallbackLoader: "style-loader",
              loader: "css-loader?modules&sourceMap&localIdentName=[local]-[hash:base62:6]!postcss-loader"
            })
          }),

          // For a development client we will use a straight style & css loader
          // along with source maps. This combo gives us a better development
          // experience.
          ifDevClient(
          {
            loaders:
            [
              {
                loader: "style-loader"
              },
              {
                loader: "css-loader",
                query:
                {
                  sourceMap: true,
                  modules: true,
                  localIdentName: "[local]-[hash:base62:6]",
                  minimize: false
                }
              },
              {
                loader: "postcss-loader"
              }
            ]
          })
        )
      ]
    }
  }
}

export default ConfigFactory
