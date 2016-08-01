/* eslint-disable no-console */

const path = require("path")
const webpack = require("webpack")
const AssetsPlugin = require("assets-webpack-plugin")
const nodeExternals = require("webpack-node-externals")
const ExtractTextPlugin = require("extract-text-webpack-plugin")

const CWD = process.cwd()

const $css = {
  atImport: require("postcss-import"),
  url: require("postcss-url"),
  discardComments: require("postcss-discard-comments"),
  advancedVariables: require("postcss-advanced-variables"),
  sassyMixins: require("postcss-sassy-mixins"),
  lost: require("lost"),
  willChange: require("postcss-will-change"),
  calc: require("postcss-calc"),
  gradientTransparencyFix: require("postcss-gradient-transparency-fix"),
  easings: require("postcss-easings"),
  colorFunction: require("postcss-color-function"),
  colorHexAlpha: require("postcss-color-hex-alpha"),
  flexbugsFixes: require("postcss-flexbugs-fixes"),
  zindex: require("postcss-zindex"),
  mediaMinmax: require("postcss-media-minmax"),
  nested: require("postcss-nested"),
  pseudoClassAnyLink: require("postcss-pseudo-class-any-link"),
  selectorMatches: require("postcss-selector-matches"),
  pseudoelements: require("postcss-pseudoelements"),
  autoprefixer: require("autoprefixer"),
  reporter: require("postcss-reporter")
}

const autoprefixerSettings =
{
  browsers: [ "> 2% in DE", "IE 10", "IE 11", "last 3 Chrome versions", "last 3 Firefox versions" ],
  cascade: false,
  flexbox: "no-2009"
}

// @see https://github.com/motdotla/dotenv
const dotenv = require("dotenv")
dotenv.config({ silent: true })

// :: [Any] -> [Any]
function removeEmpty(x) {
  return x.filter((y) => !!y)
}

// :: bool -> (Any, Any) -> Any
function ifElse(condition) {
  return (then, or) => (condition ? then : or)
}

// :: ...Object -> Object
function merge()
{
  const funcArgs = Array.prototype.slice.call(arguments) // eslint-disable-line prefer-rest-params

  return Object.assign.apply(
    null,
    removeEmpty([ {} ].concat(funcArgs))
  )
}

