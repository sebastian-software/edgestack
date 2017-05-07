# About

**EdgeStack** combines modern React related technologies for effective development of React SPA/PWAs.
It allows applications to use React in a more framework-like approach where you have a single dependency
in your application managing indirect dependencies and build flow in one central place. Powered by
Universal React where we render the initial Markup on the server, too, we sport excellent SEO results.
For **EdgeStack** it's important to bet on high quality and maintained technologies. Each piece
in this development stack has been carefully chosen for the concepts it follows. We prefer good concepts in
future ready technologies over legacy and stable technologies. This is basically why we call it **EdgeStack**:
Offering a peak into the future of modern React development while being relatively stable for day-to-day 
development. **EdgeStack** is a possible solution for keeping this hassle outside of your actual 
application development and therefor scales very well when multiple applications have to be developed.



## Project Content

- Demo Application (`./src/app`, `./src/client`, `./src/server`)
- Exported API for Usage in Applications (`./src/api`)
- Universal React ready Hot Loading infrastructure (`./src/hotdev`)
- Build process based on a custom Webpack Factory (`./src/webpack`)



## Core Features

- Ready for Code Splitting and lazy loading based - typically based on routes.
- Deeply integrated localization and internationalization support.
- Very error tolerant development stack with clean and user friendly feedback. 
- CSS Isolation with CSS modules.



## View Layer

### React ([Project](https://github.com/facebook/react) | [Homepage](https://facebook.github.io/react/))

