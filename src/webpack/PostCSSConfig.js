import atImport from "postcss-smart-import"
import simpleUrl from "postcss-simple-url"
import discardComments from "postcss-discard-comments"
import advancedVariables from "postcss-advanced-variables"
import sassyMixins from "postcss-sassy-mixins"
import lost from "lost"
import willChange from "postcss-will-change"
import calc from "postcss-calc"
import gradientTransparencyFix from "postcss-gradient-transparency-fix"
import easings from "postcss-easings"
import colorFunction from "postcss-color-function"
import colorHexAlpha from "postcss-color-hex-alpha"
import flexbugsFixes from "postcss-flexbugs-fixes"
import mediaMinmax from "postcss-media-minmax"
import customMedia from "postcss-custom-media"
import nested from "postcss-nested"
import filters from "pleeease-filters"
import pseudoClassAnyLink from "postcss-pseudo-class-any-link"
import selectorMatches from "postcss-selector-matches"
import pseudoelements from "postcss-pseudoelements"
import autoprefixer from "autoprefixer"
import reporter from "postcss-reporter"
import hexrgba from "postcss-hexrgba"
import zindex from "postcss-zindex"
import warn from "postcss-at-warn"
import responsiveType from "postcss-responsive-type"
import inputStyles from "postcss-input-style"
import assets from "postcss-assets"

const autoprefixerSettings =
{
  browsers: [ "> 2%", "IE 10", "IE 11", "last 3 Chrome versions", "last 3 Firefox versions" ],
  cascade: false,
  flexbox: "no-2009"
}

export default function getConfig(bundler, variables = {})
{
  return [
    /*
    $css.devtools({
      silent: true
    }),
    */

    atImport({
      addDependencyTo: bundler
    }),

    simpleUrl(),
    assets(),

    // Discard comments in your CSS files with PostCSS.
    // https://github.com/ben-eb/postcss-discard-comments
    // Remove all comments... we don't need them further down the line
    // which improves performance (reduces number of AST nodes)
    discardComments({
      removeAll: true
    }),

    // Automagical responsive typography. Adds a responsive property to font-size,
    // line-height and letter-spacing that generates complex calc and vw based font sizes.
    // https://github.com/seaneking/postcss-responsive-type
    responsiveType(),

    // Sass-like mixins
    // Needs to be executed before any variable handling plugins
    // https://github.com/andyjansson/postcss-sassy-mixins
    sassyMixins,

    // PostCSS plugin for Sass-like variables, conditionals, and iteratives
    // Supports local variables + @for/@each inspired by Sass
    // https://github.com/jonathantneal/postcss-advanced-variables
    advancedVariables({
      variables
    }),

    // Fractional grid system built with calc(). Supports masonry, vertical, and waffle grids.
    // https://github.com/peterramsing/lost
    lost,

    // Insert 3D hack before will-change property
    // https://github.com/postcss/postcss-will-change
    willChange,

    // Fallback for Webkit Filters property to SVG filters. Amazing stuff.
    // It converts all 10 CSS shorthand filters:
    // grayscale, sepia, saturate, hue-rotate, invert, opacity, brightness, contrast, blur, drop-shadow
    // https://github.com/iamvdo/pleeease-filters
    filters(),

    // Reduce calc()
    // Note: Important to keep this after mixin/variable processing
    // https://github.com/postcss/postcss-calc
    calc,

    // Fix up CSS gradients with transparency for older browsers
    // https://github.com/gilmoreorless/postcss-gradient-transparency-fix
    gradientTransparencyFix,

    // Replace easing names from http://easings.net to `cubic-bezier()`.
    // https://github.com/postcss/postcss-easings
    easings,

    // Adds shorthand hex methods to rbga() values.
    // https://github.com/seaneking/postcss-hexrgba
    hexrgba,

    // Transform W3C CSS color function to more compatible CSS
    // https://github.com/postcss/postcss-color-function
    colorFunction,

    // Transform RGBA hexadecimal notations (#RRGGBBAA or #RGBA) to more compatible CSS (rgba())
    // https://github.com/postcss/postcss-color-hex-alpha
    colorHexAlpha,

    // Tries to fix all of flexbug's issues
    // https://github.com/luisrudge/postcss-flexbugs-fixes
    flexbugsFixes,

    // Writing simple and graceful Media Queries!
    // Support for CSS Media Queries Level 4: https://drafts.csswg.org/mediaqueries/#mq-range-context
    // https://github.com/postcss/postcss-media-minmax
    mediaMinmax,

    // Custom Media Queries
    // https://github.com/postcss/postcss-custom-media
    customMedia(),

    // Unwrap nested rules like how Sass does it.
    // https://github.com/postcss/postcss-nested
    nested,

    // Adds new pseudo-elements to inputs for easy cross-browser styling of their inner elements.
    // https://github.com/seaneking/postcss-input-style
    inputStyles,

    // Use the proposed :any-link pseudo-class in CSS
    // https://github.com/jonathantneal/postcss-pseudo-class-any-link
    pseudoClassAnyLink,

    // Transform :matches() W3C CSS pseudo class to more compatible CSS (simpler selectors)
    // https://github.com/postcss/postcss-selector-matches
    selectorMatches,

    // Add single and double colon peudo selectors
    // Normalizes e.g. `::before` to `:before` for wider browser support
    // https://github.com/axa-ch/postcss-pseudoelements
    pseudoelements,

    // Reduce z-index values with PostCSS.
    // https://github.com/ben-eb/postcss-zindex
    zindex,

    // Sass like @warn for PostCSS. Disabling internal usage of "postcss-reporter".
    // https://github.com/ben-eb/postcss-at-warn
    warn({
      silent: true
    }),

    // Parse CSS and add vendor prefixes to rules by Can I Use
    // https://github.com/postcss/autoprefixer
    autoprefixer(autoprefixerSettings),

    // Log PostCSS messages to the console
    reporter({
      clearMessages: true,
      filter: function(message) {
        return message.type !== "dependency"
      }
    })
  ]
}