function ConfigFactory(target, mode, root = CWD)
{
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

  const ifDev = ifElse(isDev)
  const ifProd = ifElse(isProd)
  const ifClient = ifElse(isClient)
  const ifServer = ifElse(isServer)
  const ifDevClient = ifElse(isDev && isClient)
  const ifDevServer = ifElse(isDev && isServer)
  const ifProdClient = ifElse(isProd && isClient)

  return {
    // We need to state that we are targetting "node" for our server bundle.
    target: ifServer("node", "web"),

    stats: "errors-only",

    // We have to set this to be able to use these items when executing a
    // server bundle. Otherwise strangeness happens, like __dirname resolving
    // to '/'. There is no effect on our client bundle.
    node: {
      __dirname: true,
      __filename: true,
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
      ifServer(nodeExternals({
        whitelist: [
          /\.(eot|woff|woff2|ttf|otf)$/,
          /\.(svg|png|jpg|jpeg|gif|webp)$/,
          /\.(mp4|mp3|ogg|pdf|swf)$/,
          /\.(css|scss|sss|less)$/
        ]
      }))
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
        `./src/${target}/index.js`,
      ]),
    }),

    output:
    {
      // The dir in which our bundle should be output.
      path: path.resolve(root, `./build/${target}`),

      // The filename format for our bundle's entries.
      filename: ifProdClient(

        // We include a hash for client caching purposes. Including a unique
        // has for every build will ensure browsers always fetch our newest
        // bundle.
        "[name]-[hash].js",

        // We want a determinable file name when running our server bundles,
        // as we need to be able to target our server start file from our
        // npm scripts. We don't care about caching on the server anyway.
        // We also want our client development builds to have a determinable
        // name for our hot reloading client bundle server.
        "[name].js"
      ),

      chunkFilename: "chunk-[name]-[chunkhash].js",

      // This is the web path under which our webpack bundled output should
      // be considered as being served from.
      publicPath: ifDev(
        // As we run a seperate server for our client and server bundles we
        // need to use an absolute http path for our assets public path.
        `http://localhost:${process.env.CLIENT_DEVSERVER_PORT}/assets/`,

        // Otherwise we expect our bundled output to be served from this path.
        "/assets/"
      ),

      // When in server mode we will output our bundle as a commonjs2 module.
      libraryTarget: ifServer("commonjs2", "var"),
    },

    resolve:
    {
      // Enable new jsnext:main field for requiring files
      mainFields: [ "jsnext:main", "main" ],

      // These extensions are tried when resolving a file.
      extensions: [
        ".js",
        ".jsx",
        ".json",
      ]
    },

    plugins: removeEmpty([
      // Each key passed into DefinePlugin is an identifier.
      // The values for each key will be inlined into the code replacing any
      // instances of the keys that are found.
      // If the value is a string it will be used as a code fragment.
      // If the value isn’t a string, it will be stringified (including functions).
      // If the value is an object all keys are removeEmpty the same way.
      // If you prefix typeof to the key, it’s only removeEmpty for typeof calls.
      new webpack.DefinePlugin({
        "process.env": {
          // NOTE: The NODE_ENV key is especially important for production
          // builds as React relies on process.env.NODE_ENV for optimizations.
          NODE_ENV: JSON.stringify(mode),

          PUBLIC_PATH: JSON.stringify(ifDev(
            // As we run a seperate server for our client and server bundles we
            // need to use an absolute http path for our assets public path.
            `http://localhost:${process.env.CLIENT_DEVSERVER_PORT}/assets/`,

            // Otherwise we expect our bundled output to be served from this path.
            "/assets/"
          )),
          OUTPUT_PATH: JSON.stringify(path.resolve(root, `./build/client/`)),

          // All the below items match the config items in our .env file. Go
          // to the .env_example for a description of each key.
          SERVER_PORT: JSON.stringify(process.env.SERVER_PORT),
          CLIENT_DEVSERVER_PORT: JSON.stringify(process.env.CLIENT_DEVSERVER_PORT),
          DISABLE_SSR: process.env.DISABLE_SSR,
          WEBSITE_TITLE: JSON.stringify(process.env.WEBSITE_TITLE),
          WEBSITE_DESCRIPTION: JSON.stringify(process.env.WEBSITE_DESCRIPTION),
        },
      }),

      // Generates a JSON file containing a map of all the output files for
      // our webpack bundle. A necessisty for our server rendering process
      // as we need to interogate these files in order to know what JS/CSS
      // we need to inject into our HTML.
      new AssetsPlugin(
      {
        filename: "assets.json",
        path: path.resolve(root, `./build/${target}`),
      }),

      // Effectively fake all "file-loader" files with placeholders on server side
      ifServer(new webpack.NormalModuleReplacementPlugin(/\.(eot|woff|woff2|ttf|otf|svg|png|jpg|jpeg|gif|webp|mp4|mp3|ogg|pdf)$/, "node-noop")),

      // We don't want webpack errors to occur during development as it will
      // kill our dev servers.
      ifDev(new webpack.NoErrorsPlugin()),

      // We need this plugin to enable hot module reloading for our dev server.
      ifDevClient(new webpack.HotModuleReplacementPlugin()),

      // Ensure only 1 file is output for the server bundles. This makes it
      // much easer for us to clear the module cache when reloading the server.
      ifDevServer(new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })),

      // Adds options to all of our loaders.
      ifProdClient(
        new webpack.LoaderOptionsPlugin({
          // Indicates to our loaders that they should minify their output
          // if they have the capability to do so.
          minimize: true,

          // Indicates to our loaders that they should enter into debug mode
          // should they support it.
          debug: false,
        })
      ),

      // JS Minification.
      ifProdClient(
        new webpack.optimize.UglifyJsPlugin({
          comments: false,
          compress: {
            screw_ie8: true,
            warnings: false
          },
        })
      ),

      // This is actually only useful when our deps are installed via npm2.
      // In npm2 its possible to get duplicates of dependencies bundled
      // given the nested module structure. npm3 is flat, so this doesn't
      // occur.
      ifProd(
        new webpack.optimize.DedupePlugin()
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
      return [
        /*
        $css.devtools({
          silent: true
        }),
        */

        $css.atImport(),
        $css.url(),

        // Discard comments in your CSS files with PostCSS.
        // https://github.com/ben-eb/postcss-discard-comments
        // Remove all comments... we don't need them further down the line
        // which improves performance (reduces number of AST nodes)
        $css.discardComments({
          removeAll: true
        }),

        // PostCSS plugin for Sass-like variables, conditionals, and iteratives
        // Supports local variables + @for/@each inspired by Sass
        // https://github.com/jonathantneal/postcss-advanced-variables
        $css.advancedVariables({
          variables: {}
        }),

        // Sass-like mixins
        // https://github.com/andyjansson/postcss-sassy-mixins
        $css.sassyMixins,

        // Fractional grid system built with calc(). Supports masonry, vertical, and waffle grids.
        // https://github.com/peterramsing/lost
        $css.lost,

        // Insert 3D hack before will-change property
        // https://github.com/postcss/postcss-will-change
        $css.willChange,

        // Reduce calc()
        // Note: Important to keep this after mixin/variable processing
        // https://github.com/postcss/postcss-calc
        $css.calc,

        // Fix up CSS gradients with transparency for older browsers
        // https://github.com/gilmoreorless/postcss-gradient-transparency-fix
        $css.gradientTransparencyFix,

        // Replace easing names from http://easings.net to `cubic-bezier()`.
        // https://github.com/postcss/postcss-easings
        $css.easings,

        // Transform W3C CSS color function to more compatible CSS
        // https://github.com/postcss/postcss-color-function
        $css.colorFunction,

        // Transform RGBA hexadecimal notations (#RRGGBBAA or #RGBA) to more compatible CSS (rgba())
        // https://github.com/postcss/postcss-color-hex-alpha
        $css.colorHexAlpha,

        // Tries to fix all of flexbug's issues
        // https://github.com/luisrudge/postcss-flexbugs-fixes
        $css.flexbugsFixes,

        // Reduce z-index values with PostCSS.
        // https://github.com/ben-eb/postcss-zindex
        $css.zindex,

        // Writing simple and graceful Media Queries!
        // Support for CSS Media Queries Level 4: https://drafts.csswg.org/mediaqueries/#mq-range-context
        // https://github.com/postcss/postcss-media-minmax
        $css.mediaMinmax,

        // Unwrap nested rules like how Sass does it.
        // https://github.com/postcss/postcss-nested
        $css.nested,

        // Use the proposed :any-link pseudo-class in CSS
        // https://github.com/jonathantneal/postcss-pseudo-class-any-link
        $css.pseudoClassAnyLink,

        // Transform :matches() W3C CSS pseudo class to more compatible CSS (simpler selectors)
        // https://github.com/postcss/postcss-selector-matches
        $css.selectorMatches,

        // Add single and double colon peudo selectors
        // Normalizes e.g. `::before` to `:before` for wider browser support
        // https://github.com/axa-ch/postcss-pseudoelements
        $css.pseudoelements,

        // Parse CSS and add vendor prefixes to rules by Can I Use
        // https://github.com/postcss/autoprefixer
        $css.autoprefixer(autoprefixerSettings),

        // Log PostCSS messages to the console
        $css.reporter({
          clearMessages: true
        })
      ]
    },

    module:
    {
      loaders:
      [
        // Javascript
        {
          test: /\.jsx?$/,
          loader: "babel-loader",
          exclude: [ /node_modules/, path.resolve(root, "./build") ],
          query: merge(
            {
              // Prevent project-wide babel config from destroying behavior
              // we especially like to have e.g. different configs between server/client.
              babelrc: false,

              // Enable caching for babel transpiles
              cacheDirectory: true,

              env:
              {
                development: {
                  plugins: [ "react-hot-loader/babel" ],
                }
              }
            },

            ifServer(
            {
              // We are running a node 6 server which has support for almost
              // all of the ES2015 syntax, therefore we only transpile JSX and later ES features.
              presets:
              [
                "react",

                // Add Stage-1/2/3 presets (which are all bundled in Stage-1)
                // It seems that not all of these features are natively supported by Node >= 6.3.x
                "stage-1"
              ],

              // Do not keep formatting (slower). Source maps are enough for inspection.
              compact: "auto"
            }),

            ifClient(
            {
              // For our clients code we will need to transpile our JS into
              // ES5 code for wider browser/device compatability.
              presets:
              [
                // JSX
                "react",

                // Webpack 2 includes support for es2015 imports, therefore we used this
                // modified preset.
                "es2015-webpack",

                // Add Stage-1/2/3 presets (which are all bundled in Stage-1)
                "stage-1"
              ],

              // Do not keep formatting (slower). Source maps are enough for inspection.
              compact: "auto"
            })
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
          ifServer(
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
              loader: "css-loader?modules&sourceMap&minimize=false&localIdentName=[local]-[hash:base62:6]!postcss-loader"
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

module.exports = ConfigFactory