- Lightweight rendering engine with a small API surface to get used to in hours.
- Large ecosystem with lots of enterprises relying on it and hundreds of best-in-class add-on libraries.
- Consequent and rapid development to improve the core functionality.
- Heavily used by its owner on facebook.com.
- Compatible rendering alternatives like [Preact](https://preactjs.com/) (focus: smaller) or [Inferno](https://infernojs.org/) (focus: faster) are available suggesting that the taken general approach is rock solid. (Hint: We are working on making these available for you to choose from, too).
- Does not force or make assumptions of the rest of the development stack. Scales from easy to complex.

### Helmet ([Project])

- Controlling HTML HEAD elements using a nice JSX-based API



## Data Management

### Redux ([Project](https://github.com/reactjs/redux) | [Homepage](http://redux.js.org/) | [Video Course](https://egghead.io/courses/getting-started-with-redux))

- Single source of truth for the whole application state.
- Works excellent in combination with React Universal to share the preloaded state with the client application.
- Time traveling in developer tools to understand and reproduce different application states.
- Redux evolves the ideas of Flux, but avoids its complexity by taking cues from Elm.

### Apollo GraphQL Client ([Project](https://github.com/apollographql/apollo-client) | [Homepage](http://dev.apollodata.com/))

- Advanced data management: Queries, caching, mutations, optimistic UI, subscriptions, pagination, server-side rendering, prefetching, ...
- Internally built on Redux - works fine together with Redux development tools and custom reducers/actions.
- Far smaller and less complex than Relay while keeping most of its advanced features.
- Universal applicable with clients available for different frameworks and native SDKs.



## Tooling (Production Builds + Development Environment)

### Webpack ([Project](https://github.com/webpack/webpack) | [Homepage](https://webpack.js.org/))

- State of the art module bundler which can deal with different input files (JavaScript, CSS, images, etc.)
- Hot Module Reloading allows for excellent developer productivity. It effectively refreshes rebuilt modules using a WebSocket connection.
- Integrated [HardSource Plugin](https://github.com/mzgoddard/hard-source-webpack-plugin) for smart loader caching and dramatically increased rebuild times.
- Hashing for all output files using SHA256 and [Base62](https://www.npmjs.com/package/base62) for compact file names and permanent caching (ideal for CDNs).



## Styling

### PostCSS ([Project](https://github.com/postcss/postcss) | [Homepage](http://postcss.org/))

- A big challenge for large application development is the isolation of styles so that different components do not influence each other. We are using relying on CSS modules directly supported by the `css-loader` in Webpack which is actually powered by PostCSS.
- Instead of adding another parser and CSS transpiler to the development chain like Sass or Less we are using PostCSS for development enhancements, too. This includes typical features like imports, variables (Sass-like), mixins (Sass-like), conditionals, `calc()` expressions, etc.
- Using just one tool for the whole process is beneficial for build times and developer experience. Using different tools doubles or triples the build times (especially relevant in conjunction with Hot Module Reloading) and often times breaks other developer features like source maps (required for identifying source locations of implementations and errors).
- PostCSS is regarded as the CSS processing tool chain with lots of plugins to extend its functionality. 
- A lot of other tools are built on top of it like linters (stylelint), formatters (stylefmt), etc.

### CSS Modules ([Project](https://github.com/css-modules/css-modules))

- We use CSS modules for sandboxing styles of different components / areas from each other.
- The functionality is built into [CSS Loader by Webpack](https://github.com/webpack-contrib/css-loader#css-modules) and is enabled in EdgeStack.
- See also: [Benefits over other solutions](https://gist.github.com/DavidWells/9e4436608b834f1d3c0346db3631d774#gistcomment-2053946)

> "CSS frameworks cause problems by unnecessarily constraining our content to fit into a predefined grid. How can a CSS framework know what our content is? It can’t." – https://medium.com/simple-human/stop-using-device-breakpoints-b11a87e2625c

### Auto Prefixer ([Project](https://github.com/postcss/autoprefixer))

- Instead of manually managing writing prefixes or relying on custom mixins we are using a data driven approach ([Can I Use Database](http://caniuse.com/)).
- Does far more than just addition of prefixes e.g. fixing flexbox differences, supporting different linear gradient syntaxes, etc.

### Lost Grid ([Project](https://github.com/peterramsing/lost))

- Instead of assigning dozens of feature specific classes to each individual DOM node / React component we use more meaningful class names and attach features to them.
- The concept allows solving Responsive Layout in CSS instead of putting it into JSX and this way deep inside the data rendering logic (JS) where it does not belong to.

> CSS frameworks cause problems by unnecessarily constraining our content to fit into a predefined grid. How can a CSS framework know what our content is? It can’t. – Via: [Stop using device breakpoints](https://medium.com/simple-human/stop-using-device-breakpoints-b11a87e2625c)

### Grid Kiss ([Project](https://github.com/sylvainpolletvillard/postcss-grid-kiss))

- Alternative CSS-Grid-based ASCII-art powered Grid system which allows visually designing a Grid layout. 
- Makes designing grids visually and easy to understand. Especially long term and in larger development groups.
- Supports fallback for browsers without native CSS Grid support based on CSS `calc()`



## JavaScript Transpilation

### Babel ([Project](https://github.com/babel/babel) | [Homepage](https://babeljs.io/))

- Transpiling of modern JavaScript code for less modern clients.
- Uses Node v6 environment configuration for our NodeJS servers.



## Server

### Express




### CSP


### AsyncJS

### BlueBird Promises

### Cookie Parser for Express

### Body Parser for Express

### ExpressLocale

### DateFNS


### DotEnv


### Lean Intl


### Webpack plugins

#### Offline Plugin
#### Asset Plugin


"app-root-dir": "^1.0.2",
"assets-webpack-plugin": "^3.5.1",
"async": "^2.4.0",
"autoprefixer": "^6.7.7",
"babel-cli": "^6.24.1",
"babel-core": "^6.24.1",
"babel-jest": "^19.0.0",
"babel-loader": "^7.0.0",
"babel-plugin-lodash": "^3.2.11",
"babel-plugin-log-deprecated": "^1.1.0",
"babel-plugin-module-resolver": "^2.7.0",
"babel-plugin-react-intl": "^2.3.1",
"babel-plugin-syntax-dynamic-import": "^6.18.0",
"babel-plugin-transform-class-properties": "^6.24.1",
"babel-plugin-transform-object-rest-spread": "^6.23.0",
"babel-plugin-transform-react-constant-elements": "^6.23.0",
"babel-plugin-transform-react-inline-elements": "^6.22.0",
"babel-plugin-transform-react-jsx-self": "^6.22.0",
"babel-plugin-transform-react-jsx-source": "^6.22.0",
"babel-plugin-transform-react-remove-prop-types": "^0.4.4",
"babel-plugin-transform-runtime": "^6.23.0",
"babel-preset-babili": "^0.0.12",
"babel-preset-env": "^1.4.0",
"babel-preset-flow": "^6.23.0",
"babel-preset-react": "^6.24.1",
"babel-runtime": "^6.23.0",
"babel-template": "^6.24.1",
"babili-webpack-plugin": "^0.0.11",
"bluebird": "^3.5.0",
"body-parser": "^1.17.1",
"browserslist": "^2.1.1",
"builtin-modules": "^1.1.1",
"case-sensitive-paths-webpack-plugin": "^2.0.0",
"chalk": "^1.1.3",
"chokidar": "^1.6.1",
"chunk-manifest-webpack-plugin": "^1.1.0",
"classnames": "^2.2.5",
"clipboard": "^1.6.1",
"cookie-parser": "^1.4.3",
"cookiesjs": "^1.4.2",
"cross-env": "^4.0.0",
"css-loader": "^0.28.1",
"date-fns": "^1.28.4",
"dotenv": "^4.0.0",
"duplicate-package-checker-webpack-plugin": "^1.2.4",
"express": "^4.15.2",
"express-locale": "^1.0.1",
"extract-text-webpack-plugin": "^2.1.0",
"file-loader": "^0.11.1",
"find-root": "^1.0.0",
"fs-extra": "^3.0.1",
"graphql-tag": "^2.0.0",
"gulp": "^3.9.1",
"gulp-util": "^3.0.8",
"hard-source-webpack-plugin": "^0.3.12",
"helmet": "^3.6.0",
"hpp": "^0.2.2",
"html-webpack-plugin": "^2.28.0",
"identity-obj-proxy": "^3.0.0",
"intl-locales-supported": "^1.0.0",
"isomorphic-fetch": "^2.2.1",
"jest-cli": "^19.0.2",
"json-loader": "^0.5.4",
"lean-intl": "^2.0.0",
"load-plugins": "^2.1.2",
"loader-utils": "^1.1.0",
"localforage": "^1.5.0",
"lodash": "^4.17.4",
"lost": "^8.0.0",
"mdx-loader": "^1.0.0-beta.3",
"mdxc": "^1.0.0-beta.6",
"minimist": "^1.2.0",
"node-noop": "^1.0.0",
"node-notifier": "^5.1.2",
"offline-plugin": "^4.7.0",
"pleeease-filters": "^3.0.1",
"postcss": "^5.2.17",
"postcss-advanced-variables": "^1.2.2",
"postcss-assets": "^4.1.0",
"postcss-at-warn": "^1.0.0",
"postcss-calc": "^5.3.1",
"postcss-clearfix": "^1.0.0",
"postcss-color-function": "^3.0.0",
"postcss-color-hex-alpha": "^2.0.0",
"postcss-csso": "^2.0.0",
"postcss-custom-media": "^5.0.1",
"postcss-devtools": "^1.1.1",
"postcss-discard-comments": "^2.0.4",
"postcss-easings": "^0.3.0",
"postcss-flexbugs-fixes": "^2.1.1",
"postcss-font-family-system-ui": "^1.0.2",
"postcss-gradient-transparency-fix": "^1.0.3",
"postcss-grid-kiss": "^1.2.1",
"postcss-hexrgba": "^0.2.1",
"postcss-input-style": "^0.3.0",
"postcss-loader": "^1.3.3",
"postcss-magic-animations": "^0.3.0",
"postcss-media-minmax": "^2.1.2",
"postcss-nested": "^1.0.1",
"postcss-nested-ancestors": "^1.0.0",
"postcss-pseudoelements": "^4.0.0",
"postcss-reporter": "^3.0.0",
"postcss-responsive-type": "^0.5.1",
"postcss-sassy-mixins": "^2.0.0",
"postcss-selector-matches": "^2.0.5",
"postcss-simple-url": "^0.1.6",
"postcss-smart-import": "^0.6.12",
"postcss-transform-shortcut": "^2.0.1",
"postcss-unicode-characters": "^1.0.1",
"postcss-will-change": "^1.1.0",
"postcss-zindex": "^2.2.0",
"prompt": "^1.0.0",
"prop-types": "^15.5.8",
"raw-loader": "^0.5.1",
"react": "^15.5.4",
"react-apollo": "^1.2.0",
"react-dev-utils": "^0.5.2",
"react-dom": "^15.5.4",
"react-helmet": "^5.0.3",
"react-intl": "^2.2.3",
"react-redux": "^5.0.4",
"react-router": "^4.1.1",
"react-router-dom": "^4.1.1",
"react-tap-event-plugin": "^2.0.1",
"react-tree-walker": "2.1.1",
"redux": "^3.6.0",
"redux-immutable-state-invariant": "^2.0.0",
"redux-logger": "^3.0.1",
"redux-thunk": "^2.2.0",
"rimraf": "^2.6.1",
"serialize-javascript": "^1.3.0",
"serve-favicon": "^2.4.2",
"shrink-ray": "^0.1.3",
"source-map-support": "^0.4.15",
"style-loader": "^0.17.0",
"uuid": "^3.0.1",
"walker": "^1.0.7",
"webpack": "^2.5.0",
"webpack-bundle-analyzer": "^2.4.0",
"webpack-dev-middleware": "^1.10.2",
"webpack-hot-middleware": "^2.18.0",
"webpack-sources": "^0.2.3",
"yaml-loader": "^0.4.0"
"sanitize.css": "^5.0.0",
"source-sans-pro": "^2.0.10"
